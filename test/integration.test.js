import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('Integration Tests', () => {
  describe('Server Setup', () => {
    it('should start the server and respond to health check', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should have CORS enabled', async () => {
      const response = await request(app).get('/health');
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should have security headers', async () => {
      const response = await request(app).get('/health');
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('API Documentation', () => {
    it('should provide complete API documentation', async () => {
      const response = await request(app).get('/api/docs');
      
      expect(response.status).toBe(200);
      expect(response.body.endpoints).toHaveProperty('POST /api/convert');
      expect(response.body.endpoints).toHaveProperty('POST /api/convert/batch');
      expect(response.body.endpoints).toHaveProperty('POST /api/validate');
      expect(response.body.endpoints).toHaveProperty('GET /api/elements');
    });
  });

  describe('Full Conversion Flow', () => {
    it('should handle complete HTML to blocks conversion workflow', async () => {
      const testHTML = `
        <div class="landing-page">
          <header>
            <h1>Welcome to Our Site</h1>
            <p>The best place for amazing content</p>
          </header>
          <main>
            <section class="features">
              <h2>Features</h2>
              <div class="feature">
                <h3>Feature 1</h3>
                <p>Amazing feature description</p>
                <button>Learn More</button>
              </div>
              <div class="feature">
                <h3>Feature 2</h3>
                <p>Another great feature</p>
                <img src="feature.jpg" alt="Feature Image" />
              </div>
            </section>
          </main>
        </div>
      `;

      // Step 1: Validate HTML
      const validateResponse = await request(app)
        .post('/api/validate')
        .send({ html: testHTML });

      expect(validateResponse.status).toBe(200);
      expect(validateResponse.body.isValid).toBe(true);

      // Step 2: Convert with different providers
      const providers = ['generate-pro', 'greenshift', 'gutenberg'];
      
      for (const provider of providers) {
        const convertResponse = await request(app)
          .post('/api/convert')
          .send({
            html: testHTML,
            provider,
            options: {
              preserveClasses: true,
              generateUniqueIds: true
            }
          });

        expect(convertResponse.status).toBe(200);
        expect(convertResponse.body.success).toBe(true);
        expect(convertResponse.body.blocks).toBeDefined();
        expect(convertResponse.body.markup).toBeDefined();
        expect(convertResponse.body.conversionStats.totalBlocks).toBeGreaterThan(0);
      }
    });

    it('should handle batch conversion workflow', async () => {
      const items = [
        {
          id: 'hero',
          html: '<div class="hero"><h1>Hero Title</h1><p>Hero content</p></div>'
        },
        {
          id: 'feature',
          html: '<div class="feature"><h3>Feature</h3><button>CTA</button></div>'
        },
        {
          id: 'footer',
          html: '<footer><p>© 2024 Company Name</p></footer>'
        }
      ];

      const batchResponse = await request(app)
        .post('/api/convert/batch')
        .send({
          provider: 'greenshift',
          globalOptions: {
            preserveClasses: true,
            generateUniqueIds: true
          },
          items
        });

      expect(batchResponse.status).toBe(200);
      expect(batchResponse.body.success).toBe(true);
      expect(batchResponse.body.results).toHaveLength(3);
      expect(batchResponse.body.successfulConversions).toBe(3);
      expect(batchResponse.body.failedConversions).toBe(0);

      // Verify each result
      batchResponse.body.results.forEach((result, index) => {
        expect(result.id).toBe(items[index].id);
        expect(result.success).toBe(true);
        expect(result.blocks).toBeDefined();
        expect(result.markup).toBeDefined();
        expect(result.markup).toContain('greenshift-blocks');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          invalid: 'request'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle server errors gracefully', async () => {
      // Test with extremely large HTML to potentially cause memory issues
      const largeHTML = '<div>' + 'x'.repeat(1000000) + '</div>';
      
      const response = await request(app)
        .post('/api/convert')
        .send({
          html: largeHTML
        });

      // Should either succeed or fail gracefully
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array(5).fill(0).map(() => 
        request(app)
          .post('/api/convert')
          .send({
            html: '<div><h1>Concurrent Test</h1><p>Content</p></div>',
            provider: 'greenshift'
          })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});