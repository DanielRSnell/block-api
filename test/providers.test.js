import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('Provider-Specific Tests', () => {
  const testHTML = `
    <div class="container">
      <h1>Main Title</h1>
      <p>Introduction paragraph</p>
      <div class="feature-box">
        <h3>Feature Title</h3>
        <p>Feature description</p>
        <button>Learn More</button>
      </div>
      <img src="image.jpg" alt="Test Image" />
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    </div>
  `;

  describe('GenerateBlocks Provider (generate-pro)', () => {
    it('should convert to GenerateBlocks elements', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: testHTML,
          provider: 'generate-pro'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.markup).toContain('generateblocks/');
      expect(response.body.conversionStats.generateblocksBlocks).toBeGreaterThan(0);
    });

    it('should handle buttons correctly', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<button class="btn btn-primary">Click Me</button>',
          provider: 'generate-pro'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.markup).toContain('generateblocks/text');
    });

    it('should handle images correctly', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<img src="test.jpg" alt="Test" class="hero-image" />',
          provider: 'generate-pro'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.markup).toContain('generateblocks/media');
    });
  });

  describe('Greenshift Provider', () => {
    it('should convert to Greenshift elements', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: testHTML,
          provider: 'greenshift'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.markup).toContain('greenshift-blocks/');
      expect(response.body.conversionStats.greenshiftBlocks).toBeGreaterThan(0);
    });

    it('should handle text elements correctly', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<h1>Greenshift Title</h1><p>Greenshift paragraph</p>',
          provider: 'greenshift'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.markup).toContain('greenshift-blocks/element');
    });

    it('should preserve classes and attributes', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<div class="custom-class" id="unique-id">Content</div>',
          provider: 'greenshift',
          options: {
            preserveClasses: true,
            preserveIds: true
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.blocks[0].attrs.className).toContain('custom-class');
      expect(response.body.blocks[0].attrs.id).toBe('unique-id');
    });
  });

  describe('Gutenberg Provider', () => {
    it('should convert to native Gutenberg blocks', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: testHTML,
          provider: 'gutenberg'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.markup).toContain('core/');
      expect(response.body.conversionStats.totalBlocks).toBeGreaterThan(0);
    });

    it('should handle headings correctly', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>',
          provider: 'gutenberg'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.markup).toContain('core/heading');
    });

    it('should handle paragraphs correctly', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<p>First paragraph</p><p>Second paragraph</p>',
          provider: 'gutenberg'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.markup).toContain('core/paragraph');
    });

    it('should handle images correctly', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<img src="test.jpg" alt="Test Image" />',
          provider: 'gutenberg'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.markup).toContain('core/image');
    });
  });

  describe('Generate Provider (basic)', () => {
    it('should convert to GenerateBlocks without Pro features', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: testHTML,
          provider: 'generate'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.markup).toContain('generateblocks/');
      expect(response.body.conversionStats.generateblocksBlocks).toBeGreaterThan(0);
    });
  });

  describe('Provider Comparison', () => {
    const complexHTML = `
      <div class="hero-section">
        <h1>Hero Title</h1>
        <p>Hero description with <strong>bold text</strong> and <em>italic text</em></p>
        <div class="buttons">
          <button class="btn-primary">Primary Button</button>
          <button class="btn-secondary">Secondary Button</button>
        </div>
        <img src="hero-image.jpg" alt="Hero Image" />
      </div>
    `;

    it('should produce different output for different providers', async () => {
      const providers = ['generate-pro', 'greenshift', 'gutenberg', 'generate'];
      const results = [];

      for (const provider of providers) {
        const response = await request(app)
          .post('/api/convert')
          .send({
            html: complexHTML,
            provider
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        results.push({
          provider,
          markup: response.body.markup,
          stats: response.body.conversionStats
        });
      }

      // Verify each provider produces different markup
      expect(results[0].markup).not.toBe(results[1].markup);
      expect(results[1].markup).not.toBe(results[2].markup);
      expect(results[2].markup).not.toBe(results[3].markup);

      // Verify provider-specific block types
      expect(results[0].markup).toContain('generateblocks/');
      expect(results[1].markup).toContain('greenshift-blocks/');
      expect(results[2].markup).toContain('core/');
      expect(results[3].markup).toContain('generateblocks/');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty HTML', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '',
          provider: 'greenshift'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid provider', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: '<p>Test</p>',
          provider: 'invalid-provider'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Should fallback to default provider
    });

    it('should handle complex nested HTML', async () => {
      const nestedHTML = `
        <div class="outer">
          <div class="middle">
            <div class="inner">
              <h1>Nested Title</h1>
              <p>Nested content</p>
            </div>
          </div>
        </div>
      `;

      const response = await request(app)
        .post('/api/convert')
        .send({
          html: nestedHTML,
          provider: 'greenshift'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.blocks).toBeDefined();
    });
  });
});