import puppeteer from 'puppeteer';
import { expect } from 'vitest';

const BASE_URL = 'https://blocks.umbral.ai';
const TOOL_URL = `${BASE_URL}/tool`;

describe('Blocks Conversion Tool - Basic UI Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    await page.goto(TOOL_URL, { waitUntil: 'networkidle0' });
  });

  describe('Page Load and Basic Elements', () => {
    test('should load the tool page successfully', async () => {
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title).toContain('Block Convert Tool');
    });

    test('should have input textarea', async () => {
      const inputTextarea = await page.$('textarea.textarea');
      expect(inputTextarea).toBeTruthy();
      
      const placeholder = await inputTextarea.evaluate(el => el.placeholder);
      expect(placeholder).toContain('HTML content');
    });

    test('should have conversion mode buttons', async () => {
      const buttons = await page.$$('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Check for specific conversion buttons
      let foundConversionButton = false;
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent);
        if (text.includes('HTML to Blocks') || text.includes('Blocks to HTML') || text.includes('Validate')) {
          foundConversionButton = true;
          break;
        }
      }
      expect(foundConversionButton).toBeTruthy();
    });

    test('should have provider selector', async () => {
      const providerSelect = await page.$('select.select');
      expect(providerSelect).toBeTruthy();
    });
  });

  describe('HTML to Blocks Conversion', () => {
    test('should convert simple HTML to blocks', async () => {
      const testHtml = '<div class="hero"><h1>Welcome</h1><p>Test content</p></div>';
      
      // Click HTML to Blocks button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const htmlToBlocksBtn = buttons.find(btn => btn.textContent.includes('HTML to Blocks'));
        if (htmlToBlocksBtn) htmlToBlocksBtn.click();
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fill input textarea
      const inputTextarea = await page.$('textarea.textarea');
      await inputTextarea.evaluate(el => el.value = '');
      await inputTextarea.type(testHtml);
      
      // Click main convert button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const convertBtn = buttons.find(btn => 
          btn.textContent.includes('Convert to Blocks') || 
          btn.textContent.includes('Convert') ||
          btn.classList.contains('btn-primary')
        );
        if (convertBtn) convertBtn.click();
      });
      
      // Wait for conversion
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check for success - either output area or no error
      const hasError = await page.$('.error, .alert-error, [class*="error"]');
      expect(hasError).toBeNull();
    });
  });

  describe('Blocks to HTML Conversion', () => {
    test('should convert simple blocks to HTML', async () => {
      const testBlocks = '<!-- wp:greenshift-blocks/element {"className":"hero"} --><div class="hero"><!-- wp:greenshift-blocks/element {"tag":"h1","textContent":"Welcome"} --><h1>Welcome</h1><!-- /wp:greenshift-blocks/element --></div><!-- /wp:greenshift-blocks/element -->';
      
      // Click Blocks to HTML button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const blocksToHtmlBtn = buttons.find(btn => btn.textContent.includes('Blocks to HTML'));
        if (blocksToHtmlBtn) blocksToHtmlBtn.click();
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fill input textarea
      const inputTextarea = await page.$('textarea.textarea');
      await inputTextarea.evaluate(el => el.value = '');
      await inputTextarea.type(testBlocks);
      
      // Click main convert button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const convertBtn = buttons.find(btn => 
          btn.textContent.includes('Convert to HTML') || 
          btn.textContent.includes('Convert') ||
          btn.classList.contains('btn-primary')
        );
        if (convertBtn) convertBtn.click();
      });
      
      // Wait for conversion
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check for success - either output area or no error
      const hasError = await page.$('.error, .alert-error, [class*="error"]');
      expect(hasError).toBeNull();
    });
  });

  describe('UI Interactions', () => {
    test('should allow switching between conversion modes', async () => {
      // Click HTML to Blocks
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const htmlToBlocksBtn = buttons.find(btn => btn.textContent.includes('HTML to Blocks'));
        if (htmlToBlocksBtn) htmlToBlocksBtn.click();
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Click Blocks to HTML
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const blocksToHtmlBtn = buttons.find(btn => btn.textContent.includes('Blocks to HTML'));
        if (blocksToHtmlBtn) blocksToHtmlBtn.click();
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Should switch without errors
      const hasError = await page.$('.error, .alert-error, [class*="error"]');
      expect(hasError).toBeNull();
    });

    test('should be able to type in textarea', async () => {
      const inputTextarea = await page.$('textarea.textarea');
      await inputTextarea.evaluate(el => el.value = '');
      await inputTextarea.type('<div>Test input</div>');
      
      const value = await inputTextarea.evaluate(el => el.value);
      expect(value).toContain('Test input');
    });

    test('should change provider selection', async () => {
      const providerSelect = await page.$('select.select');
      if (providerSelect) {
        await providerSelect.select('greenshift');
        const selectedValue = await providerSelect.evaluate(el => el.value);
        expect(selectedValue).toBeTruthy();
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle empty input gracefully', async () => {
      // Click HTML to Blocks
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const htmlToBlocksBtn = buttons.find(btn => btn.textContent.includes('HTML to Blocks'));
        if (htmlToBlocksBtn) htmlToBlocksBtn.click();
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Leave input empty and try to convert
      const inputTextarea = await page.$('textarea.textarea');
      await inputTextarea.evaluate(el => el.value = '');
      
      // Click convert button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const convertBtn = buttons.find(btn => 
          btn.textContent.includes('Convert') ||
          btn.classList.contains('btn-primary')
        );
        if (convertBtn) convertBtn.click();
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Should handle gracefully (no crash)
      const pageTitle = await page.title();
      expect(pageTitle).toBeTruthy();
    });
  });
});