import { BaseProvider } from '../BaseProvider.js';

/**
 * Media Provider
 * Handles conversion of image elements to generateblocks/media blocks
 * Exact port of GB_Media_Provider
 */
export class MediaProvider extends BaseProvider {
  /**
   * Supported HTML elements
   */
  static supportedElements = ['img'];

  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    return MediaProvider.supportedElements.includes(tagName);
  }

  /**
   * Convert element to media block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Media block
   */
  async convert(element, options) {
    const attrs = this.extractAttributes(element, 'generateblocks/media', options);
    
    // Override htmlAttributes with image-specific attributes
    const htmlAttrs = {};
    
    if (element.hasAttribute('src')) {
      htmlAttrs.src = element.getAttribute('src');
    }
    
    if (element.hasAttribute('alt')) {
      htmlAttrs.alt = element.getAttribute('alt');
    }
    
    if (element.hasAttribute('width')) {
      htmlAttrs.width = element.getAttribute('width');
    }
    
    if (element.hasAttribute('height')) {
      htmlAttrs.height = element.getAttribute('height');
    }
    
    if (element.hasAttribute('loading')) {
      htmlAttrs.loading = element.getAttribute('loading');
    }
    
    if (element.hasAttribute('srcset')) {
      htmlAttrs.srcset = element.getAttribute('srcset');
    }
    
    if (element.hasAttribute('sizes')) {
      htmlAttrs.sizes = element.getAttribute('sizes');
    }
    
    if (Object.keys(htmlAttrs).length > 0) {
      attrs.htmlAttributes = htmlAttrs;
    }
    
    // Build the img tag with proper class ordering (classes first, then other attributes)
    const imgAttrs = [];
    
    // Add class attribute first (globalClasses only, no className for media blocks)  
    if (attrs.globalClasses && attrs.globalClasses.length > 0) {
      imgAttrs.push(`class="${attrs.globalClasses.join(' ')}"`);
    }
    
    // Add other HTML attributes
    if (attrs.htmlAttributes) {
      for (const [key, value] of Object.entries(attrs.htmlAttributes)) {
        imgAttrs.push(`${key}="${this.escapeHtml(value)}"`);
      }
    }
    
    const imgTag = `<img ${imgAttrs.join(' ')}/>`;
    
    return {
      blockName: 'generateblocks/media',
      attrs,
      innerBlocks: [],
      innerHTML: imgTag,
      innerContent: [imgTag]
    };
  }

  /**
   * Escape HTML characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    const htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    
    return text.replace(/[&<>"']/g, char => htmlEscapes[char]);
  }

  /**
   * Get provider priority
   * @returns {number} Priority (highest - very specific elements)
   */
  getPriority() {
    return 100;
  }

  /**
   * Get supported elements
   * @returns {Array} Supported element names
   */
  getSupportedElements() {
    return [...MediaProvider.supportedElements];
  }
}