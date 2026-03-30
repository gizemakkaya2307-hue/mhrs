const express = require('express');
const router = express.Router();
const c = require('../controllers/doctorPanelController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Doctor Panel
 *     description: Doktora özel panel endpointleri (günlük randevular, hasta geçmişi, klinik not, durum güncelleme)
 */

/**
 * @swagger
 * /api/doctor-panel/appointments:
 *   get:
 *     tags: [Doctor Panel]
 *     summary: Doktorun günlük randevularını listeler (yaklaşan/geçmiş)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Belirli bir tarih (varsayılan bugün)
 *     responses:
 *       200:
 *         description: Günlük randevu listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       403:
 *         description: Yetki hatası
 */
router.get('/appointments', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), c.getMyDailyAppointments);

/**
 * @swagger
 * /api/doctor-panel/appointments/{appointmentId}:
 *   get:
 *     tags: [Doctor Panel]
 *     summary: Randevu detayını getirir
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Randevu detayı
 *       404:
 *         description: Randevu bulunamadı
 */
router.get('/appointments/:appointmentId', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), c.getAppointmentDetail);

/**
 * @swagger
 * /api/doctor-panel/patients/{patientUserId}/history:
 *   get:
 *     tags: [Doctor Panel]
 *     summary: Hastanın geçmiş randevu ve sağlık kayıtlarını getirir
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientUserId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hasta geçmişi
 */
router.get('/patients/:patientUserId/history', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), c.getPatientHistory);

/**
 * @swagger
 * /api/doctor-panel/appointments/{appointmentId}/clinical-note:
 *   post:
 *     tags: [Doctor Panel]
 *     summary: Randevuya klinik not (tanı ve muayene notu) ekler
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [diagnosis, examinationNote]
 *             properties:
 *               diagnosis:
 *                 type: string
 *                 example: Üst solunum yolu enfeksiyonu
 *               examinationNote:
 *                 type: string
 *                 example: Boğaz kızarık, ateş 38.2°C
 *     responses:
 *       201:
 *         description: Klinik not eklendi
 */
router.post('/appointments/:appointmentId/clinical-note', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), c.addClinicalNote);

/**
 * @swagger
 * /api/doctor-panel/appointments/{appointmentId}/status:
 *   patch:
 *     tags: [Doctor Panel]
 *     summary: Randevu durumunu günceller (CONFIRMED, COMPLETED, CANCELLED)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Randevu durumu güncellendi
 */
router.patch('/appointments/:appointmentId/status', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), c.setAppointmentStatus);

module.exports = router;
