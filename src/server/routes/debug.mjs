import express from 'express';

const router = express.Router();

// Debug endpoint under /api
router.get('/debug', (req, res) => {
  res.json({
    version: 'v3.0-modular-api',
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT
    },
    memory: process.memoryUsage(),
    fileSystem: {
      structure: 'modular /api routes',
      workingDir: process.cwd()
    }
  });
});

export default router;