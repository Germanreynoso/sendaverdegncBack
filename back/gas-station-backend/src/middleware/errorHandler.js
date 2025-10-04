const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  // Error de PostgreSQL
  if (err.code) {
    if (err.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un registro con esos datos'
      });
    }
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Referencia inválida'
      });
    }
  }

  // Error por defecto
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };