const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: UX
 *     description: Kullanıcı deneyimi modülleri (favoriler, E-Nabız raporları)
 */

/**
 * @swagger
 * /api/ux/favorites:
 *   get:
 *     tags: [UX]
 *     summary: Kullanıcının favori doktorlarını listeler
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favori doktor listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   doctorId:
 *                     type: integer
 *                   doctor:
 *                     $ref: '#/components/schemas/Doctor'
 */
router.get('/favorites', authenticateToken, favoriteController.getFavorites);

/**
 * @swagger
 * /api/ux/favorites/toggle:
 *   post:
 *     tags: [UX]
 *     summary: Doktoru favorilere ekler/çıkarır (toggle)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId]
 *             properties:
 *               doctorId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Favori durumu değiştirildi
 */
router.post('/favorites/toggle', authenticateToken, favoriteController.toggleFavorite);

/**
 * @swagger
 * /api/ux/e-nabiz:
 *   get:
 *     tags: [UX]
 *     summary: Kullanıcının E-Nabız sağlık geçmişini (raporlarını) getirir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sağlık geçmişi raporları
 */
router.get('/e-nabiz', authenticateToken, reportController.getHealthHistory);

/**
 * @swagger
 * /api/ux/reports:
 *   post:
 *     tags: [UX]
 *     summary: Yeni sağlık raporu ekler
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, appointmentId]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Muayene Raporu
 *               content:
 *                 type: string
 *                 example: Hasta genel sağlık durumu iyi.
 *               appointmentId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Rapor oluşturuldu
 */
router.post('/reports', authenticateToken, reportController.addReport);

module.exports = router;
