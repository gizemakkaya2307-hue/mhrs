const { sendSuccess } = require('../utils/response');
const authService = require('../services/authService');

const register = async (req, res, next) => {
    try {
        const user = await authService.registerUser(req.body);
        return sendSuccess(res, 'Kullanıcı kaydı başarılı.', { user }, 201);
    } catch (error) {
        console.error('--- REGISTRATION ERROR DETAILS ---');
        console.error(error);
        if (error.stack) console.error(error.stack);
        return next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const payload = await authService.loginUser({
            email: req.body.email,
            password: req.body.password,
            ipAddress: req.ip
        });
        return sendSuccess(res, 'Giriş başarılı.', payload);
    } catch (error) {
        return next(error);
    }
};

const verify2FA = async (req, res, next) => {
    try {
        const payload = await authService.verify2FAUser(req.body);
        return sendSuccess(res, '2FA doğrulaması başarılı.', payload);
    } catch (error) {
        return next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const payload = await authService.refreshAccessToken(req.body?.token);
        return sendSuccess(res, 'Access token yenilendi.', payload);
    } catch (error) {
        return next(error);
    }
};

module.exports = { register, login, refreshToken, verify2FA };
