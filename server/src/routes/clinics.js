const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const cache = require('../middleware/cache');

/**
 * @swagger
 * tags:
 *   - name: Clinics
 *     description: Poliklinik yönetimi
 */

/**
 * @swagger
 * /api/clinics:
 *   get:
 *     tags: [Clinics]
 *     summary: Tüm poliklinikleri listeler (cache destekli)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Şehre göre filtrele
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: İlçeye göre filtrele
 *     responses:
 *       200:
 *         description: Poliklinik listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Clinic'
 */
router.get('/', cache, clinicController.getClinics);

/**
 * @swagger
 * /api/clinics:
 *   post:
 *     tags: [Clinics]
 *     summary: Yeni poliklinik ekler (Sadece Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, city, district]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Kardiyoloji Polikliniği
 *               city:
 *                 type: string
 *                 example: İstanbul
 *               district:
 *                 type: string
 *                 example: Fatih
 *     responses:
 *       201:
 *         description: Poliklinik oluşturuldu
 *       403:
 *         description: Yetki hatası
 */
router.post('/', authenticateToken, isAdmin, clinicController.createClinic);

/**
 * @swagger
 * /api/clinics/{id}:
 *   delete:
 *     tags: [Clinics]
 *     summary: Polikliniği siler (Sadece Admin)
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
 *         description: Poliklinik silindi
 */
router.delete('/:id', authenticateToken, isAdmin, clinicController.deleteClinic);

module.exports = router;
