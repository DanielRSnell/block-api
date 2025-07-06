import express from 'express';

const router = express.Router();

// Root route is now handled by frontend routes

// Health check route under /api
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Block Convert API is running!',
    endpoints: {
      health: '/api/health',
      debug: '/api/debug',
      apiDocs: '/api-docs',
      convert: '/api/convert',
      blocksToHtml: '/api/blocks-to-html',
      validate: '/api/validate',
      elements: '/api/elements'
    }
  });
});

export default router;