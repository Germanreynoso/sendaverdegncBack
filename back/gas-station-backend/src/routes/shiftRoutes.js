const express = require('express');
const {
  getActiveShift,
  openShift,
  updateSurtidor,
  addProductSale,
  closeShift,
  getAllShifts
} = require('../controllers/shiftController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

/**
 * @swagger
 * /api/shifts/active:
 *   get:
 *     summary: Obtener turno activo
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Turno activo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 shift:
 *                   $ref: '#/components/schemas/Shift'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No hay turno activo
 */
router.get('/active', getActiveShift);

/**
 * @swagger
 * /api/shifts:
 *   get:
 *     summary: Obtener todos los turnos
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de turnos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 shifts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shift'
 *       401:
 *         description: No autorizado
 */
router.get('/', getAllShifts);

/**
 * @swagger
 * /api/shifts:
 *   post:
 *     summary: Abrir un nuevo turno
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - initial_cash
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               initial_cash:
 *                 type: number
 *                 format: float
 *                 example: 100.00
 *     responses:
 *       201:
 *         description: Turno abierto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 shift:
 *                   $ref: '#/components/schemas/Shift'
 *       400:
 *         description: Datos inválidos o turno ya activo
 *       401:
 *         description: No autorizado
 */
router.post('/', openShift);

/**
 * @swagger
 * /api/shifts/surtidor/{id}:
 *   put:
 *     summary: Actualizar surtidor
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del surtidor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fuel_level:
 *                 type: number
 *                 format: float
 *                 example: 500.0
 *     responses:
 *       200:
 *         description: Surtidor actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Surtidor actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.put('/surtidor/:id', updateSurtidor);

/**
 * @swagger
 * /api/shifts/sale:
 *   post:
 *     summary: Agregar venta de producto
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *               - total_amount
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: number
 *                 format: float
 *                 example: 10.5
 *               total_amount:
 *                 type: number
 *                 format: float
 *                 example: 15.75
 *     responses:
 *       201:
 *         description: Venta agregada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sale:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: number
 *                       format: float
 *                       example: 10.5
 *                     total_amount:
 *                       type: number
 *                       format: float
 *                       example: 15.75
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/sale', addProductSale);

/**
 * @swagger
 * /api/shifts/{id}/close:
 *   put:
 *     summary: Cerrar turno
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - final_cash
 *             properties:
 *               final_cash:
 *                 type: number
 *                 format: float
 *                 example: 150.00
 *     responses:
 *       200:
 *         description: Turno cerrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 shift:
 *                   $ref: '#/components/schemas/Shift'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Turno no encontrado
 */
router.put('/:id/close', closeShift);

module.exports = router;