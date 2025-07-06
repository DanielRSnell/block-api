#!/usr/bin/env node

import { Command } from 'commander';
import { BlockConverter } from './BlockConverter.js';
import chalk from 'chalk';

const program = new Command();
const converter = new BlockConverter();

// CLI Version and description
program
  .name('block-convert')
  .description('Convert HTML template files to GenerateBlocks format')
  .version('1.0.0');

// Convert all blocks command
program
  .command('convert')
  .description('Convert all template.html files to block.html files')
  .option('-d, --blocks-dir <dir>', 'Blocks directory path', './blocks')
  .option('--generate', 'Use only GenerateBlocks providers')
  .option('--generate-pro', 'Use GenerateBlocks + GenerateBlocks Pro providers (default)')
  .option('--gutenberg', 'Use native Gutenberg block providers')
  .option('--greenshift', 'Use Greenshift blocks (GreenLight Element)')
  .option('--no-classes', 'Do not preserve CSS classes')
  .option('--no-unique-ids', 'Do not generate unique IDs')
  .option('--no-semantic', 'Disable semantic mapping')
  .option('-v, --verbose', 'Verbose output')
  .option('--dry-run', 'Preview changes without writing files')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 Block Convert CLI v1.0.0\n'));
      
      // Determine provider mode
      let providerMode = 'generate-pro'; // default
      if (options.generate && !options.generatePro && !options.gutenberg && !options.greenshift) {
        providerMode = 'generate';
      } else if (options.gutenberg && !options.generate && !options.generatePro && !options.greenshift) {
        providerMode = 'gutenberg';
      } else if (options.greenshift && !options.generate && !options.generatePro && !options.gutenberg) {
        providerMode = 'greenshift';
      } else if (options.generatePro || (!options.generate && !options.gutenberg && !options.greenshift)) {
        providerMode = 'generate-pro';
      }
      
      const opts = {
        blocksDir: options.blocksDir,
        providerMode,
        preserveClasses: options.classes !== false,
        generateUniqueIds: options.uniqueIds !== false,
        semanticMapping: options.semantic !== false,
        verbose: options.verbose || false,
        dryRun: options.dryRun || false
      };
      
      if (opts.dryRun) {
        console.log(chalk.yellow('🔍 DRY RUN MODE - No files will be modified\n'));
      }
      
      const stats = await converter.convertAllBlocks(opts);
      
      if (stats.successful > 0) {
        console.log(chalk.green(`\n✨ Successfully converted ${stats.successful} block(s)!`));
      }
      
      if (stats.failed > 0) {
        console.log(chalk.red(`\n💥 Failed to convert ${stats.failed} block(s)`));
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('💥 CLI Error:'), error.message);
      process.exit(1);
    }
  });

// Convert specific block command
program
  .command('convert-block <name>')
  .description('Convert a specific block by name')
  .option('-d, --blocks-dir <dir>', 'Blocks directory path', './blocks')
  .option('--generate', 'Use only GenerateBlocks providers')
  .option('--generate-pro', 'Use GenerateBlocks + GenerateBlocks Pro providers (default)')
  .option('--gutenberg', 'Use native Gutenberg block providers')
  .option('--greenshift', 'Use Greenshift blocks (GreenLight Element)')
  .option('--no-classes', 'Do not preserve CSS classes')
  .option('--no-unique-ids', 'Do not generate unique IDs')
  .option('--no-semantic', 'Disable semantic mapping')
  .option('-v, --verbose', 'Verbose output')
  .option('--dry-run', 'Preview changes without writing files')
  .action(async (blockName, options) => {
    try {
      console.log(chalk.blue('🚀 Block Convert CLI v1.0.0\n'));
      
      // Determine provider mode
      let providerMode = 'generate-pro'; // default
      if (options.generate && !options.generatePro && !options.gutenberg && !options.greenshift) {
        providerMode = 'generate';
      } else if (options.gutenberg && !options.generate && !options.generatePro && !options.greenshift) {
        providerMode = 'gutenberg';
      } else if (options.greenshift && !options.generate && !options.generatePro && !options.gutenberg) {
        providerMode = 'greenshift';
      } else if (options.generatePro || (!options.generate && !options.gutenberg && !options.greenshift)) {
        providerMode = 'generate-pro';
      }
      
      const opts = {
        blocksDir: options.blocksDir,
        providerMode,
        preserveClasses: options.classes !== false,
        generateUniqueIds: options.uniqueIds !== false,
        semanticMapping: options.semantic !== false,
        verbose: true, // Always verbose for single block
        dryRun: options.dryRun || false
      };
      
      if (opts.dryRun) {
        console.log(chalk.yellow('🔍 DRY RUN MODE - No files will be modified\n'));
      }
      
      await converter.convertBlock(blockName, opts);
      
    } catch (error) {
      console.error(chalk.red('💥 CLI Error:'), error.message);
      process.exit(1);
    }
  });

// List blocks command
program
  .command('list')
  .description('List all available blocks')
  .option('-d, --blocks-dir <dir>', 'Blocks directory path', './blocks')
  .option('-v, --verbose', 'Show detailed information')
  .action(async (options) => {
    try {
      console.log(chalk.blue('📦 Available Blocks\n'));
      
      const blocks = await converter.listBlocks({
        blocksDir: options.blocksDir,
        verbose: options.verbose
      });
      
      if (blocks.length === 0) {
        console.log(chalk.yellow('No blocks found. Create a block directory with template.html to get started.'));
      } else {
        console.log(chalk.green(`\n✨ Found ${blocks.length} block(s) ready for conversion`));
      }
      
    } catch (error) {
      console.error(chalk.red('💥 CLI Error:'), error.message);
      process.exit(1);
    }
  });

// Watch command (placeholder)
program
  .command('watch')
  .description('Watch for changes and auto-convert')
  .option('-d, --blocks-dir <dir>', 'Blocks directory path', './blocks')
  .action(async (options) => {
    try {
      console.log(chalk.blue('👀 Block Convert Watcher\n'));
      await converter.watchBlocks(options);
    } catch (error) {
      console.error(chalk.red('💥 CLI Error:'), error.message);
      process.exit(1);
    }
  });

// Info command
program
  .command('info')
  .description('Show system information')
  .action(() => {
    console.log(chalk.blue('ℹ️  Block Convert CLI Information\n'));
    console.log('📁 Expected structure:');
    console.log('   blocks/');
    console.log('   ├── block-name-1/');
    console.log('   │   ├── template.html    # Source HTML');
    console.log('   │   ├── template.css     # Styles');
    console.log('   │   ├── template.js      # Scripts');
    console.log('   │   └── block.html       # Generated blocks');
    console.log('   └── block-name-2/');
    console.log('       └── template.html');
    console.log('');
    console.log('🎯 Commands:');
    console.log('   convert              Convert all blocks');
    console.log('   convert-block <name> Convert specific block');
    console.log('   list                 List available blocks');
    console.log('   watch                Watch for changes');
    console.log('');
    console.log('💡 Examples:');
    console.log('   block-convert convert');
    console.log('   block-convert convert-block hero');
    console.log('   block-convert list --verbose');
    console.log('   block-convert convert --dry-run');
  });

// Handle unknown commands
program.on('command:*', function () {
  console.error(chalk.red('💥 Invalid command: %s'), program.args.join(' '));
  console.log(chalk.yellow('See --help for a list of available commands.'));
  process.exit(1);
});

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(1);
}

// Parse command line arguments
program.parse(process.argv);