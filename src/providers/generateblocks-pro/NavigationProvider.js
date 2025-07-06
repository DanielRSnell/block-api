import { BaseProvider } from '../BaseProvider.js';
import { isCustomElement } from '../../utils/htmlUtils.js';
import crypto from 'crypto';

/**
 * Navigation Provider
 * Handles conversion of navigation elements to GenerateBlocks Pro navigation blocks
 * Covers site-header, navigation, menu-toggle, menu-container, classic-menu, etc.
 */
export class NavigationProvider extends BaseProvider {
  /**
   * Navigation element mappings to GenerateBlocks Pro
   */
  static navigationElementMappings = {
    'site-header': {
      blockType: 'generateblocks-pro/site-header',
      tagName: 'header'
    },
    'navigation': {
      blockType: 'generateblocks-pro/navigation',
      tagName: 'nav'
    },
    'menu-toggle': {
      blockType: 'generateblocks-pro/menu-toggle',
      tagName: 'button'
    },
    'menu-container': {
      blockType: 'generateblocks-pro/menu-container',
      tagName: 'div'
    },
    'classic-menu': {
      blockType: 'generateblocks-pro/classic-menu',
      tagName: 'ul'
    },
    'classic-menu-item': {
      blockType: 'generateblocks-pro/classic-menu-item',
      tagName: 'li'
    },
    'classic-sub-menu': {
      blockType: 'generateblocks-pro/classic-sub-menu',
      tagName: 'ul'
    }
  };

  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    return NavigationProvider.navigationElementMappings.hasOwnProperty(tagName);
  }

  /**
   * Convert element to navigation block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Navigation block
   */
  async convert(element, options) {
    const tagName = element.tagName.toLowerCase();
    const mapping = NavigationProvider.navigationElementMappings[tagName];
    const blockType = mapping.blockType;
    
    // Handle different navigation block types
    switch (blockType) {
      case 'generateblocks-pro/site-header':
        return this.convertSiteHeader(element, mapping, options);
      case 'generateblocks-pro/navigation':
        return this.convertNavigation(element, mapping, options);
      case 'generateblocks-pro/menu-toggle':
        return this.convertMenuToggle(element, mapping, options);
      case 'generateblocks-pro/menu-container':
        return this.convertMenuContainer(element, mapping, options);
      case 'generateblocks-pro/classic-menu':
        return this.convertClassicMenu(element, mapping, options);
      case 'generateblocks-pro/classic-menu-item':
        return this.convertClassicMenuItem(element, mapping, options);
      case 'generateblocks-pro/classic-sub-menu':
        return this.convertClassicSubMenu(element, mapping, options);
      default:
        return null;
    }
  }

  /**
   * Convert site-header element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Site header block
   */
  async convertSiteHeader(element, mapping, options) {
    const attrs = this.extractNavigationAttributes(element, mapping.blockType, options);
    
    // Site header should have empty className
    attrs.className = "";
    
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
   * Convert navigation element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Navigation block
   */
  async convertNavigation(element, mapping, options) {
    const attrs = this.extractNavigationAttributes(element, mapping.blockType, options);
    
    // Navigation blocks do NOT have className attribute - they get unique CSS classes instead
    
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
   * Convert menu-toggle element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Menu toggle block
   */
  async convertMenuToggle(element, mapping, options) {
    const attrs = this.extractNavigationAttributes(element, mapping.blockType, options);
    
    // Menu toggle blocks do NOT have className attribute - they get unique CSS classes instead
    
    // Add iconOnly attribute for menu toggle
    attrs.iconOnly = true;
    
    // Generate proper menu toggle SVG content with open and close icons
    const innerHTML = '<span class="gb-menu-open-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"></line><line x1="40" y1="64" x2="216" y2="64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"></line><line x1="40" y1="192" x2="216" y2="192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"></line></svg></span><span class="gb-menu-close-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="200" y1="56" x2="56" y2="200" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><line x1="200" y1="200" x2="56" y2="56" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line></svg></span>';
    
    const tagName = mapping.tagName;
    const openingTag = this.buildOpeningTag(tagName, attrs, mapping.blockType);
    const closingTag = `</${tagName}>`;
    
    return {
      blockName: mapping.blockType,
      attrs,
      innerBlocks: [],
      innerHTML: openingTag + innerHTML + closingTag,
      innerContent: [openingTag + innerHTML + closingTag]
    };
  }

  /**
   * Convert menu-container element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Menu container block
   */
  async convertMenuContainer(element, mapping, options) {
    const attrs = this.extractNavigationAttributes(element, mapping.blockType, options);
    
    // Menu container should have extreme duplication pattern
    const baseClass = `gb-menu-container-${attrs.uniqueId}`;
    const doubleClass = `${baseClass}-${attrs.uniqueId}`;
    attrs.className = `${baseClass} ${doubleClass} ${baseClass} ${doubleClass}`;
    
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
   * Convert classic-menu element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Classic menu block
   */
  async convertClassicMenu(element, mapping, options) {
    const attrs = this.extractNavigationAttributes(element, mapping.blockType, options);
    
    // Add className for classic menu
    attrs.className = 'gb-menu';
    
    // Classic menu typically renders as self-closing
    return {
      blockName: mapping.blockType,
      attrs,
      innerBlocks: [],
      innerHTML: '',
      innerContent: [],
      selfClosing: true
    };
  }

  /**
   * Convert classic-menu-item element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Classic menu item block
   */
  async convertClassicMenuItem(element, mapping, options) {
    const attrs = this.extractNavigationAttributes(element, mapping.blockType, options);
    
    // Add className for menu item
    attrs.className = 'gb-menu-item';
    
    // Classic menu item typically renders as self-closing
    return {
      blockName: mapping.blockType,
      attrs,
      innerBlocks: [],
      innerHTML: '',
      innerContent: [],
      selfClosing: true
    };
  }

  /**
   * Convert classic-sub-menu element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Classic sub menu block
   */
  async convertClassicSubMenu(element, mapping, options) {
    const attrs = this.extractNavigationAttributes(element, mapping.blockType, options);
    
    // Add className for sub menu
    attrs.className = 'gb-sub-menu';
    
    // Classic sub menu typically renders as self-closing
    return {
      blockName: mapping.blockType,
      attrs,
      innerBlocks: [],
      innerHTML: '',
      innerContent: [],
      selfClosing: true
    };
  }

  /**
   * Extract attributes for navigation elements
   * @param {Element} element - DOM element
   * @param {string} blockType - Block type
   * @param {Object} options - Conversion options
   * @returns {Object} Block attributes
   */
  extractNavigationAttributes(element, blockType, options) {
    const attrs = {};
    
    // 1. uniqueId - Generate short alphanumeric ID
    const uniqueId = this.generateShortUniqueId();
    attrs.uniqueId = uniqueId;
    
    // 2. tagName - Use proper HTML tag for the block type
    const tagMap = {
      'site-header': 'header',
      'navigation': 'nav',
      'menu-toggle': 'button',
      'menu-container': 'div',
      'classic-menu': 'ul',
      'classic-menu-item': 'li',
      'classic-sub-menu': 'ul'
    };
    const elementName = element.tagName.toLowerCase();
    attrs.tagName = tagMap[elementName] || 'div';
    
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
    
    // 4. htmlAttributes - Custom HTML attributes (excluding certain ones)
    const htmlAttrs = {};
    for (const attr of element.attributes) {
      const name = attr.name;
      let value = attr.value;
      
      // Skip attributes that are handled separately
      if (name === 'class') {
        continue;
      }
      
      // Convert data-mobile-breakpoint to data-gb-mobile-breakpoint
      if (name === 'data-mobile-breakpoint') {
        htmlAttrs['data-gb-mobile-breakpoint'] = value + 'px';
        continue;
      }
      
      // Convert data-menu-type to data-gb-mobile-menu-type
      if (name === 'data-menu-type') {
        htmlAttrs['data-gb-mobile-menu-type'] = value === 'overlay' ? 'full-overlay' : value;
        continue;
      }
      
      htmlAttrs[name] = value;
    }
    
    if (Object.keys(htmlAttrs).length > 0) {
      attrs.htmlAttributes = htmlAttrs;
    }
    
    // 5. blockId - GenerateBlocks format
    attrs.blockId = `block-${uniqueId.substring(0, 8)}-${uniqueId.substring(0, 4)}-4${uniqueId.substring(4, 7)}-${uniqueId.substring(0, 4)}-${crypto.createHash('md5').update(uniqueId).digest('hex').substring(0, 12)}`;
    
    // 6. metadata - Block identification
    const blockName = blockType.replace('generateblocks-pro/', '');
    attrs.metadata = {
      name: blockName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Element'
    };
    
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
   * @returns {number} Priority (same as other custom element providers)
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
    
    // Create modified options for navigation context
    const navigationOptions = {
      ...options,
      skipContentAttribute: true // Skip content attributes in navigation elements
    };
    
    for (const child of element.childNodes) {
      if (child.nodeType === 1) { // Element node
        // Convert child element using provider system with navigation options
        const childBlock = await this.convertChildElement(child, navigationOptions);
        if (childBlock) {
          innerBlocks.push(childBlock);
          innerContent.push(null); // Placeholder for child block
        }
      } else if (child.nodeType === 3) { // Text node
        const text = child.textContent?.trim();
        if (text) {
          // For navigation elements, preserve text content
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
   * @returns {Array} Supported element names
   */
  getSupportedElements() {
    return Object.keys(NavigationProvider.navigationElementMappings);
  }
}