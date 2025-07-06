import { BaseProvider } from '../BaseProvider.js';
import { createTextBlock } from '../../utils/blockUtils.js';

/**
 * Text Provider
 * Handles conversion of text elements to generateblocks/text blocks
 */
export class TextProvider extends BaseProvider {
  /**
   * Text elements that should always be text blocks
   */
  static textElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button'];

  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    
    // Don't handle custom elements (elements with hyphens)
    if (tagName.includes('-')) {
      return false;
    }
    
    // Always handle known text elements
    if (TextProvider.textElements.includes(tagName)) {
      return true;
    }
    
    // For other elements, check if they contain only text
    if (options.semanticMapping) {
      const contentType = this.analyzeElementContent(element);
      return contentType === 'text_only';
    }
    
    return false;
  }

  /**
   * Convert element to text block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Text block
   */
  async convert(element, options) {
    const tagName = element.tagName.toLowerCase();
    const content = this.extractTextContent(element);
    
    // Handle empty content
    if (!content && options.fallbackToHtmlBlock) {
      return this.createHtmlFallbackBlock(element);
    }
    
    const attrs = this.extractAttributes(element, 'generateblocks/text', options);
    
    // Build inner HTML
    const classes = this.buildClassList(attrs);
    const htmlAttrs = this.buildHtmlAttributesString(attrs.htmlAttributes || {});
    const innerHTML = `<${tagName}${classes}${htmlAttrs}>${content}</${tagName}>`;
    
    return {
      blockName: 'generateblocks/text',
      attrs,
      innerBlocks: [],
      innerHTML,
      innerContent: [innerHTML]
    };
  }

  /**
   * Build class list string
   * @param {Object} attrs - Block attributes
   * @returns {string} Class attribute string
   */
  buildClassList(attrs) {
    const classes = [];
    
    // Add className first (GenerateBlocks base class) - matches PHP order
    if (attrs.className) {
      classes.push(attrs.className);
    }
    
    // Add globalClasses after (original CSS classes from HTML)
    if (attrs.globalClasses) {
      classes.push(...attrs.globalClasses);
    }
    
    // Add className again for text blocks (PHP behavior shows duplicate)
    if (attrs.className) {
      classes.push(attrs.className);
    }
    
    return classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
  }

  /**
   * Build HTML attributes string
   * @param {Object} htmlAttributes - HTML attributes
   * @returns {string} Attributes string
   */
  buildHtmlAttributesString(htmlAttributes) {
    if (!htmlAttributes || Object.keys(htmlAttributes).length === 0) {
      return '';
    }
    
    return ' ' + Object.entries(htmlAttributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }

  /**
   * Create HTML fallback block for unsupported content
   * @param {Element} element - DOM element
   * @returns {Object} HTML block
   */
  createHtmlFallbackBlock(element) {
    const innerHTML = element.outerHTML;
    
    return {
      blockName: 'core/html',
      attrs: {},
      innerBlocks: [],
      innerHTML,
      innerContent: [innerHTML]
    };
  }

  /**
   * Get provider priority
   * @returns {number} Priority (higher = more specific)
   */
  getPriority() {
    return 50;
  }

  /**
   * Get supported elements
   * @returns {Array} Supported element names
   */
  getSupportedElements() {
    return [...TextProvider.textElements];
  }
}