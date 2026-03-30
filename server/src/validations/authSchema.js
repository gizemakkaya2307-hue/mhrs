const { z } = require('zod');

const registerSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
    password: z
        .string()
        .min(8, 'Şifre en az 8 karakter olmalıdır.')
        .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir.')
        .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir.')
        .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir.')
        .regex(/[^A-Za-z0-9]/, 'Şifre en az bir özel karakter içermelidir.'),
    name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır.'),
    tcNo: z.string().length(11, 'TC Kimlik Numarası 11 haneli olmalıdır.').regex(/^\d+$/, 'TC No sadece rakamlardan oluşmalıdır.')
});

const loginSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
    password: z.string().min(1, 'Şifre gereklidir.')
});

const verify2FASchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
    code: z.string().length(6, 'Doğrulama kodu 6 haneli olmalıdır.')
});

const refreshTokenSchema = z.object({
    token: z.string().min(10, 'Refresh token zorunludur.')
});

module.exports = { registerSchema, loginSchema, verify2FASchema, refreshTokenSchema };
