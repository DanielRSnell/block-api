# Block Convert API Tests

This directory contains comprehensive tests for the Block Convert API endpoints.

## Test Files

- `api.test.js` - General API endpoint tests
- `providers.test.js` - Provider-specific functionality tests

## Running Tests

From the project root directory:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/api.test.js

# Run tests with UI
npm run test:ui
```

## Test Coverage

### API Endpoints (`api.test.js`)
- ✅ `POST /api/convert` - Basic HTML to blocks conversion
- ✅ `POST /api/convert` - Provider parameter support (greenshift, gutenberg, generate)
- ✅ `POST /api/convert` - Format options (blocks, markup, both)
- ✅ `POST /api/convert` - Conversion options handling
- ✅ `POST /api/convert` - Error handling
- ✅ `POST /api/convert/batch` - Batch conversion
- ✅ `POST /api/convert/batch` - Provider parameter support
- ✅ `POST /api/convert/batch` - Global options handling
- ✅ `POST /api/convert/batch` - Error handling
- ✅ `POST /api/validate` - HTML validation
- ✅ `GET /api/elements` - Supported elements info
- ✅ `GET /api/docs` - API documentation
- ✅ `GET /health` - Health check

### Provider Tests (`providers.test.js`)
- ✅ GenerateBlocks Provider (generate-pro)
- ✅ Greenshift Provider
- ✅ Gutenberg Provider
- ✅ Generate Provider (basic)
- ✅ Provider comparison tests
- ✅ Edge cases and error handling

## Test Examples

### Basic Conversion Test
```javascript
const response = await request(app)
  .post('/api/convert')
  .send({
    html: '<div class="hero"><h1>Welcome</h1></div>',
    provider: 'greenshift'
  });

expect(response.status).toBe(200);
expect(response.body.success).toBe(true);
expect(response.body.markup).toContain('greenshift-blocks');
```

### Provider-Specific Test
```javascript
const response = await request(app)
  .post('/api/convert')
  .send({
    html: '<h1>Test Title</h1>',
    provider: 'gutenberg'
  });

expect(response.body.markup).toContain('core/heading');
```

### Batch Conversion Test
```javascript
const response = await request(app)
  .post('/api/convert/batch')
  .send({
    provider: 'greenshift',
    items: [
      { html: '<h1>Title 1</h1>', id: 'item1' },
      { html: '<p>Content 2</p>', id: 'item2' }
    ]
  });

expect(response.body.results).toHaveLength(2);
```

## Provider Modes Tested

1. **generate-pro** (default) - GenerateBlocks + GenerateBlocks Pro + Gutenberg fallbacks
2. **generate** - GenerateBlocks + Gutenberg fallbacks
3. **gutenberg** - Native Gutenberg blocks only
4. **greenshift** - Greenshift blocks + Gutenberg fallbacks

## Dependencies

- `vitest` - Test framework
- `supertest` - HTTP assertion library for testing Express applications
- `@vitest/ui` - Test UI for visual test running