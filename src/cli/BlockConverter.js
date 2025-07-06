import fs from 'fs/promises';
import path from 'path';
import { HtmlToBlocksConverter } from '../core/HtmlToBlocksConverter.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CLI Block Converter
 * Converts template.html files in blocks directory to block.html files
 */
export class BlockConverter {
  constructor() {
    this.converter = null; // Will be initialized with provider mode
    this.stats = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
  }

  /**
   * Convert all blocks in the blocks directory
   * @param {Object} options - Conversion options
   */
  async convertAllBlocks(options = {}) {
    const defaultOptions = {
      blocksDir: './blocks',
      providerMode: 'generate-pro',
      preserveClasses: true,
      generateUniqueIds: true,
      semanticMapping: true,
      verbose: false,
      dryRun: false
    };

    const opts = { ...defaultOptions, ...options };
    
    // Initialize converter with provider mode
    this.converter = new HtmlToBlocksConverter(opts.providerMode);
    
    console.log('🚀 Starting block conversion...');
    console.log(`📁 Scanning directory: ${opts.blocksDir}`);
    
    try {
      // Ensure converter is ready
      await this.converter.ensureProvidersInitialized();
      
      // Discover all block directories
      const blockDirs = await this.discoverBlockDirectories(opts.blocksDir);
      
      if (blockDirs.length === 0) {
        console.log('⚠️  No block directories found');
        return this.stats;
      }
      
      console.log(`📦 Found ${blockDirs.length} block(s): ${blockDirs.join(', ')}`);
      
      // Process each block directory
      for (const blockDir of blockDirs) {
        await this.convertSingleBlock(blockDir, opts);
      }
      
      // Print final stats
      this.printStats();
      
      return this.stats;
      
    } catch (error) {
      console.error('💥 Failed to convert blocks:', error.message);
      throw error;
    }
  }

  /**
   * Convert a single block
   * @param {string} blockDir - Block directory name
   * @param {Object} options - Conversion options
   */
  async convertSingleBlock(blockDir, options) {
    const blockPath = path.join(options.blocksDir, blockDir);
    const templatePath = path.join(blockPath, 'template.html');
    const outputPath = path.join(blockPath, 'block.html');
    const unminifiedPath = path.join(blockPath, 'unminified.html');
    
    this.stats.processed++;
    
    try {
      if (options.verbose) {
        console.log(`\n🔄 Processing: ${blockDir}`);
        console.log(`   📄 Template: ${templatePath}`);
        console.log(`   💾 Output: ${outputPath}`);
        console.log(`   📄 Unminified: ${unminifiedPath}`);
      }
      
      // Check if template.html exists
      try {
        await fs.access(templatePath);
      } catch (error) {
        throw new Error(`template.html not found in ${blockDir}`);
      }
      
      // Read template.html
      const templateHtml = await fs.readFile(templatePath, 'utf8');
      
      if (options.verbose) {
        console.log(`   📏 Template size: ${templateHtml.length} characters`);
      }
      
      // Convert HTML to blocks
      const result = await this.converter.convertHtmlToBlocks(templateHtml, {
        preserveClasses: options.preserveClasses,
        generateUniqueIds: options.generateUniqueIds,
        semanticMapping: options.semanticMapping
      });
      
      if (!result.success) {
        throw new Error(`Conversion failed: ${result.error}`);
      }
      
      // Get both minified and unminified markup
      const minifiedMarkup = result.minifiedMarkup;
      const unminifiedMarkup = result.unminifiedMarkup;
      
      if (options.verbose) {
        console.log(`   🧱 Generated ${result.conversionStats.totalBlocks} block(s)`);
        console.log(`   📊 Block types:`, Object.keys(result.conversionStats.blockTypes).join(', '));
      }
      
      // Write both files (unless dry run)
      if (!options.dryRun) {
        await fs.writeFile(outputPath, minifiedMarkup, 'utf8');
        await fs.writeFile(unminifiedPath, unminifiedMarkup, 'utf8');
        console.log(`✅ ${blockDir}: Converted successfully (minified + unminified)`);
      } else {
        console.log(`🔍 ${blockDir}: Conversion successful (dry run)`);
      }
      
      this.stats.successful++;
      
    } catch (error) {
      console.error(`❌ ${blockDir}: ${error.message}`);
      this.stats.failed++;
      this.stats.errors.push({
        block: blockDir,
        error: error.message
      });
    }
  }

