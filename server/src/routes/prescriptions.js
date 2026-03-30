const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomUUID();
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   - name: Prescriptions
 *     description: Reçete yönetimi (dosya yükleme, listeleme, silme)
 */

/**
 * @swagger
 * /api/prescriptions/appointment/{appointmentId}:
 *   get:
 *     tags: [Prescriptions]
 *     summary: Bir randevuya ait reçeteleri listeler
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
 *         description: Reçete listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescription'
 */
router.get('/appointment/:appointmentId', authenticateToken, prescriptionController.getPrescriptionsByAppointment);

/**
 * @swagger
 * /api/prescriptions/upload:
 *   post:
 *     tags: [Prescriptions]
 *     summary: Reçete dosyası yükler
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               appointmentId:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reçete yüklendi
 */
router.post('/upload', authenticateToken, upload.single('file'), prescriptionController.uploadPrescription);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   delete:
 *     tags: [Prescriptions]
 *     summary: Reçeteyi siler (Sadece Admin)
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
 *         description: Reçete silindi
 */
router.delete('/:id', authenticateToken, isAdmin, prescriptionController.deletePrescription);

module.exports = router;
