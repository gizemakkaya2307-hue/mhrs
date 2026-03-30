const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const cache = require('../middleware/cache');

/**
 * @swagger
 * tags:
 *   - name: Doctors
 *     description: Doktor yönetimi (listeleme, ekleme, silme)
 */

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     tags: [Doctors]
 *     summary: Tüm doktorları listeler (cache destekli)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
 *         description: Branşa göre filtrele (Kardiyoloji, Göz vb.)
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Şehre göre filtrele
 *     responses:
 *       200:
 *         description: Doktor listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 */
router.get('/', cache, doctorController.getDoctors);

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     tags: [Doctors]
 *     summary: Yeni doktor ekler (Sadece Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, branch, hospital]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. Ayşe Kaya
 *               branch:
 *                 type: string
 *                 example: Kardiyoloji
 *               hospital:
 *                 type: string
 *                 example: Ankara Şehir Hastanesi
 *               clinicId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Doktor oluşturuldu
 *       403:
 *         description: Yetki hatası (Sadece Admin)
 */
router.post('/', authenticateToken, isAdmin, doctorController.createDoctor);

/**
 * @swagger
 * /api/doctors/{id}:
 *   delete:
 *     tags: [Doctors]
 *     summary: Doktoru siler (Sadece Admin)
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
 *         description: Doktor silindi
 *       403:
 *         description: Yetki hatası
 */
router.delete('/:id', authenticateToken, isAdmin, doctorController.deleteDoctor);

module.exports = router;
