const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

// Obtener todos los usuarios
exports.getAllUsers = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, apellido, rol, activo, created_at FROM usuarios WHERE activo = true ORDER BY nombre'
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

// Crear usuario
exports.createUser = async (req, res, next) => {
  try {
    const { nombre, apellido, password, rol } = req.body;

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, apellido, rol',
      [nombre, apellido, hashedPassword, rol || 'vendedor']
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar usuario
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, password, rol } = req.body;

    let query = 'UPDATE usuarios SET nombre = $1, apellido = $2, rol = $3';
    let params = [nombre, apellido, rol, id];

    if (password) {
      // Hash de la nueva contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      query = 'UPDATE usuarios SET nombre = $1, apellido = $2, password = $3, rol = $4 WHERE id = $5 RETURNING id, nombre, apellido, rol';
      params = [nombre, apellido, hashedPassword, rol, id];
    } else {
      query += ' WHERE id = $4 RETURNING id, nombre, apellido, rol';
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
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

// Eliminar usuario
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE usuarios SET activo = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};
