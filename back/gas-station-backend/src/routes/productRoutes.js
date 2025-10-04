const express = require('express');
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Obtener todos los productos
router.get('/', getAllProducts);

// Crear producto
router.post('/', createProduct);

// Actualizar producto
router.put('/:id', updateProduct);

// Eliminar producto
router.delete('/:id', deleteProduct);

module.exports = router;