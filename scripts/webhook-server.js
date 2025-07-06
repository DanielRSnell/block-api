#!/usr/bin/env node

/**
 * Simple webhook server for auto-deployment
 * Listens for GitHub webhook events and triggers deployment updates
 */

const express = require('express');
const crypto = require('crypto');
const { execSync } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
const BRANCH = process.env.DEPLOY_BRANCH || 'main';

// Middleware to parse JSON
app.use(express.json());

// Middleware to verify GitHub webhook signature
const verifySignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];
  
  if (!signature) {
    return res.status(401).json({ error: 'No signature provided' });
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex')}`;

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};

// Webhook endpoint
app.post('/webhook', verifySignature, (req, res) => {
  const event = req.headers['x-github-event'];
  const { ref, repository } = req.body;

  console.log(`📨 Received ${event} event`);
  console.log(`📦 Repository: ${repository?.full_name}`);
  console.log(`🌳 Branch: ${ref}`);

  // Only deploy on push to the specified branch
  if (event === 'push' && ref === `refs/heads/${BRANCH}`) {
    console.log(`🚀 Triggering deployment for ${BRANCH} branch...`);
    
    try {
      // Execute the update script
      const scriptPath = path.join(__dirname, 'update-deployment.sh');
      const output = execSync(`${scriptPath} --branch ${BRANCH}`, { 
        encoding: 'utf8',
        cwd: path.dirname(scriptPath)
      });
      
      console.log('✅ Deployment completed successfully');
      console.log('Output:', output);
      
      res.json({ 
        success: true, 
        message: 'Deployment triggered successfully',
        branch: BRANCH,
        repository: repository?.full_name
      });
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      
      res.status(500).json({ 
        success: false, 
        error: 'Deployment failed',
        message: error.message
      });
    }
  } else {
    console.log(`⏭️  Ignoring event (not a push to ${BRANCH})`);
    res.json({ 
      success: true, 
      message: `Event ignored (not a push to ${BRANCH})`,
      event,
      ref
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    webhook_port: PORT,
    deploy_branch: BRANCH
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Block Convert API Webhook Server',
    endpoints: {
      'POST /webhook': 'GitHub webhook for auto-deployment',
      'GET /health': 'Health check'
    },
    configuration: {
      port: PORT,
      deploy_branch: BRANCH,
      secret_configured: !!SECRET
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
  console.log(`📋 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`🌳 Deploy branch: ${BRANCH}`);
  console.log(`🔐 Secret configured: ${!!SECRET}`);
});

module.exports = app;