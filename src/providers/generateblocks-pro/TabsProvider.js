import { BaseProvider } from '../BaseProvider.js';
import { isCustomElement } from '../../utils/htmlUtils.js';
import crypto from 'crypto';

/**
 * Tabs Provider
 * Handles conversion of tabs elements to GenerateBlocks Pro tabs blocks
 * Exact port of GB_Tabs_Provider
 */
export class TabsProvider extends BaseProvider {
  /**
   * Tabs element mappings to GenerateBlocks Pro (1:1 alignment)
   */
  static tabsElementMappings = {
    'tabs': {
      blockType: 'generateblocks-pro/tabs',
      tagName: 'div'
    },
    'tabs-menu': {
      blockType: 'generateblocks-pro/tabs-menu',
      tagName: 'div'
    },
    'tab-menu-item': {
      blockType: 'generateblocks-pro/tab-menu-item',
      tagName: 'div'
    },
    'tab-items': {
      blockType: 'generateblocks-pro/tab-items',
      tagName: 'div'
    },
    'tab-item': {
      blockType: 'generateblocks-pro/tab-item',
      tagName: 'div'
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
    return TabsProvider.tabsElementMappings.hasOwnProperty(tagName);
  }

  /**
   * Convert element to tabs block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Tabs block
   */
  async convert(element, options) {
    const tagName = element.tagName.toLowerCase();
    const mapping = TabsProvider.tabsElementMappings[tagName];
    const blockType = mapping.blockType;
    
    // Handle different tab block types
    switch (blockType) {
      case 'generateblocks-pro/tabs':
        return this.convertTabs(element, mapping, options);
      case 'generateblocks-pro/tabs-menu':
        return this.convertTabsMenu(element, mapping, options);
      case 'generateblocks-pro/tab-menu-item':
        return this.convertTabMenuItem(element, mapping, options);
      case 'generateblocks-pro/tab-items':
        return this.convertTabItems(element, mapping, options);
      case 'generateblocks-pro/tab-item':
        return this.convertTabItem(element, mapping, options);
      default:
        return null;
    }
  }

  /**
   * Convert tabs element (main container)
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Tabs block
   */
  async convertTabs(element, mapping, options) {
    const attrs = this.extractTabsAttributes(element, mapping.blockType, options);
    
    // Add data-opened-tab attribute for the first tab
    attrs.htmlAttributes = {
      ...attrs.htmlAttributes || {},
      'data-opened-tab': '1'
    };
    
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
   * Convert tabs-menu element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Tabs menu block
   */
  async convertTabsMenu(element, mapping, options) {
    const attrs = this.extractTabsAttributes(element, mapping.blockType, options);
    
    // Add role="tablist" for accessibility
    attrs.htmlAttributes = {
      ...attrs.htmlAttributes || {},
      role: 'tablist'
    };
    
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
   * Convert tab-menu-item element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Tab menu item block
   */
  async convertTabMenuItem(element, mapping, options) {
    const attrs = this.extractTabsAttributes(element, mapping.blockType, options);
    
    // Add className for tab menu items
    attrs.className = 'gb-tabs__menu-item';
    
    // Generate unique ID for the tab menu item
    const uniqueId = attrs.uniqueId || this.generateShortUniqueId();
    const tabId = `gb-tab-menu-item-${uniqueId}`;
    
    // Add accessibility attributes and ID
    attrs.htmlAttributes = {
      ...attrs.htmlAttributes || {},
      role: 'tab',
      id: tabId
    };
    
    // Check if this is the first/active tab
    const isFirstTab = this.isFirstTabMenuItem(element);
    if (isFirstTab) {
      attrs.tabItemOpen = true;
    }
    
    // Get text content to wrap in text blocks
    const textContent = element.textContent?.trim();
    const innerBlocks = [];
    const innerContent = [];
    
    if (textContent) {
      // Create text block for tab menu item content (like accordion-toggle)
      const textUniqueId = this.generateUniqueId();
      const textBlock = {
        blockName: 'generateblocks/text',
        attrs: {
          uniqueId: textUniqueId,
          tagName: 'span',
          blockId: `block-${textUniqueId.substring(0, 8)}-${this.generateShortId()}`,
          metadata: { name: 'Span Text' },
          className: 'gb-text'
        },
        innerBlocks: [],
        innerHTML: `<span class="gb-text gb-text">${textContent}</span>`,
        innerContent: [`<span class="gb-text gb-text">${textContent}</span>`]
      };
      
      innerBlocks.push(textBlock);
      innerContent.push(null); // Placeholder for text block
    } else {
      // Process child elements if no direct text content
      const childResults = await this.processChildren(element, options);
      innerBlocks.push(...childResults.innerBlocks);
      innerContent.push(...childResults.innerContent);
    }
    
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
   * Convert tab-items element (content container)
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Tab items block
   */
  async convertTabItems(element, mapping, options) {
    const attrs = this.extractTabsAttributes(element, mapping.blockType, options);
    
    // Add role="tabpanel" for accessibility
    attrs.htmlAttributes = {
      ...attrs.htmlAttributes || {},
      role: 'tabpanel'
    };
    
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
   * Convert tab-item element (individual tab content)
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Tab item block
   */
  async convertTabItem(element, mapping, options) {
    const attrs = this.extractTabsAttributes(element, mapping.blockType, options);
    
    // Generate unique ID for the tab item
    const uniqueId = attrs.uniqueId || this.generateShortUniqueId();
    const tabItemId = `gb-tab-item-${uniqueId}`;
    
    // Add ID attribute
    attrs.htmlAttributes = {
      ...attrs.htmlAttributes || {},
      id: tabItemId
    };
    
    // Check if this is the first/active tab content
    const isFirstTab = this.isFirstTabItem(element);
    if (isFirstTab) {
      attrs.tabItemOpen = true;
    }
    
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
   * Extract attributes for tabs elements
   * @param {Element} element - DOM element
   * @param {string} blockType - Block type
   * @param {Object} options - Conversion options
   * @returns {Object} Block attributes
   */
  extractTabsAttributes(element, blockType, options) {
    const attrs = {};
    
    // 1. uniqueId - Generate short alphanumeric ID
    const uniqueId = this.generateShortUniqueId();
    attrs.uniqueId = uniqueId;
    
    // 2. tagName - Use proper HTML tag for the block type
    const tagMap = {
      'tabs': 'div',
      'tabs-menu': 'div',
      'tab-menu-item': 'div',
      'tab-items': 'div',
      'tab-item': 'div'
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
      const value = attr.value;
      
      // Skip attributes that are handled separately
      if (name === 'class') {
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
    
    // 7. className - Add default GenerateBlocks classes for certain block types
    const classNameMap = {
      'generateblocks-pro/tabs': 'gb-tabs',
      'generateblocks-pro/tabs-menu': 'gb-tabs__menu', 
      'generateblocks-pro/tab-items': 'gb-tabs__items',
      'generateblocks-pro/tab-item': 'gb-tabs__item'
    };
    
    if (classNameMap[blockType]) {
      attrs.className = classNameMap[blockType];
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
   * Generate UUID-like unique ID for text blocks
   * @returns {string} UUID-like ID
   */
  generateUniqueId() {
    const hex = crypto.randomBytes(16).toString('hex');
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      '4' + hex.substring(13, 16), // Version 4
      hex.substring(16, 20),
      hex.substring(20, 32)
    ].join('-');
  }
  
  /**
   * Generate short ID for blockId suffix
   * @returns {string} Short random ID
   */
  generateShortId() {
    return crypto.randomBytes(5).toString('hex').substring(0, 8);
  }

  /**
   * Check if this is the first tab menu item (should be active)
   * @param {Element} element - Tab menu item element
   * @returns {boolean} Is first tab
   */
  isFirstTabMenuItem(element) {
    const parent = element.parentNode;
    if (!parent) {
      return false;
    }
    
    // Find the first tab-menu-item in the parent
    for (const child of parent.children) {
      if (child.tagName.toLowerCase() === 'tab-menu-item') {
        return child === element;
      }
    }
    
    return false;
  }

  /**
   * Check if this is the first tab item (should be active)
   * @param {Element} element - Tab item element
   * @returns {boolean} Is first tab
   */
  isFirstTabItem(element) {
    const parent = element.parentNode;
    if (!parent) {
      return false;
    }
    
    // Find the first tab-item in the parent
    for (const child of parent.children) {
      if (child.tagName.toLowerCase() === 'tab-item') {
        return child === element;
      }
    }
    
    return false;
  }

  /**
   * Get provider priority
   * @returns {number} Priority (same as custom element provider)
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
          // For tabs elements, preserve text content
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
    return Object.keys(TabsProvider.tabsElementMappings);
  }
}