// =============================================
// ARCHIVO: src/controllers/productController.js
// =============================================
const productPool = require('../config/database').pool;

// Obtener todos los productos
exports.getAllProducts = async (req, res, next) => {
  try {
    const result = await productPool.query(
      'SELECT * FROM productos WHERE activo = true ORDER BY nombre'
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Crear producto
exports.createProduct = async (req, res, next) => {
  try {
    const { nombre, precio, stock } = req.body;

    const result = await productPool.query(
      'INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3) RETURNING *',
      [nombre, precio, stock || 0]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar producto
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;

    const result = await productPool.query(
      'UPDATE productos SET nombre = $1, precio = $2, stock = $3 WHERE id = $4 AND activo = true RETURNING *',
      [nombre, precio, stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar producto
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await productPool.query(
      'UPDATE productos SET activo = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};