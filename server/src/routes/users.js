const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Kullanıcı profili ve admin kullanıcı yönetimi
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Giriş yapmış kullanıcının profil bilgilerini getirir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı profili
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/profile', authenticateToken, userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Kullanıcı profilini günceller
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profil güncellendi
 */
router.put('/profile', authenticateToken, userController.updateProfile);

/**
 * @swagger
 * /api/users/2fa/toggle:
 *   post:
 *     tags: [Users]
 *     summary: İki faktörlü doğrulamayı aç/kapat
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA durumu değiştirildi
 */
router.post('/2fa/toggle', authenticateToken, userController.toggle2FA);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Tüm kullanıcıları listeler (Sadece Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Yetki hatası
 */
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     tags: [Users]
 *     summary: Kullanıcı rolünü günceller (Sadece Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, DOCTOR, ADMIN]
 *     responses:
 *       200:
 *         description: Rol güncellendi
 */
router.put('/:id/role', authenticateToken, isAdmin, userController.updateUserRole);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Kullanıcıyı siler (Sadece Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kullanıcı silindi
 */
router.delete('/:id', authenticateToken, isAdmin, userController.deleteUser);

module.exports = router;
