const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const rateLimit = require('express-rate-limit');
const { registerSchema, loginSchema, verify2FASchema, refreshTokenSchema } = require('../validations/authSchema');

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin.',
        errors: []
    }
});

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Kimlik doğrulama işlemleri (kayıt, giriş, 2FA, token yenileme)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Yeni kullanıcı kaydı oluşturur
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, tcNo]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ahmet Yılmaz
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmet@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Strong!123
 *               tcNo:
 *                 type: string
 *                 example: "12345678901"
 *     responses:
 *       201:
 *         description: Kayıt başarılı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       409:
 *         description: E-posta veya TC No zaten kullanılıyor
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Kullanıcı girişi (JWT token döner)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@mhrs.gov.tr
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Giriş başarılı veya 2FA gerekli
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Geçersiz kimlik bilgileri
 */
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/verify-2fa:
 *   post:
 *     tags: [Auth]
 *     summary: İki faktörlü doğrulama kodunu onaylar
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA doğrulaması başarılı
 *       401:
 *         description: Geçersiz doğrulama kodu
 */
router.post('/verify-2fa', validate(verify2FASchema), authController.verify2FA);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Access token yenilemek için refresh token gönderir
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: Yeni access token döner
 *       401:
 *         description: Geçersiz refresh token
 */
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

module.exports = router;
