const express = require('express');
const router = express.Router();
const c = require('../controllers/enterpriseController');
const { authenticateToken, authorizeRoles, isDoctor, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Enterprise
 *     description: Kurumsal MHRS modülleri (doktor panel, sağlık profili, bildirimler, taslaklar, reçete kalemleri, lab sonuçları, admin dashboard, audit log)
 */

/**
 * @swagger
 * /api/enterprise/doctor-panel:
 *   get:
 *     tags: [Enterprise]
 *     summary: Doktor panel verilerini getirir (Sadece Doktor/Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doktor panel verileri
 *       403:
 *         description: Yetki hatası
 */
router.get('/doctor-panel', authenticateToken, isDoctor, c.listDoctorPanel);

/**
 * @swagger
 * /api/enterprise/health-profile:
 *   get:
 *     tags: [Enterprise]
 *     summary: Kullanıcının sağlık profilini getirir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sağlık profili
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthProfile'
 */
router.get('/health-profile', authenticateToken, c.getHealthProfile);

/**
 * @swagger
 * /api/enterprise/health-profile:
 *   put:
 *     tags: [Enterprise]
 *     summary: Sağlık profilini oluşturur veya günceller
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bloodType:
 *                 type: string
 *                 example: A Rh+
 *               allergies:
 *                 type: string
 *                 example: Penisilin
 *               chronicConditions:
 *                 type: string
 *                 example: Diyabet
 *               medications:
 *                 type: string
 *                 example: Metformin 500mg
 *               emergencyContact:
 *                 type: string
 *                 example: "05551234567"
 *     responses:
 *       200:
 *         description: Sağlık profili güncellendi
 */
router.put('/health-profile', authenticateToken, c.upsertHealthProfile);

/**
 * @swagger
 * /api/enterprise/notifications:
 *   get:
 *     tags: [Enterprise]
 *     summary: Kullanıcının bildirimlerini listeler
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bildirim listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
router.get('/notifications', authenticateToken, c.listNotifications);

/**
 * @swagger
 * /api/enterprise/notifications:
 *   post:
 *     tags: [Enterprise]
 *     summary: Yeni bildirim oluşturur (Doktor/Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message, userId]
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               userId:
 *                 type: integer
 *               type:
 *                 type: string
 *                 default: INFO
 *     responses:
 *       201:
 *         description: Bildirim oluşturuldu
 */
router.post('/notifications', authenticateToken, authorizeRoles('ADMIN', 'DOCTOR'), c.createNotification);

/**
 * @swagger
 * /api/enterprise/notifications/{id}/read:
 *   patch:
 *     tags: [Enterprise]
 *     summary: Bildirimi okundu olarak işaretler
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
 *         description: Bildirim okundu olarak işaretlendi
 */
router.patch('/notifications/:id/read', authenticateToken, c.markNotificationRead);

/**
 * @swagger
 * /api/enterprise/appointment-drafts:
 *   get:
 *     tags: [Enterprise]
 *     summary: Kullanıcının randevu taslaklarını listeler
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Taslak listesi
 */
router.get('/appointment-drafts', authenticateToken, c.listAppointmentDrafts);

/**
 * @swagger
 * /api/enterprise/appointment-drafts:
 *   post:
 *     tags: [Enterprise]
 *     summary: Randevu taslağı kaydeder (çok adımlı akış)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               step:
 *                 type: integer
 *               city:
 *                 type: string
 *               district:
 *                 type: string
 *               clinicId:
 *                 type: integer
 *               doctorId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Taslak kaydedildi
 */
router.post('/appointment-drafts', authenticateToken, c.saveAppointmentDraft);

/**
 * @swagger
 * /api/enterprise/prescription-items/{appointmentId}:
 *   get:
 *     tags: [Enterprise]
 *     summary: Randevuya ait reçete kalemlerini listeler
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
 *         description: Reçete kalemleri
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PrescriptionItem'
 */
router.get('/prescription-items/:appointmentId', authenticateToken, c.listPrescriptionItems);

/**
 * @swagger
 * /api/enterprise/prescription-items:
 *   post:
 *     tags: [Enterprise]
 *     summary: Reçete kalemi ekler (Doktor/Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId, medicineName, dosage, frequency, durationDays]
 *             properties:
 *               appointmentId:
 *                 type: integer
 *               medicineName:
 *                 type: string
 *                 example: Paracetamol
 *               dosage:
 *                 type: string
 *                 example: 500mg
 *               frequency:
 *                 type: string
 *                 example: Günde 3 kez
 *               durationDays:
 *                 type: integer
 *                 example: 7
 *               instructions:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reçete kalemi eklendi
 */
router.post('/prescription-items', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), c.addPrescriptionItem);

/**
 * @swagger
 * /api/enterprise/lab-results/{appointmentId}:
 *   get:
 *     tags: [Enterprise]
 *     summary: Randevuya ait laboratuvar sonuçlarını listeler
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
 *         description: Lab sonuçları
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabResult'
 */
router.get('/lab-results/:appointmentId', authenticateToken, c.listLabResults);

/**
 * @swagger
 * /api/enterprise/lab-results:
 *   post:
 *     tags: [Enterprise]
 *     summary: Lab sonucu ekler (Doktor/Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId, testName, resultValue]
 *             properties:
 *               appointmentId:
 *                 type: integer
 *               testName:
 *                 type: string
 *                 example: Hemoglobin
 *               resultValue:
 *                 type: string
 *                 example: "14.5"
 *               unit:
 *                 type: string
 *                 example: g/dL
 *               referenceRange:
 *                 type: string
 *                 example: 12-16
 *               status:
 *                 type: string
 *                 enum: [NORMAL, ABNORMAL, CRITICAL]
 *     responses:
 *       201:
 *         description: Lab sonucu eklendi
 */
router.post('/lab-results', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), c.addLabResult);

/**
 * @swagger
 * /api/enterprise/admin-dashboard:
 *   get:
 *     tags: [Enterprise]
 *     summary: Admin dashboard metrikleri (Sadece Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard verileri
 *       403:
 *         description: Yetki hatası
 */
router.get('/admin-dashboard', authenticateToken, isAdmin, c.adminDashboard);

/**
 * @swagger
 * /api/enterprise/audit-logs:
 *   get:
 *     tags: [Enterprise]
 *     summary: Audit loglarını listeler (Sadece Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Audit log listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuditLog'
 */
router.get('/audit-logs', authenticateToken, isAdmin, c.listAuditLogs);

/**
 * @swagger
 * /api/enterprise/slot-update:
 *   post:
 *     tags: [Enterprise]
 *     summary: WebSocket üzerinden slot güncelleme sinyali gönderir (Doktor/Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: integer
 *               slotId:
 *                 type: integer
 *               isBooked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Slot güncelleme sinyali gönderildi
 */
router.post('/slot-update', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), c.emitSlotUpdate);

module.exports = router;
