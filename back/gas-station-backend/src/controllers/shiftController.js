// =============================================
// ARCHIVO: src/controllers/shiftController.js
// =============================================
const shiftPool = require('../config/database').pool;

// Obtener turno activo
exports.getActiveShift = async (req, res, next) => {
  try {
    const result = await shiftPool.query(
      `SELECT t.*, 
              COALESCE(json_agg(DISTINCT jsonb_build_object('id', s.id, 'numero_surtidor', s.numero_surtidor, 'lectura_inicial', s.lectura_inicial, 'lectura_final', s.lectura_final)) FILTER (WHERE s.id IS NOT NULL), '[]') as surtidores,
              COALESCE(json_agg(DISTINCT jsonb_build_object('id', vp.id, 'producto_id', vp.producto_id, 'producto_nombre', vp.producto_nombre, 'cantidad', vp.cantidad, 'precio_unitario', vp.precio_unitario, 'total', vp.total)) FILTER (WHERE vp.id IS NOT NULL), '[]') as ventas
       FROM turnos t
       LEFT JOIN surtidores s ON t.id = s.turno_id
       LEFT JOIN ventas_productos vp ON t.id = vp.turno_id
       WHERE t.estado = 'abierto'
       GROUP BY t.id
       LIMIT 1`
    );

    res.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    next(error);
  }
};

// Abrir turno
exports.openShift = async (req, res, next) => {
  try {
    const { fecha, tipo } = req.body;
    const encargadoId = req.user.id;
    const encargadoNombre = `${req.user.nombre} ${req.user.apellido}`;

    // Verificar que no haya turno abierto
    const activeShift = await shiftPool.query(
      'SELECT id FROM turnos WHERE estado = $1',
      ['abierto']
    );

    if (activeShift.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un turno abierto'
      });
    }

    // Crear turno
    const result = await shiftPool.query(
      `INSERT INTO turnos (fecha, tipo, encargado_id, encargado_nombre, estado)
       VALUES ($1, $2, $3, $4, 'abierto') RETURNING *`,
      [fecha, tipo, encargadoId, encargadoNombre]
    );

    const turnoId = result.rows[0].id;

    // Crear 4 surtidores
    const precioMetro = parseFloat(process.env.PRICE_PER_CUBIC_METER || 1500);
    for (let i = 1; i <= 4; i++) {
      await shiftPool.query(
        'INSERT INTO surtidores (turno_id, numero_surtidor, lectura_inicial, lectura_final, precio_metro) VALUES ($1, $2, 0, 0, $3)',
        [turnoId, i, precioMetro]
      );
    }

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar surtidor
exports.updateSurtidor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lectura_inicial, lectura_final } = req.body;

    const result = await shiftPool.query(
      'UPDATE surtidores SET lectura_inicial = $1, lectura_final = $2 WHERE id = $3 RETURNING *',
      [lectura_inicial, lectura_final, id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Agregar venta de producto
exports.addProductSale = async (req, res, next) => {
  try {
    const { turno_id, producto_id, cantidad } = req.body;

    // Obtener producto
    const product = await shiftPool.query(
      'SELECT * FROM productos WHERE id = $1 AND activo = true',
      [producto_id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const producto = product.rows[0];

    if (producto.stock < cantidad) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente'
      });
    }

    // Registrar venta
    const result = await shiftPool.query(
      `INSERT INTO ventas_productos (turno_id, producto_id, producto_nombre, cantidad, precio_unitario)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [turno_id, producto_id, producto.nombre, cantidad, producto.precio]
    );

    // Actualizar stock
    await shiftPool.query(
      'UPDATE productos SET stock = stock - $1 WHERE id = $2',
      [cantidad, producto_id]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Cerrar turno
exports.closeShift = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await shiftPool.query(
      `UPDATE turnos 
       SET estado = 'cerrado', fecha_cierre = CURRENT_TIMESTAMP 
       WHERE id = $1 AND estado = 'abierto' 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado o ya cerrado'
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

// Obtener historial de turnos
exports.getAllShifts = async (req, res, next) => {
  try {
    const result = await shiftPool.query(
      'SELECT * FROM turnos ORDER BY fecha DESC, tipo DESC LIMIT 50'
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