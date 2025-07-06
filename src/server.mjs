import app from './server/app.mjs';

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Block Convert API running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Debug Info: http://localhost:${PORT}/api/debug`);
  console.log(`🔄 Convert API: http://localhost:${PORT}/api/convert`);
});