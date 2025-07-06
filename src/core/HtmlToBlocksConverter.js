import { JSDOM } from 'jsdom';
import { minify } from 'html-minifier-terser';
import { ProviderManager } from './ProviderManager.js';
import { generateUniqueId } from '../utils/blockUtils.js';
import { sanitizeHtml } from '../utils/htmlUtils.js';

/**
 * Main HTML to GenerateBlocks converter
 * Converts HTML strings to WordPress GenerateBlocks format
 */
export class HtmlToBlocksConverter {
  constructor(providerMode = 'generate-pro') {
    this.providerManager = new ProviderManager(this);
    this.providersInitialized = false;
    this.providerMode = providerMode;
    this.initializationPromise = this.initializeProviders();
  }

  /**
   * Ensure providers are initialized before conversion
   */
  async ensureProvidersInitialized() {
    if (!this.providersInitialized) {
      await this.initializationPromise;
      this.providersInitialized = true;
    }
  }

  /**
   * Initialize and register providers based on mode
   */
  async initializeProviders() {
    console.log(`🔧 Initializing providers (${this.providerMode} mode)...`);
    
    try {
      const { FallbackProvider } = await import('../providers/FallbackProvider.js');
      const { FormProvider } = await import('../providers/FormProvider.js');
      
      // Always register FormProvider first with highest priority
      this.providerManager.registerProvider(new FormProvider()); // Priority 150
      
      if (this.providerMode === 'gutenberg') {
        // Load native Gutenberg block providers
        await this.loadGutenbergProviders();
      } else if (this.providerMode === 'generate') {
        // Load GenerateBlocks providers with Gutenberg fallbacks
        await this.loadGenerateBlocksProviders();
        await this.loadGutenbergProvidersAsLowPriority();
      } else if (this.providerMode === 'greenshift') {
        // Load Greenshift providers with Gutenberg fallbacks
        await this.loadGreenshiftProviders();
        await this.loadGutenbergProvidersAsLowPriority();
      } else {
        // Load GenerateBlocks + GenerateBlocks Pro providers with Gutenberg fallbacks (default)
        await this.loadGenerateBlocksProviders();
        await this.loadGenerateBlocksProProviders();
        await this.loadGutenbergProvidersAsLowPriority();
      }
      
      // Always register fallback provider last
      this.providerManager.registerProvider(new FallbackProvider()); // Priority 1

      console.log('✅ All providers registered successfully');
      console.log('📊 Provider stats:', this.providerManager.getStats());
    } catch (error) {
      console.error('❌ Failed to initialize providers:', error);
      throw new Error(`Provider initialization failed: ${error.message}`);
    }
  }

  /**
   * Load GenerateBlocks providers
   */
  async loadGenerateBlocksProviders() {
    const { MediaProvider } = await import('../providers/generateblocks/MediaProvider.js');
    const { ShapeProvider } = await import('../providers/generateblocks/ShapeProvider.js');
    const { QueryProvider } = await import('../providers/generateblocks/QueryProvider.js');
    const { ButtonProvider } = await import('../providers/generateblocks/ButtonProvider.js');
    const { TextProvider } = await import('../providers/generateblocks/TextProvider.js');
    const { ElementProvider } = await import('../providers/generateblocks/ElementProvider.js');

    this.providerManager.registerProvider(new MediaProvider()); // Priority 100
    this.providerManager.registerProvider(new ShapeProvider()); // Priority 80
    this.providerManager.registerProvider(new QueryProvider()); // Priority 75
    this.providerManager.registerProvider(new ButtonProvider()); // Priority 60
    this.providerManager.registerProvider(new TextProvider()); // Priority 50
    this.providerManager.registerProvider(new ElementProvider()); // Priority 25
  }

  /**
   * Load GenerateBlocks Pro providers
   */
  async loadGenerateBlocksProProviders() {
    const { TabsProvider } = await import('../providers/generateblocks-pro/TabsProvider.js');
    const { AccordionProvider } = await import('../providers/generateblocks-pro/AccordionProvider.js');
    const { NavigationProvider } = await import('../providers/generateblocks-pro/NavigationProvider.js');

    this.providerManager.registerProvider(new TabsProvider()); // Priority 75
    this.providerManager.registerProvider(new AccordionProvider()); // Priority 75
    this.providerManager.registerProvider(new NavigationProvider()); // Priority 75
  }