  /**
   * Discover all block directories
   * @param {string} blocksDir - Blocks directory path
   * @returns {Array} Array of block directory names
   */
  async discoverBlockDirectories(blocksDir) {
    try {
      const items = await fs.readdir(blocksDir, { withFileTypes: true });
      
      const blockDirs = [];
      
      for (const item of items) {
        if (item.isDirectory()) {
          const blockPath = path.join(blocksDir, item.name);
          const templatePath = path.join(blockPath, 'template.html');
          
          try {
            await fs.access(templatePath);
            blockDirs.push(item.name);
          } catch (error) {
            // Skip directories without template.html
          }
        }
      }
      
      return blockDirs.sort();
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Blocks directory not found: ${blocksDir}`);
      }
      throw error;
    }
  }

  /**
   * Convert a specific block by name
   * @param {string} blockName - Name of the block to convert
   * @param {Object} options - Conversion options
   */
  async convertBlock(blockName, options = {}) {
    const defaultOptions = {
      blocksDir: './blocks',
      providerMode: 'generate-pro',
      preserveClasses: true,
      generateUniqueIds: true,
      semanticMapping: true,
      verbose: true
    };

    const opts = { ...defaultOptions, ...options };
    
    // Initialize converter with provider mode
    this.converter = new HtmlToBlocksConverter(opts.providerMode);
    
    console.log(`🎯 Converting specific block: ${blockName}`);
    
    try {
      await this.converter.ensureProvidersInitialized();
      
      const blockDirs = await this.discoverBlockDirectories(opts.blocksDir);
      
      if (!blockDirs.includes(blockName)) {
        throw new Error(`Block '${blockName}' not found. Available blocks: ${blockDirs.join(', ')}`);
      }
      
      await this.convertSingleBlock(blockName, opts);
      
      this.printStats();
      
      return this.stats;
      
    } catch (error) {
      console.error('💥 Failed to convert block:', error.message);
      throw error;
    }
  }

  /**
   * List all available blocks
   * @param {Object} options - Options
   */
  async listBlocks(options = {}) {
    const opts = { blocksDir: './blocks', ...options };
    
    try {
      const blockDirs = await this.discoverBlockDirectories(opts.blocksDir);
      
      if (blockDirs.length === 0) {
        console.log('📭 No blocks found');
        return [];
      }
      
      console.log(`📦 Found ${blockDirs.length} block(s):`);
      
      for (const blockDir of blockDirs) {
        const blockPath = path.join(opts.blocksDir, blockDir);
        const templatePath = path.join(blockPath, 'template.html');
        const outputPath = path.join(blockPath, 'block.html');
        
        try {
          const templateStats = await fs.stat(templatePath);
          const hasOutput = await this.fileExists(outputPath);
          
          console.log(`  📁 ${blockDir}`);
          console.log(`     📄 template.html (${this.formatFileSize(templateStats.size)})`);
          console.log(`     💾 block.html ${hasOutput ? '✅' : '❌'}`);
          
          if (options.verbose && hasOutput) {
            const outputStats = await fs.stat(outputPath);
            console.log(`        Last updated: ${outputStats.mtime.toISOString()}`);
          }
          
        } catch (error) {
          console.log(`  📁 ${blockDir} ❌ (error reading files)`);
        }
      }
      
      return blockDirs;
      
    } catch (error) {
      console.error('💥 Failed to list blocks:', error.message);
      throw error;
    }
  }

  /**
   * Check if file exists
   * @param {string} filePath - File path to check
   * @returns {boolean} Whether file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  /**
   * Print conversion statistics
   */
  printStats() {
    console.log('\n📊 Conversion Summary:');
    console.log(`   📦 Processed: ${this.stats.processed}`);
    console.log(`   ✅ Successful: ${this.stats.successful}`);
    console.log(`   ❌ Failed: ${this.stats.failed}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      for (const error of this.stats.errors) {
        console.log(`   ${error.block}: ${error.error}`);
      }
    }
    
    if (this.stats.successful > 0) {
      console.log('\n🎉 Conversion completed successfully!');
    }
  }

  /**
   * Watch blocks directory for changes and auto-convert
   * @param {Object} options - Watch options
   */
  async watchBlocks(options = {}) {
    const opts = { blocksDir: './blocks', ...options };
    
    console.log(`👀 Watching blocks directory: ${opts.blocksDir}`);
    console.log('   Changes to template.html files will trigger automatic conversion');
    console.log('   Press Ctrl+C to stop watching\n');
    
    // This would require a file watcher implementation
    console.log('🚧 Watch mode not implemented yet - coming soon!');
  }
}