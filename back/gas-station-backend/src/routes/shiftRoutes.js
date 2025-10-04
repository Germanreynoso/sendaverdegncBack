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

// Obtener turno activo
router.get('/active', getActiveShift);

// Obtener todos los turnos
router.get('/', getAllShifts);

// Abrir turno
router.post('/', openShift);

// Actualizar surtidor
router.put('/surtidor/:id', updateSurtidor);

// Agregar venta de producto
router.post('/sale', addProductSale);

// Cerrar turno
router.put('/:id/close', closeShift);

module.exports = router;