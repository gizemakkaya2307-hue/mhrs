const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Stats
 *     description: Dashboard istatistikleri
 */

/**
 * @swagger
 * /api/stats/dashboard:
 *   get:
 *     tags: [Stats]
 *     summary: Kullanıcının dashboard istatistiklerini getirir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard istatistikleri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAppointments:
 *                   type: integer
 *                 upcomingAppointments:
 *                   type: integer
 *                 completedAppointments:
 *                   type: integer
 *                 cancelledAppointments:
 *                   type: integer
 */
router.get('/dashboard', authenticateToken, statsController.getDashboardStats);

module.exports = router;
