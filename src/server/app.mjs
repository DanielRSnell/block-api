import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

import healthRoutes from './routes/health.mjs';
import debugRoutes from './routes/debug.mjs';
import apiRoutes from './routes/api.mjs';
import frontendRoutes from './routes/frontend.mjs';
import { swaggerDocument } from './config/swagger.mjs';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

console.log('🚀 Initializing Block Convert API...');

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (JS, images, styles)
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/styles', express.static(path.join(__dirname, '../../styles')));

// Routes
app.use('/', frontendRoutes);         // Frontend pages (/, /tool)
app.use('/api', healthRoutes);        // /api/health
app.use('/api', debugRoutes);         // /api/debug  
app.use('/api', apiRoutes);           // /api/convert, etc.

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Block Convert API Documentation'
}));

// Raw Swagger JSON endpoint
app.get('/swagger', (req, res) => {
  res.json(swaggerDocument);
});

console.log('✅ Routes loaded: frontend, health, debug, api, swagger');

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;