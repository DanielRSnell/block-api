import { BaseProvider } from '../BaseProvider.js';
import { isCustomElement } from '../../utils/htmlUtils.js';
import crypto from 'crypto';

// Import BaseProvider for static access to defaultAttributes
const { defaultAttributes } = BaseProvider;

/**
 * Query Provider
 * Handles conversion of query custom elements to GenerateBlocks query blocks
 * Covers query, looper, loop-item, query-page-numbers, query-no-results
 */
export class QueryProvider extends BaseProvider {
  /**
   * Query element mappings to GenerateBlocks (1:1 alignment)
   */
  static queryElementMappings = {
    'query': {
      blockType: 'generateblocks/query',
      requiredChildren: ['looper'],
      optionalChildren: ['query-page-numbers', 'query-no-results'],
      tagName: 'section'
    },
    'looper': {
      blockType: 'generateblocks/looper',
      requiredChildren: ['loop-item'],
      parentRequired: 'query',
      tagName: 'div'
    },
    'loop-item': {
      blockType: 'generateblocks/loop-item',
      parentRequired: 'looper',
      tagName: 'article'
    },
    'query-page-numbers': {
      blockType: 'generateblocks/query-page-numbers',
      parentRequired: 'query',
      tagName: 'nav'
    },
    'query-no-results': {
      blockType: 'generateblocks/query-no-results',
      parentRequired: 'query',
      tagName: 'div'
    }
  };

  /**
   * Query attribute mappings
   */
  static queryAttributeMappings = {
    'post-type': 'query.post_type',
    'posts-per-page': 'query.posts_per_page',
    'meta-query': 'query.meta_query',
    'tax-query': 'query.tax_query',
    'order-by': 'query.orderby',
    'order': 'query.order',
    'inherit-query': 'inheritQuery',
    'query-id': 'queryId'
  };

  /**
   * Pagination attribute mappings
   */
  static paginationAttributeMappings = {
    'mid-size': 'midSize',
    'show-all': 'showAll'
  };

  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    const canHandle = QueryProvider.queryElementMappings.hasOwnProperty(tagName);
    
    // Debug: Log when we check custom elements
    if (canHandle) {
      console.log('QUERY PROVIDER: Found query element:', tagName);
    }
    
