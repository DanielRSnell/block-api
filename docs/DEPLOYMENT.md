# Deployment Guide

## Coolify Deployment

This application is optimized for deployment with [Coolify](https://coolify.io/), a self-hosted alternative to Heroku.

### Prerequisites

1. Coolify instance running
2. Docker support enabled
3. Git repository access

### Deployment Steps

#### 1. Create New Application in Coolify

1. Go to your Coolify dashboard
2. Click "New Resource" → "Application"
3. Choose "Public Repository" or connect your Git provider
4. Enter repository URL: `https://github.com/your-username/block-convert`

#### 2. Configure Build Settings

**Build Configuration:**
- **Build Pack**: `Docker`
- **Dockerfile**: `coolify.dockerfile` (auto-pulls from GitHub)
- **Port**: `3000`
- **Health Check Endpoint**: `/health`
- **Auto-deploy**: Enable for automatic updates on git push

#### 3. Environment Variables

Set the following environment variables in Coolify:

```bash
NODE_ENV=production
PORT=3000
```

Optional variables:
```bash
# If you need custom settings
API_TIMEOUT=30000
MAX_FILE_SIZE=10mb
```

#### 4. Domain Configuration

1. Set your custom domain in Coolify
2. Enable HTTPS (automatic with Coolify)
3. Configure any necessary DNS records

#### 5. Deploy

1. Click "Deploy" in Coolify
2. Monitor build logs
3. Verify deployment at your domain
4. **Enable auto-deploy** for automatic updates on git push

### Auto-Update Features

The deployment is configured for seamless updates:

**Coolify Auto-Deploy:**
- Automatically rebuilds when you push to `main` branch
- Uses `coolify.dockerfile` which always pulls latest code
- Zero-downtime deployments with health checks

**Manual Update Options:**
```bash
# Option 1: Use the update script
./scripts/update-deployment.sh

# Option 2: Docker Compose with auto-updater
docker-compose -f docker-compose.deploy.yml up -d

# Option 3: Webhook server for GitHub integration
node scripts/webhook-server.js
```

### Build Optimization

The production Dockerfile (`Dockerfile.prod`) includes:

- ✅ Multi-stage build for smaller images
- ✅ Production dependencies only
- ✅ Non-root user for security
- ✅ Health checks
- ✅ Optimized for Puppeteer

### Health Checks

The application includes built-in health checks:
- **Endpoint**: `GET /health`
- **Expected Response**: `{"status": "ok", "timestamp": "...", "version": "1.0.0"}`

Coolify will automatically use this for monitoring.

### Resource Requirements

**Minimum Requirements:**
- CPU: 0.5 cores
- RAM: 512MB
- Disk: 1GB

**Recommended for Production:**
- CPU: 1 core
- RAM: 1GB
- Disk: 2GB

### Accessing the Application

Once deployed, your API will be available at:
- **API Base**: `https://your-domain.com/api`
- **Documentation**: `https://your-domain.com/api-docs`
- **Health Check**: `https://your-domain.com/health`

### Troubleshooting

#### Common Issues

1. **Build Fails**
   - Check Dockerfile syntax
   - Verify all dependencies in package.json
   - Check build logs in Coolify

2. **Application Won't Start**
   - Verify PORT environment variable
   - Check application logs
   - Ensure health check endpoint is accessible

3. **Puppeteer Issues**
   - The Dockerfile includes Chromium dependencies
   - No additional configuration needed

#### Monitoring

Coolify provides built-in monitoring:
- Application status
- Resource usage
- Build logs
- Runtime logs

#### Scaling

For high traffic, consider:
- Increasing CPU/RAM allocation in Coolify
- Using multiple instances (if supported)
- Adding a CDN for static assets

### Local Testing with Docker

Test the Docker build locally before deploying:

```bash
# Build production image
docker build -f Dockerfile.prod -t block-convert:prod .

# Run container
docker run -p 3000:3000 --env NODE_ENV=production block-convert:prod

# Test health check
curl http://localhost:3000/health

# Test API
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"html": "<h1>Test</h1>", "provider": "greenshift"}'
```

### CI/CD Integration

For automated deployments, Coolify supports:
- GitHub webhooks
- GitLab integration
- Manual deployments

Configure webhooks in your repository settings to trigger automatic deployments on push to main branch.

## Alternative Deployment Options

### Docker Compose (Manual)

```bash
# Clone repository
git clone <your-repo-url>
cd block-convert

# Build and run with docker-compose
docker-compose up -d

# Check status
docker-compose ps
```

### Manual Server Deployment

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <your-repo-url>
cd block-convert
npm ci --production

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start src/index.js --name "block-convert-api"
pm2 startup
pm2 save
```

### Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Node.js environment |
| `PORT` | `3000` | Server port |
| `API_TIMEOUT` | `30000` | API timeout in milliseconds |

### Security Considerations

- ✅ Non-root user in Docker
- ✅ HTTPS enforced (via Coolify)
- ✅ Input validation
- ✅ Rate limiting (can be added)
- ✅ Security headers (Helmet.js)

For production use, consider adding:
- API rate limiting
- Authentication/authorization
- Request logging
- Error monitoring (Sentry, etc.)

## Support

For deployment issues:
1. Check Coolify documentation
2. Review application logs
3. Test Docker build locally
4. Check health check endpoint