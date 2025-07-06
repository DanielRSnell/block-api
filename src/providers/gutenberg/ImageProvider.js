import { BaseProvider } from '../BaseProvider.js';

/**
 * Gutenberg Image Provider
 * Converts img elements to core/image blocks
 */
export class ImageProvider extends BaseProvider {
  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'img';
  }

  /**
   * Convert element to Gutenberg image block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Image block
   */
  async convert(element, options) {
    const attrs = this.extractGutenbergAttributes(element, options);
    
    // Extract image-specific attributes
    const src = element.getAttribute('src');
    const alt = element.getAttribute('alt');
    const width = element.getAttribute('width');
    const height = element.getAttribute('height');
    
    if (src) {
      attrs.url = src;
    }
    
    if (alt) {
      attrs.alt = alt;
    }
    
    if (width) {
      attrs.width = parseInt(width);
    }
    
    if (height) {
      attrs.height = parseInt(height);
    }
    
    // Generate a unique ID for the image
    attrs.id = Math.floor(Math.random() * 1000000);
    
    // Add blockId
    attrs.blockId = this.generateBlockId();
    
    const tagName = 'img';
    const innerHTML = this.buildGutenbergImageHTML(tagName, attrs);
    
    return {
      blockName: 'core/image',
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
    
    return attrs;
  }

  /**
   * Build HTML for Gutenberg image blocks
   * @param {string} tagName - HTML tag name
   * @param {Object} attrs - Block attributes
   * @returns {string} Complete HTML
   */
  buildGutenbergImageHTML(tagName, attrs) {
    const figureClasses = ['wp-block-image'];
    
    // Add CSS classes to figure
    if (attrs.className) {
      figureClasses.push(attrs.className);
    }
    
    // Build img attributes
    const imgClasses = [];
    
    if (attrs.id) {
      imgClasses.push(`wp-image-${attrs.id}`);
    }
    
    const htmlAttrs = [];
    
    if (attrs.url) {
      htmlAttrs.push(`src="${attrs.url}"`);
    }
    
    if (attrs.alt) {
      htmlAttrs.push(`alt="${attrs.alt}"`);
    }
    
    const imgClassAttr = imgClasses.length > 0 ? ` class="${imgClasses.join(' ')}"` : '';
    const attrsString = htmlAttrs.length > 0 ? ' ' + htmlAttrs.join(' ') : '';
    
    const figureClassAttr = ` class="${figureClasses.join(' ')}"`;
    
    return `<figure${figureClassAttr}><img${attrsString}${imgClassAttr}/></figure>`;
  }

  /**
   * Get provider priority
   * @returns {number} Priority (higher than generic providers)
   */
  getPriority() {
    return 80;
  }

  /**
   * Get supported elements
   * @returns {Array} Supported element names
   */
  getSupportedElements() {
    return ['img'];
  }
}