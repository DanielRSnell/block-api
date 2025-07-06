import { BaseProvider } from '../BaseProvider.js';

/**
 * Gutenberg Group Provider
 * Converts div elements to core/group blocks
 */
export class GroupProvider extends BaseProvider {
  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    
    // Handle div elements that aren't already handled by other providers
    if (tagName === 'div') {
      // Only handle divs with content or children
      return element.children.length > 0 || element.textContent.trim().length > 0;
    }
    
    return false;
  }

  /**
   * Convert element to Gutenberg group block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Group block
   */
  async convert(element, options) {
    const attrs = this.extractGutenbergAttributes(element, options);
    
    // Add blockId
    attrs.blockId = this.generateBlockId();
    
    // Add layout attribute for top-level groups
    if (!element.parentElement || element.parentElement.tagName.toLowerCase() === 'body') {
      attrs.layout = { type: 'constrained' };
    }
    
    // Process children
    const { innerBlocks, innerContent } = await this.processChildren(element, options);
    
    const tagName = 'div';
    const openingTag = this.buildGutenbergTag(tagName, attrs);
    const closingTag = `</${tagName}>`;
    
    return {
      blockName: 'core/group',
      attrs,
      innerBlocks,
      innerHTML: openingTag + this.buildInnerHTML(innerContent) + closingTag,
      innerContent: [openingTag, ...innerContent, closingTag]
    };
  }

  /**
   * Extract attributes for Gutenberg blocks
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Block attributes
   */
  extractGutenbergAttributes(element, options) {
    const attrs = {};
    
    // CSS classes
    if (element.hasAttribute('class')) {
      const classString = element.getAttribute('class');
      const classes = classString.split(' ')
        .map(cls => cls.trim())
        .filter(Boolean);
      if (classes.length > 0) {
        attrs.className = classes.join(' ');
      }
    }
    
    // HTML attributes
    const htmlAttrs = {};
    for (const attr of element.attributes) {
      const name = attr.name;
      const value = attr.value;
      
      // Skip class attribute (handled separately)
      if (name === 'class') continue;
      
      htmlAttrs[name] = value;
    }
    
    if (Object.keys(htmlAttrs).length > 0) {
      attrs.htmlAttributes = htmlAttrs;
    }
    
    return attrs;
  }

  /**
   * Build opening tag for Gutenberg blocks
   * @param {string} tagName - HTML tag name
   * @param {Object} attrs - Block attributes
   * @returns {string} Opening tag
   */
  buildGutenbergTag(tagName, attrs) {
    const classes = ['wp-block-group'];
    
    // Add CSS classes
    if (attrs.className) {
      classes.push(attrs.className);
    }
    
    // Build HTML attributes string
    let htmlAttrs = '';
    if (attrs.htmlAttributes) {
      htmlAttrs = Object.entries(attrs.htmlAttributes)
        .map(([key, value]) => ` ${key}="${value}"`)
        .join('');
    }
    
    const classAttr = ` class="${classes.join(' ')}"`;
    
    return `<${tagName}${classAttr}${htmlAttrs}>`;
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
   * Get provider priority
   * @returns {number} Priority (lower than specialized providers)
   */
  getPriority() {
    return 25;
  }

  /**
   * Get supported elements
   * @returns {Array} Supported element names
   */
  getSupportedElements() {
    return ['div'];
  }
}