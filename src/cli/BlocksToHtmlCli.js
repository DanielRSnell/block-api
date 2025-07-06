#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { BlocksToHtmlConverter } from '../core/BlocksToHtmlConverter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * CLI tool for converting WordPress blocks to HTML
 */
export class BlocksToHtmlCli {
  constructor() {
    this.converter = new BlocksToHtmlConverter();
  }

  /**
   * Convert blocks file to HTML
   * @param {string} inputFile - Path to blocks file
   * @param {string} outputFile - Path to output HTML file
   */
  async convertFile(inputFile, outputFile) {
    try {
      console.log(chalk.blue('🔄 Converting blocks to HTML...'));
      console.log(chalk.gray(`Input: ${inputFile}`));
      console.log(chalk.gray(`Output: ${outputFile}`));
      
      // Read the blocks file
      const blockMarkup = readFileSync(inputFile, 'utf8');
      
      // Convert to HTML
      const result = this.converter.convertWithAnalysis(blockMarkup);
      
      // Write output file
      writeFileSync(outputFile, result.html);
      
      // Show results
      console.log(chalk.green('✅ Conversion completed successfully!'));
      console.log(chalk.cyan('\n📊 Analysis:'));
      console.log(chalk.gray(`  Total blocks: ${result.analysis.totalBlocks}`));
      console.log(chalk.gray(`  Greenshift blocks: ${result.analysis.greenshiftBlocks}`));
      console.log(chalk.gray(`  Block types: ${Object.keys(result.analysis.blockTypes).join(', ')}`));
      
      if (result.analysis.elements.length > 0) {
        console.log(chalk.gray(`  HTML elements: ${[...new Set(result.analysis.elements)].join(', ')}`));
      }
      
      console.log(chalk.gray(`\n📄 Output file: ${outputFile}`));
      console.log(chalk.gray(`📏 HTML size: ${result.html.length} characters`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Test conversion on a specific blocks directory
   * @param {string} blocksDir - Path to blocks directory
   */
  async testConversion(blocksDir) {
    try {
      const projectRoot = join(__dirname, '../..');
      const fullPath = join(projectRoot, blocksDir);
      const blockFile = join(fullPath, 'block.html');
      const outputFile = join(fullPath, 'static.html');
      
      console.log(chalk.blue('🧪 Testing blocks to HTML conversion...'));
      console.log(chalk.gray(`Directory: ${blocksDir}`));
      
      await this.convertFile(blockFile, outputFile);
      
      console.log(chalk.green('🎉 Test completed successfully!'));
      
    } catch (error) {
      console.error(chalk.red('❌ Test failed:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(chalk.blue('📖 Blocks to HTML Converter CLI'));
    console.log(chalk.gray('Convert WordPress block markup to clean HTML'));
    console.log();
    console.log(chalk.yellow('Usage:'));
    console.log('  node src/cli/BlocksToHtmlCli.js <command> [options]');
    console.log();
    console.log(chalk.yellow('Commands:'));
    console.log('  convert <input> <output>  Convert blocks file to HTML');
    console.log('  test <blocks-dir>         Test conversion on blocks directory');
    console.log('  help                      Show this help message');
    console.log();
    console.log(chalk.yellow('Examples:'));
    console.log('  node src/cli/BlocksToHtmlCli.js convert blocks/hero/block.html output.html');
    console.log('  node src/cli/BlocksToHtmlCli.js test blocks/tw-dark-gradient-hero');
    console.log();
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new BlocksToHtmlCli();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help') {
    cli.showHelp();
  } else if (args[0] === 'convert' && args.length === 3) {
    cli.convertFile(args[1], args[2]);
  } else if (args[0] === 'test' && args.length === 2) {
    cli.testConversion(args[1]);
  } else {
    console.error(chalk.red('❌ Invalid command or arguments'));
    cli.showHelp();
    process.exit(1);
  }
}