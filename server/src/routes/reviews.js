const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken: auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Reviews
 *     description: Doktor değerlendirme ve yorum sistemi
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Doktora yorum/değerlendirme ekler
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, rating]
 *             properties:
 *               doctorId:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Değerlendirme eklendi
 */
router.post('/', auth, reviewController.addReview);

/**
 * @swagger
 * /api/reviews/doctor/{doctorId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Bir doktorun tüm değerlendirmelerini listeler
 *     security: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Değerlendirme listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get('/doctor/:doctorId', reviewController.getDoctorReviews);

module.exports = router;
