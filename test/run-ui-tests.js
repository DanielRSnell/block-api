#!/usr/bin/env node

import { execSync } from 'child_process';
import puppeteer from 'puppeteer';

console.log('🚀 Starting UI tests for blocks conversion tool...');

// Check if site is reachable
async function checkSiteAvailability() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('🔍 Checking site availability...');
    await page.goto('https://blocks.umbral.ai/tool', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    const title = await page.title();
    console.log(`✅ Site is reachable. Title: ${title}`);
    
    await browser.close();
    return true;
  } catch (error) {
    console.error('❌ Site is not reachable:', error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  const isAvailable = await checkSiteAvailability();
  
  if (!isAvailable) {
    console.error('❌ Cannot run UI tests - site is not available');
    process.exit(1);
  }

  try {
    console.log('🧪 Running UI tests...');
    execSync('npx vitest run test/ui-tests-simple.test.js', { stdio: 'inherit' });
    console.log('✅ UI tests completed successfully!');
  } catch (error) {
    console.error('❌ UI tests failed:', error.message);
    process.exit(1);
  }
}

runTests();