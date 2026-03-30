const express = require('express');
const router = express.Router();
const dependentController = require('../controllers/dependentController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Dependents
 *     description: Bağlı kişi yönetimi (çocuk, anne, baba vb.)
 */

/**
 * @swagger
 * /api/dependents:
 *   get:
 *     tags: [Dependents]
 *     summary: Kullanıcının bağlı kişilerini listeler
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bağlı kişi listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dependent'
 */
router.get('/', authenticateToken, dependentController.getDependents);

/**
 * @swagger
 * /api/dependents:
 *   post:
 *     tags: [Dependents]
 *     summary: Yeni bağlı kişi ekler (çocuk, anne vb.)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, tcNo, birthDate, relation]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ali Yılmaz
 *               tcNo:
 *                 type: string
 *                 example: "98765432101"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "2015-06-15"
 *               relation:
 *                 type: string
 *                 enum: [Çocuk, Anne, Baba, Eş]
 *                 example: Çocuk
 *     responses:
 *       201:
 *         description: Bağlı kişi eklendi
 */
router.post('/', authenticateToken, dependentController.addDependent);

/**
 * @swagger
 * /api/dependents/{id}:
 *   delete:
 *     tags: [Dependents]
 *     summary: Bağlı kişiyi siler
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
 *         description: Bağlı kişi silindi
 */
router.delete('/:id', authenticateToken, dependentController.deleteDependent);

module.exports = router;
