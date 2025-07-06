import { BaseProvider } from '../BaseProvider.js';

/**
 * Gutenberg Paragraph Provider
 * Converts paragraph and span elements to core/paragraph blocks
 */
export class ParagraphProvider extends BaseProvider {
  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'p' || tagName === 'span';
  }

  /**
   * Convert element to Gutenberg paragraph block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Paragraph block
   */
  async convert(element, options) {
    const originalTagName = element.tagName.toLowerCase();
    const attrs = this.extractGutenbergAttributes(element, options);
    const content = this.extractTextContent(element);
    
    // Add content to attributes for paragraph blocks
    if (content) {
      attrs.content = content;
    }
    
    // Add blockId
    attrs.blockId = this.generateBlockId();
    
    // Add is-span class for span elements
    if (originalTagName === 'span') {
      attrs.className = attrs.className ? `${attrs.className} is-span` : 'is-span';
    }
    
    const tagName = 'p';
    const openingTag = this.buildGutenbergTag(tagName, attrs);
    const closingTag = `</${tagName}>`;
    const innerHTML = openingTag + content + closingTag;
    
    return {
      blockName: 'core/paragraph',
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
    const classes = [];
    
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
    
    const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
    
    return `<${tagName}${classAttr}${htmlAttrs}>`;
  }

  /**
   * Get provider priority
   * @returns {number} Priority (higher than generic providers)
   */
  getPriority() {
    return 50;
  }

  /**
   * Get supported elements
   * @returns {Array} Supported element names
   */
  getSupportedElements() {
    return ['p', 'span'];
  }
}