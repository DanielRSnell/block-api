# Block Convert API

A powerful Node.js API for converting HTML to WordPress blocks and vice versa, supporting multiple block providers including GenerateBlocks, Greenshift, and Gutenberg.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com/)
[![API](https://img.shields.io/badge/API-REST-orange)](https://restfulapi.net/)
[![Documentation](https://img.shields.io/badge/Docs-Swagger-brightgreen)](http://localhost:3000/api-docs)

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd block-convert

# Install dependencies
npm install

# Start development server
npm run dev

# Access the API
open http://localhost:3000/api-docs
```

### Docker (Recommended for Production)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
npm run docker:build:prod
npm run docker:run:prod
```

## 📚 API Documentation

- **Interactive Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)
- **Static Docs**: [docs/API.md](docs/API.md)

## 🔄 Conversion Examples

### HTML to Blocks

```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<div class=\"hero\"><h1>Welcome</h1><p>Get started today</p></div>",
    "provider": "greenshift"
  }'
```

**Response:**
```html
<!-- wp:greenshift-blocks/element {"uniqueId":"gs-123","tagName":"div","className":"hero"} -->
<div class="hero">
  <!-- wp:greenshift-blocks/element {"uniqueId":"gs-124","tagName":"h1"} -->
  <h1>Welcome</h1>
  <!-- /wp:greenshift-blocks/element -->
  <!-- wp:greenshift-blocks/element {"uniqueId":"gs-125","tagName":"p"} -->
  <p>Get started today</p>
  <!-- /wp:greenshift-blocks/element -->
</div>
<!-- /wp:greenshift-blocks/element -->
```

### Blocks to HTML

```bash
curl -X POST http://localhost:3000/api/blocks-to-html \
  -H "Content-Type: application/json" \
  -d '{
    "blockMarkup": "<!-- wp:greenshift-blocks/element -->...</blockMarkup>"
  }'
```

**Response:**
```html
<div class="hero">
  <h1>Welcome</h1>
  <p>Get started today</p>
</div>
```

## 🎯 Supported Providers

| Provider | Description | Best For |
|----------|-------------|----------|
| `generate-pro` | GenerateBlocks + Pro + Gutenberg fallbacks | Full-featured sites |
| `generate` | GenerateBlocks + Gutenberg fallbacks | Standard WordPress sites |
| `gutenberg` | Native Gutenberg blocks only | Core WordPress |
| `greenshift` | Greenshift blocks + Gutenberg fallbacks | Animation & interactions |

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/convert` | Convert HTML to blocks |
| `POST` | `/api/blocks-to-html` | Convert blocks to HTML |
| `POST` | `/api/convert/batch` | Batch convert multiple HTML |
| `POST` | `/api/validate` | Validate HTML structure |
| `GET` | `/api/elements` | Get supported elements |
| `GET` | `/health` | Health check |

## 🛠️ CLI Tools

The project includes powerful CLI tools for file-based conversions:

```bash
# Convert HTML to blocks
npm run convert input.html output.html

# Convert blocks to clean HTML
npm run blocks-to-html test blocks/tw-dark-gradient-hero

# Convert specific files
npm run blocks-to-html convert block.html static.html
```

## 🚢 Deployment

### Coolify (Recommended)

Deploy effortlessly to [Coolify](https://coolify.io/) with auto-updates:

1. **Create new application** in Coolify dashboard
2. **Set repository URL**: `https://github.com/DanielRSnell/block-api`
3. **Configure build**:
   - Build Pack: `Docker`
   - Dockerfile: `coolify.dockerfile`
   - Port: `3000`
   - Health Check: `/health`
   - **Enable auto-deploy** for seamless updates
4. **Set environment variables**:
   ```
   NODE_ENV=production
   PORT=3000
   ```
5. **Deploy!** 🚀

**Auto-Update Features:**
- ✅ Automatic deployment on git push to main
- ✅ Always pulls latest code from GitHub
- ✅ Zero-downtime updates with health checks

**Resource Requirements:**
- **Minimum**: 0.5 CPU, 512MB RAM
- **Recommended**: 1 CPU, 1GB RAM
- **Disk**: 1-2GB

### Other Deployment Options

- **Docker**: Use `Dockerfile.prod` for production builds
- **Manual**: Node.js 18+ with PM2 process manager
- **Cloud**: Compatible with Heroku, Railway, Render, etc.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific endpoint
npm test -- test/api.test.js

# Test with UI
npm run test:ui

# Test Docker build locally
npm run docker:build:prod
npm run docker:run:prod
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Node.js environment |
| `PORT` | `3000` | Server port |

### Conversion Options

```javascript
{
  preserveClasses: true,      // Keep CSS classes
  preserveIds: true,          // Keep element IDs
  preserveStyles: false,      // Keep inline styles
  fallbackToHtmlBlock: true,  // Use HTML blocks for unsupported elements
  generateUniqueIds: true,    // Generate unique block IDs
  semanticMapping: true       // Use semantic element mapping
}
```

## 📁 Project Structure

```
block-convert/
├── src/
│   ├── api/                 # Express API routes & middleware
│   ├── cli/                 # CLI tools
│   ├── core/                # Core conversion logic
│   ├── providers/           # Block providers (Greenshift, etc.)
│   └── utils/               # Utility functions
├── blocks/                  # Example block files
├── test/                    # Test suite
├── docs/                    # Documentation
├── Dockerfile.prod          # Production Docker build
├── docker-compose.yml       # Local development setup
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 🔍 Examples

### Batch Conversion

```bash
curl -X POST http://localhost:3000/api/convert/batch \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "greenshift",
    "globalOptions": {"preserveClasses": true},
    "items": [
      {"id": "hero", "html": "<h1>Hero Title</h1>"},
      {"id": "content", "html": "<p>Content paragraph</p>"}
    ]
  }'
```

### HTML Validation

```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"html": "<div><h1>Title</h1><video>content</video></div>"}'
```

## 🏗️ Development Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with hot reload
npm test               # Run test suite
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run type-check     # TypeScript type checking

# Docker commands
npm run docker:build          # Build development image
npm run docker:build:prod     # Build production image
npm run docker:run:prod       # Run production container
npm run docker:compose:up     # Start with docker-compose
npm run docker:compose:down   # Stop docker-compose
npm run docker:compose:logs   # View logs

# CLI tools
npm run convert               # HTML to blocks CLI
npm run blocks-to-html        # Blocks to HTML CLI

# Deployment commands
npm run deploy:update         # Update production deployment
npm run deploy:webhook        # Start webhook server for auto-deploy
npm run deploy:local          # Deploy locally with auto-updater
```

## 📈 Performance

- **Fast conversions**: Optimized parsing and generation
- **Memory efficient**: Streaming processing for large files
- **Concurrent support**: Handle multiple requests simultaneously
- **Health monitoring**: Built-in health checks and monitoring

## 🔒 Security

- ✅ Input validation and sanitization
- ✅ Security headers (Helmet.js)
- ✅ CORS protection
- ✅ Non-root Docker user
- ✅ Environment variable configuration

## 📋 Requirements

- **Node.js**: 18.0.0 or higher
- **Docker**: For containerized deployment
- **RAM**: 512MB minimum, 1GB recommended
- **Disk**: 1GB for application and dependencies

## 🆘 Troubleshooting

### Common Issues

**Build fails in Docker:**
- Check Dockerfile syntax
- Verify package.json dependencies
- Review build logs

**API not responding:**
- Check if port 3000 is available
- Verify environment variables
- Check health endpoint: `/health`

**Conversion errors:**
- Validate HTML structure with `/api/validate`
- Check provider compatibility
- Review input HTML format

### Getting Help

1. Check the [API documentation](http://localhost:3000/api-docs)
2. Review [deployment guide](docs/DEPLOYMENT.md)
3. Test with provided examples
4. Check application logs
5. Verify health check endpoint

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [JSDOM](https://github.com/jsdom/jsdom) - HTML parsing
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - API documentation
- [Docker](https://docker.com/) - Containerization
- [Coolify](https://coolify.io/) - Deployment platform

---

Built with ❤️ for the WordPress community