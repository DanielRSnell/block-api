import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('Block Convert API Endpoints', () => {
  describe('POST /api/convert', () => {
    it('should convert HTML to blocks with default provider', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<div class="hero"><h1>Welcome</h1><p>Get started today</p></div>'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.blocks).toBeDefined();
      expect(response.body.markup).toBeDefined();
      expect(response.body.conversionStats).toBeDefined();
    });

    it('should convert HTML with greenshift provider', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<div class="hero"><h1>Welcome</h1><p>Get started today</p></div>',
          provider: 'greenshift'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.blocks).toBeDefined();
      expect(response.body.markup).toContain('greenshift-blocks');
      expect(response.body.conversionStats.greenshiftBlocks).toBeGreaterThan(0);
    });

    it('should convert HTML with gutenberg provider', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<div class="hero"><h1>Welcome</h1><p>Get started today</p></div>',
          provider: 'gutenberg'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.blocks).toBeDefined();
      expect(response.body.markup).toContain('core/');
    });

    it('should convert HTML with generate provider', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<div class="hero"><h1>Welcome</h1><p>Get started today</p></div>',
          provider: 'generate'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.blocks).toBeDefined();
      expect(response.body.markup).toContain('generateblocks');
      expect(response.body.conversionStats.generateblocksBlocks).toBeGreaterThan(0);
    });

    it('should return only blocks when format is "blocks"', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<h1>Test</h1>',
          format: 'blocks'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.blocks).toBeDefined();
      expect(response.body.markup).toBeUndefined();
    });

    it('should return only markup when format is "markup"', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<h1>Test</h1>',
          format: 'markup'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.blocks).toBeUndefined();
      expect(response.body.markup).toBeDefined();
    });

    it('should handle conversion options', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<div class="custom-class" id="test-id">Content</div>',
          options: {
            preserveClasses: true,
            preserveIds: true,
            generateUniqueIds: true
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.blocks).toBeDefined();
    });

    it('should return error for invalid HTML', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return error for missing HTML', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/convert/batch', () => {
    it('should convert multiple HTML strings', async () => {
      const response = await request(app)
        .post('/api/convert/batch')
        .send({
          items: [
            { html: '<h1>Title 1</h1>', id: 'item1' },
            { html: '<p>Paragraph 2</p>', id: 'item2' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.results).toHaveLength(2);
      expect(response.body.totalItems).toBe(2);
      expect(response.body.successfulConversions).toBe(2);
      expect(response.body.failedConversions).toBe(0);
    });

    it('should handle batch conversion with greenshift provider', async () => {
      const response = await request(app)
        .post('/api/convert/batch')
        .send({
          provider: 'greenshift',
          items: [
            { html: '<h1>Title 1</h1>', id: 'item1' },
            { html: '<p>Paragraph 2</p>', id: 'item2' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.results).toHaveLength(2);
      response.body.results.forEach(result => {
        expect(result.markup).toContain('greenshift-blocks');
      });
    });

    it('should handle batch conversion with global options', async () => {
      const response = await request(app)
        .post('/api/convert/batch')
        .send({
          globalOptions: {
            preserveClasses: true,
            generateUniqueIds: true
          },
          items: [
            { html: '<div class="test">Content 1</div>', id: 'item1' },
            { html: '<div class="test">Content 2</div>', id: 'item2' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.results).toHaveLength(2);
    });

    it('should handle errors in batch conversion', async () => {
      const response = await request(app)
        .post('/api/convert/batch')
        .send({
          items: [
            { html: '<h1>Valid HTML</h1>', id: 'item1' },
            { id: 'item2' }, // Missing HTML
            { html: '<p>Another valid</p>', id: 'item3' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.results).toHaveLength(2);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.successfulConversions).toBe(2);
      expect(response.body.failedConversions).toBe(1);
    });
  });

  describe('POST /api/validate', () => {
    it('should validate HTML structure', async () => {
      const response = await request(app)
        .post('/api/validate')
        .send({
          html: '<div><h1>Title</h1><p>Content</p></div>'
        });

      expect(response.status).toBe(200);
      expect(response.body.isValid).toBe(true);
      expect(response.body.convertibleElements).toContain('div');
      expect(response.body.convertibleElements).toContain('h1');
      expect(response.body.convertibleElements).toContain('p');
    });

    it('should identify unsupported elements', async () => {
      const response = await request(app)
        .post('/api/validate')
        .send({
          html: '<div><video>Video content</video><canvas>Canvas</canvas></div>'
        });

      expect(response.status).toBe(200);
      expect(response.body.isValid).toBe(true);
      expect(response.body.unsupportedElements).toContain('video');
      expect(response.body.unsupportedElements).toContain('canvas');
      expect(response.body.warnings.length).toBeGreaterThan(0);
    });

    it('should return error for missing HTML', async () => {
      const response = await request(app)
        .post('/api/validate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/elements', () => {
    it('should return supported elements information', async () => {
      const response = await request(app)
        .get('/api/elements');

      expect(response.status).toBe(200);
      expect(response.body.generateblocksElements).toBeDefined();
      expect(response.body.customElements).toBeDefined();
      expect(response.body.conversionOptions).toBeDefined();
    });
  });

  describe('GET /api/docs', () => {
    it('should return API documentation', async () => {
      const response = await request(app)
        .get('/api/docs');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Block Convert API');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.examples).toBeDefined();
    });
  });

  describe('GET /health', () => {
    it('should return health check status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.version).toBeDefined();
    });
  });
});