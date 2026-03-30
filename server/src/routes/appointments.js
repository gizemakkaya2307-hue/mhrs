const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Appointments
 *     description: Randevu yönetimi (listeleme, oluşturma, iptal)
 */

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Giriş yapmış kullanıcının randevularını listeler
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Randevu listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Yetkisiz erişim
 */
router.get('/', authenticateToken, appointmentController.getAppointments);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Yeni randevu oluşturur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, timeSlotId]
 *             properties:
 *               doctorId:
 *                 type: integer
 *                 example: 1
 *               timeSlotId:
 *                 type: integer
 *                 example: 5
 *               notes:
 *                 type: string
 *                 example: Baş ağrısı şikayeti
 *               dependentId:
 *                 type: integer
 *                 nullable: true
 *                 description: Bağlı kişi adına randevu almak için
 *     responses:
 *       201:
 *         description: Randevu başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Seçilen saat dilimi müsait değil
 *       403:
 *         description: Cezalı durumdasınız
 */
router.post('/', authenticateToken, appointmentController.createAppointment);

/**
 * @swagger
 * /api/appointments/quick:
 *   post:
 *     tags: [Appointments]
 *     summary: İl, ilçe veya klinik bazında hızlı boş randevu arar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: string
 *               district:
 *                 type: string
 *               clinicId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Bulunan en yakın tarihli uygun randevu slotu ve doktor bilgisi
 *       404:
 *         description: Uygun randevu bulunamadı
 */
router.post('/quick', authenticateToken, appointmentController.getQuickAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     tags: [Appointments]
 *     summary: Randevuyu iptal eder (24 saatten az kala 15 gün ceza)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Randevu ID
 *     responses:
 *       200:
 *         description: Randevu iptal edildi
 *       403:
 *         description: Yetkisiz işlem
 *       404:
 *         description: Randevu bulunamadı
 */
router.delete('/:id', authenticateToken, appointmentController.deleteAppointment);

module.exports = router;
