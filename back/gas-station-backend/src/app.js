// ARCHIVO: src/app.js
// =============================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { errorHandler } = require('./middleware/errorHandler');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const shiftRoutes = require('./routes/shiftRoutes');

const app = express();

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema de Gestión - Estación de Servicio',
      version: '1.0.0',
      description: 'API para gestión de estación de servicio',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Juan Pérez',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'juan@example.com',
            },
            role: {
              type: 'string',
              enum: ['admin', 'employee'],
              example: 'employee',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2023-10-01T00:00:00.000Z',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Gasolina Premium',
            },
            price: {
              type: 'number',
              format: 'float',
              example: 1.50,
            },
            category: {
              type: 'string',
              example: 'Combustible',
            },
            stock: {
              type: 'integer',
              example: 1000,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2023-10-01T00:00:00.000Z',
            },
          },
        },
        Shift: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            user_id: {
              type: 'integer',
              example: 1,
            },
            start_time: {
              type: 'string',
              format: 'date-time',
              example: '2023-10-01T08:00:00.000Z',
            },
            end_time: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: null,
            },
            initial_cash: {
              type: 'number',
              format: 'float',
              example: 100.00,
            },
            final_cash: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: null,
            },
            status: {
              type: 'string',
              enum: ['active', 'closed'],
              example: 'active',
            },
            total_sales: {
              type: 'number',
              format: 'float',
              example: 0.00,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Rutas donde estarán las anotaciones
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// Middlewares de seguridad
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API Sistema de Gestión - Estación de Servicio',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      docs: '/api-docs',
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      shifts: '/api/shifts'
    }
  });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/shifts', shiftRoutes);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`
  });
});

// Manejador de errores global
app.use(errorHandler);

module.exports = app;
