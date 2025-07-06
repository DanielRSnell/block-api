import { BaseProvider } from '../BaseProvider.js';

/**
 * Gutenberg Heading Provider
 * Converts heading elements (h1-h6) to core/heading blocks
 */
export class HeadingProvider extends BaseProvider {
  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName);
  }

  /**
   * Convert element to Gutenberg heading block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Heading block
   */
  async convert(element, options) {
    const tagName = element.tagName.toLowerCase();
    const level = parseInt(tagName.charAt(1)); // Extract number from h1, h2, etc.
    const content = this.extractTextContent(element);
    
    const attrs = this.extractGutenbergAttributes(element, options);
    
    // Add level and content to attributes
    attrs.level = level;
    if (content) {
      attrs.content = content;
    }
    
    // Add blockId
    attrs.blockId = this.generateBlockId();
    
    const openingTag = this.buildGutenbergTag(tagName, attrs);
    const closingTag = `</${tagName}>`;
    const innerHTML = openingTag + content + closingTag;
    
    return {
      blockName: 'core/heading',
      attrs,
      innerBlocks: [],
      innerHTML,
      innerContent: [innerHTML]
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
    const classes = ['wp-block-heading'];
    
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
   * Get provider priority
   * @returns {number} Priority (higher than generic providers)
   */
  getPriority() {
    return 60;
  }

  /**
   * Get supported elements
   * @returns {Array} Supported element names
   */
  getSupportedElements() {
    return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  }
}