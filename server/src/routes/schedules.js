const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Schedules
 *     description: Doktor çalışma takvimi ve slot oluşturma
 */

/**
 * @swagger
 * /api/schedules/generate:
 *   post:
 *     tags: [Schedules]
 *     summary: Doktor için zaman dilimi slotları oluşturur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, date, startHour, endHour, intervalMinutes]
 *             properties:
 *               doctorId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-01"
 *               startHour:
 *                 type: integer
 *                 example: 9
 *               endHour:
 *                 type: integer
 *                 example: 17
 *               intervalMinutes:
 *                 type: integer
 *                 example: 20
 *     responses:
 *       201:
 *         description: Slotlar oluşturuldu
 */
router.post('/generate', authenticateToken, scheduleController.generateSlots);

/**
 * @swagger
 * /api/schedules/doctor/{doctorId}:
 *   delete:
 *     tags: [Schedules]
 *     summary: Doktorun tüm slotlarını siler
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Slotlar silindi
 */
router.delete('/doctor/:doctorId', authenticateToken, scheduleController.deleteDoctorSlots);

module.exports = router;
