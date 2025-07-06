import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class VisualTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3000';
    this.screenshotDir = join(__dirname, 'screenshots');
  }

  async init() {
    console.log('🚀 Initializing Puppeteer...');
    
    // Create screenshots directory
    await fs.mkdir(this.screenshotDir, { recursive: true });
    
    // Launch browser
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/automated testing
      defaultViewport: null,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport sizes we want to test
    await this.page.setViewport({ width: 1400, height: 900 });
    
    console.log('✅ Browser launched successfully');
  }

  async testPage(url, pageName) {
    console.log(`\n📱 Testing ${pageName} (${url})`);
    
    try {
      // Navigate to page
      await this.page.goto(`${this.baseUrl}${url}`, { 
        waitUntil: 'networkidle2',
        timeout: 10000 
      });
      
      // Wait for fonts to load
      await this.page.evaluateHandle('document.fonts.ready');
      
      // Take full page screenshot
      const screenshotPath = join(this.screenshotDir, `${pageName}-desktop.png`);
      await this.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      console.log(`📸 Desktop screenshot saved: ${screenshotPath}`);
      
      // Test mobile viewport
      await this.page.setViewport({ width: 375, height: 667 }); // iPhone SE
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for responsive changes
      
      const mobileScreenshotPath = join(this.screenshotDir, `${pageName}-mobile.png`);
      await this.page.screenshot({ 
        path: mobileScreenshotPath, 
        fullPage: true 
      });
      console.log(`📱 Mobile screenshot saved: ${mobileScreenshotPath}`);
      
      // Test tablet viewport
      await this.page.setViewport({ width: 768, height: 1024 }); // iPad
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const tabletScreenshotPath = join(this.screenshotDir, `${pageName}-tablet.png`);
      await this.page.screenshot({ 
        path: tabletScreenshotPath, 
        fullPage: true 
      });
      console.log(`📱 Tablet screenshot saved: ${tabletScreenshotPath}`);
      
      // Reset to desktop
      await this.page.setViewport({ width: 1400, height: 900 });
      
      // Run accessibility and performance checks
      await this.runPageAnalysis(pageName);
      
    } catch (error) {
      console.error(`❌ Error testing ${pageName}:`, error.message);
    }
  }

  async runPageAnalysis(pageName) {
    console.log(`🔍 Running analysis for ${pageName}...`);
    
    try {
      // Check for console errors
      const consoleLogs = [];
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleLogs.push(`ERROR: ${msg.text()}`);
        }
      });
      
      // Check CSS loading
      const cssAnalysis = await this.page.evaluate(() => {
        const stylesheets = Array.from(document.styleSheets);
        const loadedCSS = stylesheets.filter(sheet => {
          try {
            return sheet.cssRules && sheet.cssRules.length > 0;
          } catch (e) {
            return false;
          }
        });
        
        return {
          totalStylesheets: stylesheets.length,
          loadedStylesheets: loadedCSS.length,
          stylesheetHrefs: stylesheets.map(s => s.href).filter(Boolean)
        };
      });
      
      // Check for missing images
      const imageAnalysis = await this.page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const brokenImages = images.filter(img => !img.complete || img.naturalWidth === 0);
        
        return {
          totalImages: images.length,
          brokenImages: brokenImages.length,
          brokenImageSrcs: brokenImages.map(img => img.src)
        };
      });
      
      // Check font loading
      const fontAnalysis = await this.page.evaluate(async () => {
        await document.fonts.ready;
        const loadedFonts = [];
        for (const font of document.fonts) {
          if (font.status === 'loaded') {
            loadedFonts.push(`${font.family} ${font.style} ${font.weight}`);
          }
        }
        return {
          fontsLoaded: loadedFonts.length,
          loadedFonts: loadedFonts
        };
      });
      
      // Check for layout issues
      const layoutAnalysis = await this.page.evaluate(() => {
        const issues = [];
        
        // Check for horizontal scroll
        if (document.documentElement.scrollWidth > window.innerWidth) {
          issues.push('Horizontal scroll detected');
        }
        
        // Check for elements outside viewport
        const elements = document.querySelectorAll('*');
        let elementsOutsideViewport = 0;
        
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > window.innerWidth) {
            elementsOutsideViewport++;
          }
        });
        
        if (elementsOutsideViewport > 0) {
          issues.push(`${elementsOutsideViewport} elements extending beyond viewport`);
        }
        
        return issues;
      });
      
      // Performance metrics
      const performanceMetrics = await this.page.metrics();
      
      // Output analysis results
      console.log('\n📊 Analysis Results:');
      console.log('CSS:', cssAnalysis);
      console.log('Images:', imageAnalysis);
      console.log('Fonts:', fontAnalysis);
      console.log('Layout Issues:', layoutAnalysis);
      console.log('Performance:', {
        JSHeapUsedSize: `${Math.round(performanceMetrics.JSHeapUsedSize / 1024 / 1024)}MB`,
        JSHeapTotalSize: `${Math.round(performanceMetrics.JSHeapTotalSize / 1024 / 1024)}MB`,
        DOMNodes: performanceMetrics.Nodes
      });
      
      if (consoleLogs.length > 0) {
        console.log('Console Errors:', consoleLogs);
      }
      
    } catch (error) {
      console.error('❌ Analysis error:', error.message);
    }
  }

  async testInteractivity(pageName) {
    if (pageName !== 'tool') return;
    
    console.log('\n🎮 Testing interactive elements...');
    
    try {
      // Test mode switcher
      const modeSwitcher = await this.page.$('[x-data="blockConverter()"]');
      if (modeSwitcher) {
        console.log('✅ Alpine.js component found');
        
        // Test button clicks
        const buttons = await this.page.$$('.btn');
        console.log(`🔘 Found ${buttons.length} buttons`);
        
        // Test form inputs
        const inputs = await this.page.$$('.input, .textarea, .select');
        console.log(`📝 Found ${inputs.length} form inputs`);
      }
      
    } catch (error) {
      console.error('❌ Interactivity test error:', error.message);
    }
  }

  async runAllTests() {
    console.log('🧪 Starting visual tests...\n');
    
    await this.init();
    
    const testCases = [
      { url: '/', name: 'home' },
      { url: '/tool', name: 'tool' },
      { url: '/api-docs', name: 'api-docs' }
    ];
    
    for (const testCase of testCases) {
      await this.testPage(testCase.url, testCase.name);
      await this.testInteractivity(testCase.name);
    }
    
    console.log('\n✅ All tests completed!');
    console.log(`📁 Screenshots saved in: ${this.screenshotDir}`);
    
    // Keep browser open for manual inspection
    console.log('\n👀 Browser will remain open for manual inspection...');
    console.log('📖 Navigate to pages and inspect visually');
    console.log('🔍 Check for spacing, alignment, and visual issues');
    console.log('📱 Test responsive behavior');
    console.log('⌨️  Press Ctrl+C to close when done');
    
    // Wait for user input or timeout
    setTimeout(() => {
      this.cleanup();
    }, 30000); // Auto-close after 30 seconds
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    if (this.browser) {
      await this.browser.close();
    }
    process.exit(0);
  }
}

// Run the tests
const tester = new VisualTester();

// Handle process termination
process.on('SIGINT', () => {
  tester.cleanup();
});

process.on('SIGTERM', () => {
  tester.cleanup();
});

tester.runAllTests().catch(error => {
  console.error('❌ Test runner error:', error);
  tester.cleanup();
});