    return canHandle;
  }

  /**
   * Convert element to query block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Query block
   */
  async convert(element, options) {
    const tagName = element.tagName.toLowerCase();
    const mapping = QueryProvider.queryElementMappings[tagName];
    const blockType = mapping.blockType;
    
    // Handle different block types
    switch (blockType) {
      case 'generateblocks/query':
        return this.convertQuery(element, mapping, options);
      case 'generateblocks/looper':
        return this.convertLooper(element, mapping, options);
      case 'generateblocks/loop-item':
        return this.convertLoopItem(element, mapping, options);
      case 'generateblocks/query-page-numbers':
        return this.convertQueryPageNumbers(element, mapping, options);
      case 'generateblocks/query-no-results':
        return this.convertQueryNoResults(element, mapping, options);
      default:
        return null;
    }
  }

  /**
   * Convert query element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Query block
   */
  async convertQuery(element, mapping, options) {
    // Build attributes in recovery order: uniqueId, tagName, globalClasses, query, blockId, metadata, className
    const attrs = {};
    
    // 1. uniqueId
    if (options.generateUniqueIds) {
      attrs.uniqueId = this.generateShortUniqueId();
    }
    
    // 2. tagName
    attrs.tagName = mapping.tagName;
    
    // 3. globalClasses - CSS classes from HTML
    if (element.hasAttribute('class')) {
      const classString = element.getAttribute('class');
      const classes = classString.split(' ')
        .map(cls => cls.trim())
        .filter(Boolean);
      if (classes.length > 0) {
        attrs.globalClasses = classes;
      }
    }
    
    // 4. query - Extract query attributes in specific order
    const queryAttrs = {};
    for (const [htmlAttr, blockAttr] of Object.entries(QueryProvider.queryAttributeMappings)) {
      if (element.hasAttribute(htmlAttr)) {
        let value = element.getAttribute(htmlAttr);
        
        // Handle JSON attributes
        if (['meta-query', 'tax-query'].includes(htmlAttr)) {
          try {
            const decoded = JSON.parse(value);
            if (decoded !== null) {
              value = decoded;
            }
          } catch (e) {
            // Keep original value if JSON parsing fails
          }
        }
        
        // Handle numeric attributes
        if (htmlAttr === 'posts-per-page') {
          value = parseInt(value);
        }
        
        // Handle boolean attributes
        if (htmlAttr === 'inherit-query') {
          value = value === 'true' || value === true;
        }
        
        // Set nested query attribute
        if (blockAttr.startsWith('query.')) {
          const queryKey = blockAttr.replace('query.', '');
          queryAttrs[queryKey] = value;
        } else {
          attrs[blockAttr] = value;
        }
      }
    }
    
    if (Object.keys(queryAttrs).length > 0) {
      attrs.query = queryAttrs;
    }
    
    // 5. blockId
    attrs.blockId = `block-${attrs.uniqueId.substring(0, 8)}-${crypto.randomBytes(4).toString('hex')}`;
    
    // 6. metadata
    attrs.metadata = {
      name: 'Query Element'
    };
    
    // 7. className
    attrs.className = 'gb-query';
    
    // Process children
    const { innerBlocks, innerContent } = await this.processChildren(element, options);
    
    // Build opening/closing tags
    const tagName = mapping.tagName;
    const openingTag = this.buildOpeningTag(tagName, attrs, mapping.blockType);
    const closingTag = `</${tagName}>`;
    
    return {
      blockName: mapping.blockType,
      attrs,
      innerBlocks,
      innerHTML: openingTag + this.buildInnerHTML(innerContent) + closingTag,
      innerContent: [openingTag, ...innerContent, closingTag]
    };
  }

  /**
   * Convert looper element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Looper block
   */
  async convertLooper(element, mapping, options) {
    // Build attributes in recovery order: uniqueId, tagName, globalClasses, blockId, metadata, className
    const attrs = {};
    
    // 1. uniqueId
    if (options.generateUniqueIds) {
      attrs.uniqueId = this.generateShortUniqueId();
    }
    
    // 2. tagName
    attrs.tagName = mapping.tagName;
    
    // 3. globalClasses
    if (element.hasAttribute('class')) {
      const classString = element.getAttribute('class');
      const classes = classString.split(' ')
        .map(cls => cls.trim())
        .filter(Boolean);
      if (classes.length > 0) {
        attrs.globalClasses = classes;
      }
    }
    
    // 4. blockId
    attrs.blockId = `block-${attrs.uniqueId.substring(0, 8)}-${crypto.randomBytes(4).toString('hex')}`;
    
    // 5. metadata
    attrs.metadata = {
      name: 'Looper Element'
    };
    
    // 6. className
    attrs.className = 'gb-looper';
    
    // Process children
    const { innerBlocks, innerContent } = await this.processChildren(element, options);
    
    const tagName = mapping.tagName;
    const openingTag = this.buildOpeningTag(tagName, attrs, mapping.blockType);
    const closingTag = `</${tagName}>`;
    
    return {
      blockName: mapping.blockType,
      attrs,
      innerBlocks,
      innerHTML: openingTag + this.buildInnerHTML(innerContent) + closingTag,
      innerContent: [openingTag, ...innerContent, closingTag]
    };
  }

  /**
   * Convert loop-item element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Loop item block
   */
  async convertLoopItem(element, mapping, options) {
    // Build attributes in recovery order: uniqueId, tagName, globalClasses, blockId, metadata (NO className)
    const attrs = {};
    
    // 1. uniqueId
    if (options.generateUniqueIds) {
      attrs.uniqueId = this.generateShortUniqueId();
    }
    
    // 2. tagName
    attrs.tagName = mapping.tagName;
    
    // 3. globalClasses
    if (element.hasAttribute('class')) {
      const classString = element.getAttribute('class');
      const classes = classString.split(' ')
        .map(cls => cls.trim())
        .filter(Boolean);
      if (classes.length > 0) {
        attrs.globalClasses = classes;
      }
    }
    
    // 4. blockId
    attrs.blockId = `block-${attrs.uniqueId.substring(0, 8)}-${crypto.randomBytes(4).toString('hex')}`;
    
    // 5. metadata
    attrs.metadata = {
      name: 'Loop-item Element'
    };
    
    // Note: NO className for loop-item (recovery analysis)
    
    const tagName = mapping.tagName;
    
    // Process children
    const { innerBlocks, innerContent } = await this.processChildren(element, options);
    
    // Special handling for loop-item: always include gb-loop-item in HTML but not in attributes
    const openingTag = this.buildLoopItemOpeningTag(tagName, attrs);
    const closingTag = `</${tagName}>`;
    
    return {
      blockName: mapping.blockType,
      attrs,
      innerBlocks,
      innerHTML: openingTag + this.buildInnerHTML(innerContent) + closingTag,
      innerContent: [openingTag, ...innerContent, closingTag]
    };
  }

  /**
   * Convert query-page-numbers element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Query page numbers block
   */
  convertQueryPageNumbers(element, mapping, options) {
    // Build attributes in recovery order: uniqueId, tagName, globalClasses, midSize, blockId, metadata, className
    const attrs = {};
    
    // 1. uniqueId
    if (options.generateUniqueIds) {
      attrs.uniqueId = this.generateShortUniqueId();
    }
    
    // 2. tagName
    attrs.tagName = mapping.tagName;
    
    // 3. globalClasses
    if (element.hasAttribute('class')) {
      const classString = element.getAttribute('class');
      const classes = classString.split(' ')
        .map(cls => cls.trim())
        .filter(Boolean);
      if (classes.length > 0) {
        attrs.globalClasses = classes;
      }
    }
    
    // 4. pagination attributes (like midSize)
    for (const [htmlAttr, blockAttr] of Object.entries(QueryProvider.paginationAttributeMappings)) {
      if (element.hasAttribute(htmlAttr)) {
        let value = element.getAttribute(htmlAttr);
        
        // Handle numeric attributes
        if (htmlAttr === 'mid-size') {
          value = parseInt(value);
        }
        
        // Handle boolean attributes
        if (htmlAttr === 'show-all') {
          value = value === 'true' || value === true;
        }
        
        attrs[blockAttr] = value;
      }
    }
    
    // 5. blockId
    attrs.blockId = `block-${attrs.uniqueId.substring(0, 8)}-${crypto.randomBytes(4).toString('hex')}`;
    
    // 6. metadata
    attrs.metadata = {
      name: 'Query-page-numbers Element'
    };
    
    // 7. className
    attrs.className = 'gb-query-pagination';
    
    const tagName = mapping.tagName;
    const openingTag = this.buildOpeningTag(tagName, attrs, mapping.blockType);
    const closingTag = `</${tagName}>`;
    
    return {
      blockName: mapping.blockType,
      attrs,
      innerBlocks: [],
      innerHTML: openingTag + closingTag,
      innerContent: [openingTag + closingTag]
    };
  }

  /**
   * Convert query-no-results element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Query no results block
   */
  async convertQueryNoResults(element, mapping, options) {
    const attrs = this.extractCustomAttributes(element, mapping.blockType, options);
    
    // Process children for no-results content
    const { innerBlocks, innerContent } = await this.processChildren(element, options);
    
    return {
      blockName: mapping.blockType,
      attrs,
      innerBlocks,
      innerHTML: this.buildInnerHTML(innerContent),
      innerContent
    };
  }

  /**
   * Build opening tag for loop-item with gb-loop-item class in HTML but not in attributes
   * @param {string} tagName - HTML tag name
   * @param {Object} attrs - Block attributes
   * @returns {string} Opening tag
   */
  buildLoopItemOpeningTag(tagName, attrs) {
    const classes = [];
    
    // Add gb-loop-item class first for loop-item HTML
    classes.push('gb-loop-item');
    
    // Add globalClasses after default class
    if (attrs.globalClasses) {
      classes.push(...attrs.globalClasses);
    }
    
    // Remove duplicates and filter empty values
    const uniqueClasses = [...new Set(classes.filter(Boolean))];
    
    const classAttr = uniqueClasses.length > 0 
      ? `class="${uniqueClasses.join(' ')}"` 
      : '';
    
    const htmlAttrs = attrs.htmlAttributes 
      ? Object.entries(attrs.htmlAttributes)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ')
      : '';
    
    const allAttrs = [classAttr, htmlAttrs].filter(Boolean).join(' ');
    
    return `<${tagName}${allAttrs ? ' ' + allAttrs : ''}>`;
  }

  /**
   * Extract attributes for custom elements, filtering out custom element specific attributes
   * @param {Element} element - DOM element
   * @param {string} blockType - Block type
   * @param {Object} options - Conversion options
   * @returns {Object} Block attributes
   */
  extractCustomAttributes(element, blockType, options) {
    const attrs = {};
    
    // 1. uniqueId - Always first
    if (options.generateUniqueIds) {
      attrs.uniqueId = this.generateShortUniqueId();
    }
    
    // 2. globalClasses - CSS classes from HTML (only class attribute)
    if (element.hasAttribute('class')) {
      const classString = element.getAttribute('class');
      const classes = classString.split(' ')
        .map(cls => cls.trim())
        .filter(Boolean);
      if (classes.length > 0) {
        attrs.globalClasses = classes;
      }
    }
    
    // 3. htmlAttributes - Only non-custom element attributes
    const htmlAttrs = {};
    const customAttrs = [
      ...Object.keys(QueryProvider.queryAttributeMappings),
      ...Object.keys(QueryProvider.paginationAttributeMappings),
      'class', 'tag', 'field' // Other special attributes
    ];
    
    for (const attr of element.attributes) {
      const name = attr.name;
      const value = attr.value;
      
      // Skip custom element attributes
      if (customAttrs.includes(name)) {
        continue;
      }
      
      htmlAttrs[name] = value;
    }
    
    if (Object.keys(htmlAttrs).length > 0) {
      attrs.htmlAttributes = htmlAttrs;
    }
    
    // 4. blockId - GenerateBlocks block identifier
    attrs.blockId = `block-${attrs.uniqueId.substring(0, 8)}-${crypto.randomBytes(4).toString('hex')}`;
    
    // 5. metadata - Block identification
    const tagName = element.tagName;
    attrs.metadata = {
      name: `${tagName.charAt(0).toUpperCase() + tagName.slice(1)} ${blockType === 'generateblocks/text' ? 'Text' : 'Element'}`
    };
    
    // 6. className - GenerateBlocks default classes (last to avoid duplication in HTML)
    const blocksWithoutClassName = ['generateblocks/loop-item', 'generateblocks/media'];
    if (defaultAttributes[blockType]?.className && !blocksWithoutClassName.includes(blockType)) {
      attrs.className = defaultAttributes[blockType].className;
    }
    
    return attrs;
  }

  /**
   * Generate short unique ID like GenerateBlocks uses
   * @returns {string} Short alphanumeric ID
   */
  generateShortUniqueId() {
    return crypto.randomBytes(4).toString('hex');
  }

  /**
   * Get provider priority
   * @returns {number} Priority (higher than text/element providers, lower than media)
   */
  getPriority() {
    return 75;
  }

  /**
   * Process child elements
   * @param {Element} element - Parent DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Inner blocks and content
   */
  async processChildren(element, options) {
    const innerBlocks = [];
    const innerContent = [];
    
    for (const child of element.childNodes) {
      if (child.nodeType === 1) { // Element node
        // Convert child element using provider system
        const childBlock = await this.convertChildElement(child, options);
        if (childBlock) {
          innerBlocks.push(childBlock);
          innerContent.push(null); // Placeholder for child block
        }
      } else if (child.nodeType === 3) { // Text node
        const text = child.textContent?.trim();
        if (text) {
          // For query elements, preserve text content
          innerContent.push(text);
        }
      }
    }
    
    return { innerBlocks, innerContent };
  }

  /**
   * Convert child element using provider manager
   * @param {Element} element - Child element
   * @param {Object} options - Conversion options
   * @returns {Object|null} Block or null
   */
  async convertChildElement(element, options) {
    // Use the provider manager from the converter instance
    if (this.converter && this.converter.providerManager) {
      return await this.converter.providerManager.convertElement(element, options);
    }
    
    // Fallback if no provider manager available
    return null;
  }

  /**
   * Build inner HTML from content array
   * @param {Array} innerContent - Inner content array
   * @returns {string} Inner HTML
   */
  buildInnerHTML(innerContent) {
    return innerContent
      .filter(item => item !== null)
      .join('');
  }

  /**
   * Get supported elements
   * @returns {Array} Supported custom element names
   */
  getSupportedElements() {
    return Object.keys(QueryProvider.queryElementMappings);
  }
}