const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createHttpError } = require('../utils/response');
const { addNotificationToQueue } = require('../utils/queue');

const prisma = new PrismaClient();
const failedLoginAttempts = new Map();

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';
const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_MS = 10 * 60 * 1000;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const sanitizeText = (value) => String(value || '').trim();

const isBlocked = (key) => {
    const state = failedLoginAttempts.get(key);
    if (!state) return false;
    if (state.blockUntil && Date.now() < state.blockUntil) return true;
    if (state.blockUntil && Date.now() >= state.blockUntil) {
        failedLoginAttempts.delete(key);
        return false;
    }
    return false;
};

const markFailedAttempt = (key) => {
    const state = failedLoginAttempts.get(key) || { count: 0, blockUntil: null };
    state.count += 1;
    if (state.count >= MAX_FAILED_ATTEMPTS) state.blockUntil = Date.now() + BLOCK_MS;
    failedLoginAttempts.set(key, state);
};

const clearFailedAttempts = (key) => failedLoginAttempts.delete(key);

const getDoctorIdByUserId = async (userId, role) => {
    if (role !== 'DOCTOR') return null;
    const doctor = await prisma.doctor.findUnique({ where: { userId }, select: { id: true } });
    return doctor?.id || null;
};

const buildTokenPayload = (user, doctorId = null) => ({
    userId: user.id,
    email: user.email,
    role: user.role,
    doctorId
});

const createTokens = (payload) => {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'refresh_gizli_anahtar', { expiresIn: REFRESH_EXPIRES_IN });
    return { accessToken, refreshToken };
};

const registerUser = async ({ name, email, password, tcNo }) => {
    const cleanName = sanitizeText(name);
    const cleanEmail = normalizeEmail(email);
    const cleanTcNo = sanitizeText(tcNo);

    const existing = await prisma.user.findFirst({
        where: {
            OR: [{ email: cleanEmail }, { tcNo: cleanTcNo }]
        },
        select: { id: true, email: true, tcNo: true }
    });
    if (existing) {
        if (existing.email === cleanEmail) throw createHttpError(409, 'Bu e-posta adresi zaten kullanılıyor.');
        throw createHttpError(409, 'Bu TC Kimlik Numarası zaten kullanılıyor.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: {
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
            tcNo: cleanTcNo,
            role: 'USER'
        }
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role };
};

const loginUser = async ({ email, password, ipAddress = 'unknown' }) => {
    const cleanEmail = normalizeEmail(email);
    const attemptKey = `${cleanEmail}:${ipAddress}`;
    if (isBlocked(attemptKey)) {
        throw createHttpError(401, 'Çok fazla hatalı giriş denemesi. Lütfen 10 dakika sonra tekrar deneyin.');
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
        markFailedAttempt(attemptKey);
        throw createHttpError(401, 'Geçersiz e-posta veya şifre.');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        markFailedAttempt(attemptKey);
        throw createHttpError(401, 'Geçersiz e-posta veya şifre.');
    }
    clearFailedAttempts(attemptKey);

    if (user.is2FAEnabled) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.user.update({
            where: { id: user.id },
            data: { twoFACode: code }
        });
        await addNotificationToQueue({
            type: 'email',
            to: user.email,
            subject: 'Giriş Doğrulama Kodu',
            body: `Sisteme giriş için doğrulama kodunuz: ${code}`
        });
        return {
            require2FA: true,
            email: user.email,
            message: 'Lütfen e-posta adresinize gönderilen 6 haneli kodu giriniz.'
        };
    }

    const doctorId = await getDoctorIdByUserId(user.id, user.role);
    const payload = buildTokenPayload(user, doctorId);
    const { accessToken, refreshToken } = createTokens(payload);

    return {
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, doctorId }
    };
};

const verify2FAUser = async ({ email, code }) => {
    const cleanEmail = normalizeEmail(email);
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user || user.twoFACode !== code) throw createHttpError(401, 'Geçersiz veya süresi dolmuş doğrulama kodu.');

    await prisma.user.update({ where: { email: cleanEmail }, data: { twoFACode: null } });
    const doctorId = await getDoctorIdByUserId(user.id, user.role);
    const payload = buildTokenPayload(user, doctorId);
    const { accessToken, refreshToken } = createTokens(payload);
    return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, doctorId } };
};

const refreshAccessToken = async (refreshTokenValue) => {
    if (!refreshTokenValue) throw createHttpError(401, 'Refresh token zorunludur.');

    let decoded;
    try {
        decoded = jwt.verify(refreshTokenValue, process.env.REFRESH_TOKEN_SECRET || 'refresh_gizli_anahtar');
    } catch (_e) {
        throw createHttpError(401, 'Geçersiz veya süresi dolmuş refresh token.');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) throw createHttpError(401, 'Kullanıcı bulunamadı.');

    const doctorId = await getDoctorIdByUserId(user.id, user.role);
    const payload = buildTokenPayload(user, doctorId);
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
    return { accessToken };
};

module.exports = {
    normalizeEmail,
    registerUser,
    loginUser,
    verify2FAUser,
    refreshAccessToken
};
