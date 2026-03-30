const express = require('express');
const router = express.Router();
const unavailabilityController = require('../controllers/unavailabilityController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Unavailabilities
 *     description: Doktor müsait olmama (izin, ameliyat vb.) yönetimi
 */

/**
 * @swagger
 * /api/unavailabilities/{doctorId}:
 *   get:
 *     tags: [Unavailabilities]
 *     summary: Doktorun müsait olmadığı zamanları listeler
 *     security: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Müsait olmama listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Unavailability'
 */
router.get('/:doctorId', unavailabilityController.getUnavailabilities);

/**
 * @swagger
 * /api/unavailabilities:
 *   post:
 *     tags: [Unavailabilities]
 *     summary: Doktora müsait olmama kaydı ekler
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, startTime, endTime, reason]
 *             properties:
 *               doctorId:
 *                 type: integer
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *                 example: Yıllık izin
 *     responses:
 *       201:
 *         description: Kayıt oluşturuldu
 */
router.post('/', authenticateToken, unavailabilityController.addUnavailability);

module.exports = router;