  /**
   * Load Greenshift providers
   */
  async loadGreenshiftProviders() {
    const { ElementProvider } = await import('../providers/greenshift/ElementProvider.js');

    this.providerManager.registerProvider(new ElementProvider()); // Priority 80
  }

  /**
   * Load native Gutenberg block providers
   */
  async loadGutenbergProviders() {
    const { ImageProvider } = await import('../providers/gutenberg/ImageProvider.js');
    const { TableProvider } = await import('../providers/gutenberg/TableProvider.js');
    const { ListProvider } = await import('../providers/gutenberg/ListProvider.js');
    const { QuoteProvider } = await import('../providers/gutenberg/QuoteProvider.js');
    const { CodeProvider } = await import('../providers/gutenberg/CodeProvider.js');
    const { HeadingProvider } = await import('../providers/gutenberg/HeadingProvider.js');
    const { ButtonProvider } = await import('../providers/gutenberg/ButtonProvider.js');
    const { ParagraphProvider } = await import('../providers/gutenberg/ParagraphProvider.js');
    const { GroupProvider } = await import('../providers/gutenberg/GroupProvider.js');
    const { DetailsProvider } = await import('../providers/gutenberg/DetailsProvider.js');

    // Register providers in priority order (highest first)
    this.providerManager.registerProvider(new ImageProvider()); // Priority 80
    this.providerManager.registerProvider(new TableProvider()); // Priority 70
    this.providerManager.registerProvider(new ListProvider()); // Priority 70
    this.providerManager.registerProvider(new QuoteProvider()); // Priority 70
    this.providerManager.registerProvider(new CodeProvider()); // Priority 70
    this.providerManager.registerProvider(new DetailsProvider()); // Priority 65
    this.providerManager.registerProvider(new HeadingProvider()); // Priority 60
    this.providerManager.registerProvider(new ButtonProvider()); // Priority 60
    this.providerManager.registerProvider(new ParagraphProvider()); // Priority 50
    this.providerManager.registerProvider(new GroupProvider()); // Priority 25
  }

  /**
   * Load Gutenberg block providers with lower priority as fallbacks
   */
  async loadGutenbergProvidersAsLowPriority() {
    const { ImageProvider } = await import('../providers/gutenberg/ImageProvider.js');
    const { TableProvider } = await import('../providers/gutenberg/TableProvider.js');
    const { ListProvider } = await import('../providers/gutenberg/ListProvider.js');
    const { QuoteProvider } = await import('../providers/gutenberg/QuoteProvider.js');
    const { CodeProvider } = await import('../providers/gutenberg/CodeProvider.js');
    const { HeadingProvider } = await import('../providers/gutenberg/HeadingProvider.js');
    const { ButtonProvider } = await import('../providers/gutenberg/ButtonProvider.js');
    const { ParagraphProvider } = await import('../providers/gutenberg/ParagraphProvider.js');
    const { GroupProvider } = await import('../providers/gutenberg/GroupProvider.js');
    const { DetailsProvider } = await import('../providers/gutenberg/DetailsProvider.js');

    // Create a custom GutenbergFallbackProvider class that modifies priority
    class GutenbergFallbackProvider {
      constructor(originalProvider, lowPriority) {
        this.originalProvider = originalProvider;
        this.lowPriority = lowPriority;
      }

      canHandle(element, options) {
        return this.originalProvider.canHandle(element, options);
      }

      async convert(element, options) {
        return await this.originalProvider.convert(element, options);
      }

      getPriority() {
        return this.lowPriority;
      }

      getSupportedElements() {
        return this.originalProvider.getSupportedElements ? this.originalProvider.getSupportedElements() : [];
      }
    }

    // Register Gutenberg providers with priorities between GenerateBlocks and fallback
    // These should be higher than ElementProvider (25) for specific elements but lower than specialized GB providers
    this.providerManager.registerProvider(new GutenbergFallbackProvider(new QuoteProvider(), 30)); // Higher than ElementProvider for blockquotes
    this.providerManager.registerProvider(new GutenbergFallbackProvider(new TableProvider(), 30)); // Higher than ElementProvider for tables
    this.providerManager.registerProvider(new GutenbergFallbackProvider(new ListProvider(), 30)); // Higher than ElementProvider for lists
    this.providerManager.registerProvider(new GutenbergFallbackProvider(new CodeProvider(), 30)); // Higher than ElementProvider for code
    this.providerManager.registerProvider(new GutenbergFallbackProvider(new DetailsProvider(), 28)); 
    this.providerManager.registerProvider(new GutenbergFallbackProvider(new ImageProvider(), 20)); // Lower than GB MediaProvider
    this.providerManager.registerProvider(new GutenbergFallbackProvider(new HeadingProvider(), 15)); // Lower than GB TextProvider for headings
    this.providerManager.registerProvider(new GutenbergFallbackProvider(new ButtonProvider(), 15)); // Lower than GB ButtonProvider
    this.providerManager.registerProvider(new GutenbergFallbackProvider(new ParagraphProvider(), 15)); // Lower than GB TextProvider
    this.providerManager.registerProvider(new GutenbergFallbackProvider(new GroupProvider(), 5)); // Low priority for divs 
  }

