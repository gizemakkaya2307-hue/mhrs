const express = require('express');
const router = express.Router();
const timeSlotController = require('../controllers/timeSlotController');

/**
 * @swagger
 * tags:
 *   - name: TimeSlots
 *     description: Doktor müsait saat dilimleri
 */

/**
 * @swagger
 * /api/time-slots/doctor/{doctorId}:
 *   get:
 *     tags: [TimeSlots]
 *     summary: Doktorun müsait saat dilimlerini listeler
 *     security: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Belirli bir tarih için filtrele
 *     responses:
 *       200:
 *         description: Müsait saat dilimleri
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TimeSlot'
 */
router.get('/doctor/:doctorId', timeSlotController.getAvailableSlots);

module.exports = router;
