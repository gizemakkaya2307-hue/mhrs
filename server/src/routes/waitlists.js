const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Waitlists
 *     description: Bekleme listesi yönetimi
 */

/**
 * @swagger
 * /api/waitlists:
 *   post:
 *     tags: [Waitlists]
 *     summary: Bekleme listesine katıl
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, date]
 *             properties:
 *               doctorId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Bekleme listesine eklendi
 */
router.post('/', authenticateToken, waitlistController.joinWaitlist);

/**
 * @swagger
 * /api/waitlists/{id}:
 *   delete:
 *     tags: [Waitlists]
 *     summary: Bekleme listesinden ayrıl
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
 *         description: Bekleme listesinden çıkarıldı
 */
router.delete('/:id', authenticateToken, waitlistController.leaveWaitlist);

/**
 * @swagger
 * /api/waitlists:
 *   get:
 *     tags: [Waitlists]
 *     summary: Kullanıcının bekleme listelerini getirir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bekleme listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WaitingList'
 */
router.get('/', authenticateToken, waitlistController.getUserWaitlists);

module.exports = router;