  /**
   * Convert HTML string to GenerateBlocks
   * @param {string} html - HTML string to convert
   * @param {Object} options - Conversion options
   * @returns {Object} Conversion result
   */
  async convertHtmlToBlocks(html, options = {}) {
    // Ensure providers are initialized before conversion
    await this.ensureProvidersInitialized();

    const defaultOptions = {
      preserveClasses: true,
      preserveIds: true,
      preserveStyles: false,
      fallbackToHtmlBlock: true,
      generateUniqueIds: true,
      semanticMapping: true
    };

    const opts = { ...defaultOptions, ...options };

    try {
      // Clean and prepare HTML
      const cleanHtml = sanitizeHtml(html);
      
      // Parse HTML into DOM
      const dom = this.parseHtml(cleanHtml);
      
      if (!dom) {
        return this.createErrorResponse('Failed to parse HTML');
      }

      // Convert DOM to GenerateBlocks
      const blocks = await this.convertDomToBlocks(dom, opts);
      
      // Generate block markup
      const markup = await this.generateBlockMarkup(blocks);
      
      return {
        success: true,
        blocks,
        markup: markup.minified, // Keep backwards compatibility
        unminifiedMarkup: markup.unminified,
        minifiedMarkup: markup.minified,
        originalHtml: cleanHtml,
        conversionStats: this.getConversionStats(blocks),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return this.createErrorResponse(error.message);
    }
  }

  /**
   * Parse HTML string into DOM
   * @param {string} html - HTML string
   * @returns {Document|null} Parsed DOM or null on failure
   */
  parseHtml(html) {
    try {
      const dom = new JSDOM(`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${html}</body></html>`);
      const body = dom.window.document.body;
      return body;
    } catch (error) {
      console.error('HTML parsing failed:', error);
      return null;
    }
  }

  /**
   * Convert DOM elements to GenerateBlocks structure
   * @param {Element} dom - DOM element to convert
   * @param {Object} options - Conversion options
   * @returns {Array} Array of block data
   */
  async convertDomToBlocks(dom, options) {
    const blocks = [];
    
    for (const node of dom.childNodes) {
      if (node.nodeType === 1) { // Element node
        const block = await this.convertElementToBlock(node, options);
        if (block) {
          blocks.push(block);
        }
      } else if (node.nodeType === 3) { // Text node
        const text = node.textContent?.trim();
        if (text) {
          blocks.push(this.createTextBlock(text, options));
        }
      }
    }
    
    return blocks;
  }

  /**
   * Convert single DOM element to GenerateBlocks block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object|null} Block data or null
   */
  async convertElementToBlock(element, options) {
    return await this.providerManager.convertElement(element, options);
  }

  /**
   * Create text block from string content
   * @param {string} content - Text content
   * @param {Object} options - Conversion options
   * @returns {Object} Block data
   */
  createTextBlock(content, options) {
    if (this.providerMode === 'greenshift') {
      return {
        blockName: 'greenshift-blocks/element',
        attrs: {
          uniqueId: generateUniqueId(),
          tagName: 'p',
          type: 'text',
          innerText: content
        },
        innerBlocks: [],
        innerHTML: `<p>${content}</p>`,
        innerContent: [`<p>${content}</p>`]
      };
    }
    
    return {
      blockName: 'generateblocks/text',
      attrs: {
        uniqueId: generateUniqueId(),
        tagName: 'p',
        content: content,
        className: 'gb-text'
      },
      innerBlocks: [],
      innerHTML: `<p class="gb-text">${content}</p>`,
      innerContent: [`<p class="gb-text">${content}</p>`]
    };
  }

  /**
   * Generate block markup from block data
   * @param {Array} blocks - Array of block data
   * @returns {Object} Block markup (both minified and unminified)
   */
  async generateBlockMarkup(blocks) {
    const unminified = blocks.map(block => this.serializeBlock(block, true)).join('\n\n');
    
    // Minify the final markup to match PHP output format
    const minified = await minify(unminified, {
      collapseWhitespace: true,
      removeComments: false, // Keep WordPress block comments
      removeRedundantAttributes: false,
      removeEmptyAttributes: false,
      minifyCSS: false,
      minifyJS: false,
      processConditionalComments: false,
      removeAttributeQuotes: false,
      removeOptionalTags: false,
      removeTagWhitespace: false, // Keep this false to preserve attribute spacing
      trimCustomFragments: true
    });
    
    // Clean up whitespace but keep block comments on separate lines
    const cleanMinified = minified
      .replace(/\s+</g, '<')  // Remove spaces before tags
      .replace(/>\s+(?!<!-- \/wp:)/g, '>')  // Remove spaces after tags (except before closing block comments)
      .replace(/<!-- \/wp:/g, '\n<!-- /wp:')  // Put closing block comments on new lines
      .replace(/<!-- wp:/g, '\n<!-- wp:')  // Put opening block comments on new lines
      .replace(/^\n+/, '')  // Remove leading newlines
      .trim();
    
    return {
      unminified,
      minified: cleanMinified
    };
  }

  /**
   * Serialize block to WordPress block format
   * @param {Object} block - Block data
   * @param {boolean} formatted - Whether to include formatting (line breaks)
   * @returns {string} Serialized block
   */
  serializeBlock(block, formatted = false) {
    const { blockName, attrs, innerBlocks, innerContent } = block;
    
    // Build attribute string
    const attrString = Object.keys(attrs).length > 0 
      ? ' ' + JSON.stringify(attrs)
      : '';
    
    // Handle self-closing blocks
    if (!innerBlocks?.length && !innerContent?.length) {
      return `<!-- wp:${blockName}${attrString} /-->`;
    }
    
    // Build content
    let content = '';
    let childIndex = 0;
    
    if (innerContent) {
      for (const item of innerContent) {
        if (item === null) {
          // Placeholder for child block
          if (innerBlocks?.[childIndex]) {
            const childSeparator = formatted ? '\n' : '';
            content += childSeparator + this.serializeBlock(innerBlocks[childIndex], formatted);
            childIndex++;
          }
        } else {
          content += item;
        }
      }
    }
    
    if (formatted) {
      return `<!-- wp:${blockName}${attrString} -->\n${content}\n<!-- /wp:${blockName} -->`;
    } else {
      return `<!-- wp:${blockName}${attrString} -->${content}<!-- /wp:${blockName} -->`;
    }
  }

  /**
   * Get conversion statistics
   * @param {Array} blocks - Array of block data
   * @returns {Object} Statistics
   */
  getConversionStats(blocks) {
    const stats = {
      totalBlocks: 0,
      generateblocksBlocks: 0,
      greenshiftBlocks: 0,
      htmlFallbackBlocks: 0,
      blockTypes: {}
    };

    const countBlocks = (blockArray) => {
      for (const block of blockArray) {
        stats.totalBlocks++;
        
        const blockName = block.blockName;
        if (blockName.startsWith('generateblocks/')) {
          stats.generateblocksBlocks++;
        } else if (blockName.startsWith('greenshift-blocks/')) {
          stats.greenshiftBlocks++;
        } else if (blockName === 'core/html') {
          stats.htmlFallbackBlocks++;
        }
        
        stats.blockTypes[blockName] = (stats.blockTypes[blockName] || 0) + 1;
        
        if (block.innerBlocks?.length) {
          countBlocks(block.innerBlocks);
        }
      }
    };

    countBlocks(blocks);
    return stats;
  }

  /**
   * Create error response
   * @param {string} message - Error message
   * @returns {Object} Error response
   */
  createErrorResponse(message) {
    return {
      success: false,
      error: message,
      blocks: [],
      markup: '',
      timestamp: new Date().toISOString()
    };
  }
}