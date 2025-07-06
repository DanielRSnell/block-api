#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Screenshot configuration
 */
const config = {
  viewport: {
    width: 1200,
    height: 800
  },
  screenshots: [
    {
      url: 'http://localhost:3000/',
      filename: 'home.png',
      description: 'Home page'
    },
    {
      url: 'http://localhost:3000/tool',
      filename: 'tool.png',
      description: 'Tool page'
    },
    {
      url: 'http://localhost:3000/api-docs',
      filename: 'api-docs.png',
      description: 'API docs page'
    }
  ],
  outputDir: path.join(__dirname, '..', 'src', 'server', 'views', 'screenshots'),
  timeout: 30000, // 30 seconds timeout
  waitForNetworkIdle: 2000 // Wait 2 seconds for network idle
};

/**
 * Ensure output directory exists
 */
function ensureOutputDirectory() {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
    console.log(`Created output directory: ${config.outputDir}`);
  }
}

/**
 * Take a screenshot of a single page
 * @param {Object} browser - Puppeteer browser instance
 * @param {Object} screenshotConfig - Screenshot configuration
 */
async function takeScreenshot(browser, screenshotConfig) {
  const { url, filename, description } = screenshotConfig;
  
  console.log(`Taking screenshot of ${description} (${url})...`);
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport(config.viewport);
    
    // Navigate to the page with timeout
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: config.timeout 
    });
    
    // Wait a bit more for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, config.waitForNetworkIdle));
    
    // Take full page screenshot
    const outputPath = path.join(config.outputDir, filename);
    await page.screenshot({
      path: outputPath,
      fullPage: true,
      type: 'png'
    });
    
    await page.close();
    
    console.log(`✓ Screenshot saved: ${outputPath}`);
    return { success: true, path: outputPath };
    
  } catch (error) {
    console.error(`✗ Failed to take screenshot of ${description}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main function to take all screenshots
 */
async function takeAllScreenshots() {
  console.log('Starting screenshot capture process...');
  console.log(`Viewport: ${config.viewport.width}x${config.viewport.height}`);
  console.log(`Output directory: ${config.outputDir}`);
  console.log('─'.repeat(60));
  
  // Ensure output directory exists
  ensureOutputDirectory();
  
  let browser;
  const results = [];
  
  try {
    // Launch browser
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    console.log('Browser launched successfully');
    
    // Take screenshots sequentially
    for (const screenshotConfig of config.screenshots) {
      const result = await takeScreenshot(browser, screenshotConfig);
      results.push({
        ...screenshotConfig,
        ...result
      });
    }
    
  } catch (error) {
    console.error('Error during screenshot process:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  }
  
  // Print summary
  console.log('─'.repeat(60));
  console.log('Screenshot Summary:');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  successful.forEach(result => {
    console.log(`✓ ${result.description}: ${result.path}`);
  });
  
  failed.forEach(result => {
    console.log(`✗ ${result.description}: ${result.error}`);
  });
  
  console.log(`\nTotal: ${results.length} | Successful: ${successful.length} | Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\nSome screenshots failed. Please check that:');
    console.log('1. The server is running on http://localhost:3000');
    console.log('2. All requested pages are accessible');
    console.log('3. The server is fully started and responsive');
    process.exit(1);
  } else {
    console.log('\nAll screenshots completed successfully!');
  }
}

// Run if called directly
if (require.main === module) {
  takeAllScreenshots().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { takeAllScreenshots, config };