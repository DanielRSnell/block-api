import { generateUniqueId } from '../utils/blockUtils.js';

/**
 * Base Provider Class
 * Abstract base class providing common functionality for all providers
 */
export class BaseProvider {
  /**
   * Default attributes for different block types
   */
  static defaultAttributes = {
    'generateblocks/element': {
      className: 'gb-element'
    },
    'generateblocks/text': {
      className: 'gb-text',
      content: ''
    },
    'generateblocks/media': {
      className: 'gb-media'
    },
    'generateblocks/query': {
      className: 'gb-query'
    },
    'generateblocks/looper': {
      className: 'gb-looper'
    },
    'generateblocks/loop-item': {
      className: 'gb-loop-item'
    },
    'generateblocks/query-page-numbers': {
      className: 'gb-query-pagination'
    },
    'generateblocks/query-no-results': {
      className: 'gb-query-no-results'
    },
    'generateblocks-pro/accordion': {
      className: 'gb-accordion'
    },
    'generateblocks-pro/accordion-item': {
      className: 'gb-accordion__item'
    },
    'generateblocks-pro/accordion-toggle': {
      className: 'gb-accordion__toggle'
    },
    'generateblocks-pro/accordion-content': {
      className: 'gb-accordion__content'
    },
    'generateblocks-pro/tabs': {
      className: 'gb-tabs'
    },
    'generateblocks-pro/tabs-menu': {
      className: 'gb-tabs__menu'
    },
    'generateblocks-pro/tab-menu-item': {
      className: 'gb-tabs__menu-item'
    },
    'generateblocks-pro/tab-items': {
      className: 'gb-tabs__items'
    },
    'generateblocks-pro/tab-item': {
      className: 'gb-tabs__item'
    }
  };

  /**
   * Extract attributes for block based on element and block type
   * @param {Element} element - DOM element
   * @param {string} blockType - Block type
   * @param {Object} options - Conversion options
   * @returns {Object} Block attributes
   */
  extractAttributes(element, blockType, options) {
    const attrs = {};
    
    // 1. uniqueId - Always first
    if (options.generateUniqueIds) {
      attrs.uniqueId = generateUniqueId();
    }
    
    // 2. tagName - HTML element type
    if (['generateblocks/element', 'generateblocks/text', 'generateblocks/media'].includes(blockType)) {
      attrs.tagName = element.tagName.toLowerCase();
    }
    
    // 3. globalClasses - CSS classes from HTML
    const classes = this.extractCssClasses(element, options);
    if (classes.length > 0) {
      attrs.globalClasses = classes;
    }
    
    // 4. content - For text blocks (only when not in navigation context)
    if (blockType === 'generateblocks/text' && !options.skipContentAttribute) {
      attrs.content = this.extractTextContent(element);
    }
    
    // 5. htmlAttributes - Custom HTML attributes
    const htmlAttrs = this.extractHtmlAttributes(element, options);
    if (Object.keys(htmlAttrs).length > 0) {
      attrs.htmlAttributes = htmlAttrs;
    }
    
    // 6. blockId - GenerateBlocks block identifier
    if (attrs.uniqueId) {
      attrs.blockId = `block-${attrs.uniqueId.substring(0, 8)}-${Date.now().toString(36)}`;
    }
    
    // 7. metadata - Block identification
    const tagName = element.tagName.toLowerCase();
    const formattedTagName = tagName.charAt(0).toUpperCase() + tagName.slice(1);
    attrs.metadata = {
      name: `${formattedTagName} ${blockType === 'generateblocks/text' ? 'Text' : 'Element'}`
    };
    
    // 8. className - GenerateBlocks default classes (last to avoid duplication)
    const blocksWithoutClassName = [
      'generateblocks/loop-item', 
      'generateblocks/media',
      'generateblocks-pro/accordion',
      'generateblocks-pro/accordion-item',
      'generateblocks-pro/accordion-content',
      'generateblocks-pro/navigation',
      'generateblocks-pro/menu-toggle'
    ];
    
    if (BaseProvider.defaultAttributes[blockType]?.className && !blocksWithoutClassName.includes(blockType)) {
      attrs.className = BaseProvider.defaultAttributes[blockType].className;
    }
    
    return attrs;
  }

  /**
   * Extract CSS classes from element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Array} CSS classes
   */
  extractCssClasses(element, options) {
    if (!options.preserveClasses || !element.getAttribute('class')) {
      return [];
    }
    
    const classString = element.getAttribute('class');
    return classString.split(' ').map(cls => cls.trim()).filter(Boolean);
  }

