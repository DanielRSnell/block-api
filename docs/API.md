# Block Convert API Documentation

## Overview

The Block Convert API provides endpoints for converting HTML to WordPress blocks and vice versa, with support for multiple block providers including GenerateBlocks, Greenshift, and Gutenberg.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.blockconvert.com`

## Interactive Documentation

Visit the Swagger UI for interactive API documentation:
- **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Authentication

Currently, no authentication is required for API endpoints.

## Providers

The API supports multiple block providers:

| Provider | Description |
|----------|-------------|
| `generate-pro` | GenerateBlocks + GenerateBlocks Pro + Gutenberg fallbacks (default) |
| `generate` | GenerateBlocks + Gutenberg fallbacks |
| `gutenberg` | Native Gutenberg blocks only |
| `greenshift` | Greenshift blocks + Gutenberg fallbacks |

## Endpoints

### POST /api/convert

Convert HTML to WordPress blocks.

**Request Body:**
```json
{
  "html": "<div class=\"hero\"><h1>Welcome</h1></div>",
  "provider": "greenshift",
  "options": {
    "preserveClasses": true,
    "generateUniqueIds": true
  }
}
```

**Response:**
```
<!-- wp:greenshift-blocks/element {"uniqueId":"gs-123"} -->
<div class="hero">
  <!-- wp:greenshift-blocks/element {"uniqueId":"gs-124","tag":"h1"} -->
  <h1>Welcome</h1>
  <!-- /wp:greenshift-blocks/element -->
</div>
<!-- /wp:greenshift-blocks/element -->
```

### POST /api/blocks-to-html

Convert WordPress blocks back to clean HTML.

**Request Body:**
```json
{
  "blockMarkup": "<!-- wp:greenshift-blocks/element -->...</blockMarkup>"
}
```

**Response:**
```html
<div class="hero">
  <h1>Welcome</h1>
</div>
```

### POST /api/convert/batch

Convert multiple HTML strings in a single request.

**Request Body:**
```json
{
  "provider": "greenshift",
  "globalOptions": {
    "preserveClasses": true
  },
  "items": [
    {
      "id": "hero",
      "html": "<div class=\"hero\"><h1>Title</h1></div>"
    },
    {
      "id": "feature", 
      "html": "<div class=\"feature\"><p>Description</p></div>"
    }
  ]
}
```

### POST /api/validate

Validate HTML structure and identify convertible elements.

**Request Body:**
```json
{
  "html": "<div><h1>Title</h1><video>content</video></div>"
}
```

**Response:**
```json
{
  "isValid": true,
  "convertibleElements": ["div", "h1"],
  "unsupportedElements": ["video"],
  "warnings": [
    {
      "type": "unsupported_element",
      "message": "Element 'video' will fallback to HTML block",
      "element": "video"
    }
  ]
}
```

### GET /api/elements

Get information about supported elements and conversion options.

### GET /health

Health check endpoint.

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid input)
- `500` - Internal Server Error

Error responses include details:
```json
{
  "success": false,
  "error": "HTML content is required"
}
```

## Rate Limiting

Currently no rate limiting is implemented, but may be added in the future.

## Examples

### Convert HTML to Greenshift Blocks

```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<section class=\"hero\"><h1>Welcome</h1><p>Get started</p></section>",
    "provider": "greenshift"
  }'
```

### Convert Blocks Back to HTML

```bash
curl -X POST http://localhost:3000/api/blocks-to-html \
  -H "Content-Type: application/json" \
  -d '{
    "blockMarkup": "<!-- wp:greenshift-blocks/element -->...</blockMarkup>"
  }'
```

### Batch Convert Multiple Items

```bash
curl -X POST http://localhost:3000/api/convert/batch \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "greenshift",
    "items": [
      {"id": "hero", "html": "<h1>Hero Title</h1>"},
      {"id": "content", "html": "<p>Content paragraph</p>"}
    ]
  }'
```

## CLI Tools

The project also includes CLI tools:

```bash
# Convert HTML to blocks
npm run convert input.html output.html

# Convert blocks to HTML
npm run blocks-to-html test blocks/tw-dark-gradient-hero

# Convert specific files
npm run blocks-to-html convert block.html static.html
```

## Support

For support and questions, please refer to the project documentation or create an issue in the repository.