  /**
   * Extract HTML attributes from element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} HTML attributes
   */
  extractHtmlAttributes(element, options) {
    const attrs = {};
    
    for (const attr of element.attributes) {
      const name = attr.name;
      const value = attr.value;
      
      // Skip class attribute (handled separately)
      if (name === 'class') continue;
      
      // Handle style preservation
      if (name === 'style' && !options.preserveStyles) continue;
      
      attrs[name] = value;
    }
    
    return attrs;
  }

  /**
   * Extract text content from element
   * @param {Element} element - DOM element
   * @returns {string} Text content
   */
  extractTextContent(element) {
    return element.textContent?.trim() || '';
  }

  /**
   * Build opening tag for elements
   * @param {string} tagName - HTML tag name
   * @param {Object} attrs - Block attributes
   * @param {string} blockType - Block type for context
   * @returns {string} Opening tag
   */
  buildOpeningTag(tagName, attrs, blockType = null) {
    const classes = [];
    
    // Add className first (GenerateBlocks base class) - matches PHP order
    let baseClass = null;
    if (attrs.className && attrs.className !== "") {
      baseClass = attrs.className;
      classes.push(attrs.className);
    } else if (blockType && BaseProvider.defaultAttributes[blockType]?.className) {
      baseClass = BaseProvider.defaultAttributes[blockType].className;
      classes.push(BaseProvider.defaultAttributes[blockType].className);
    }
    
    // Special case for site-header: always add base class even when className is empty
    if (blockType === 'generateblocks-pro/site-header' && !baseClass) {
      baseClass = 'gb-site-header';
      classes.push(baseClass);
    }
    
    // Special handling for navigation elements that don't have className attribute
    // but still need base classes in HTML
    if (!baseClass && blockType) {
      const navigationBaseClasses = {
        'generateblocks-pro/navigation': 'gb-navigation',
        'generateblocks-pro/menu-toggle': 'gb-menu-toggle'
      };
      
      if (navigationBaseClasses[blockType]) {
        baseClass = navigationBaseClasses[blockType];
        classes.push(baseClass);
      }
    }
    
    // Add globalClasses (CSS classes from original HTML)
    if (attrs.globalClasses) {
      classes.push(...attrs.globalClasses);
    }
    
    // Add unique CSS class for certain GenerateBlocks Pro elements
    // Pattern: gb-navigation-eb201e25, gb-menu-container-6328495f, etc.
    // Note: site-header does NOT get unique classes
    if (baseClass && attrs.uniqueId && blockType) {
      const blocksWithUniqueClasses = [
        'generateblocks-pro/navigation', 
        'generateblocks-pro/menu-container'
      ];
      
      if (blocksWithUniqueClasses.includes(blockType)) {
        const uniqueClass = `${baseClass}-${attrs.uniqueId}`;
        classes.push(uniqueClass);
      }
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
   * Analyze element content to determine appropriate block type
   * @param {Element} element - DOM element
   * @returns {string} Content type (text_only, child_elements, mixed_content, empty)
   */
  analyzeElementContent(element) {
    let hasText = false;
    let hasElements = false;
    let nonWhitespaceText = '';
    
    for (const child of element.childNodes) {
      if (child.nodeType === 3) { // Text node
        const textContent = child.textContent?.trim();
        if (textContent) {
          hasText = true;
          nonWhitespaceText += textContent;
        }
      } else if (child.nodeType === 1) { // Element node
        hasElements = true;
      }
    }
    
    // Determine content type based on what we found
    if (!hasText && !hasElements) {
      return 'empty';
    } else if (hasText && !hasElements) {
      return 'text_only';
    } else if (!hasText && hasElements) {
      return 'child_elements';
    } else {
      // Has both text and elements
      // If text is very short (< 5 chars), likely formatting - treat as element
      if (nonWhitespaceText.length < 5) {
        return 'child_elements';
      }
      return 'mixed_content';
    }
  }

  /**
   * Default implementation - should be overridden by subclasses
   */
  canHandle(element, options) {
    throw new Error('canHandle() method must be implemented by subclass');
  }

  /**
   * Default implementation - should be overridden by subclasses
   */
  async convert(element, options) {
    throw new Error('convert() method must be implemented by subclass');
  }

  /**
   * Default priority - can be overridden by subclasses
   */
  getPriority() {
    return 0;
  }

  /**
   * Default supported elements - can be overridden by subclasses
   */
  getSupportedElements() {
    return [];
  }

  /**
   * Generate a unique block ID for Gutenberg blocks
   * @returns {string} Unique block ID
   */
  generateBlockId() {
    return generateUniqueId();
  }
}