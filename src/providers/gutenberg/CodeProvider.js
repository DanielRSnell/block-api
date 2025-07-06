import { BaseProvider } from '../BaseProvider.js';

/**
 * Gutenberg Code Provider
 * Converts code and pre elements to core/code blocks
 */
export class CodeProvider extends BaseProvider {
  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    
    // Handle pre elements or code elements that are block-level
    if (tagName === 'pre') {
      return true;
    }
    
    // Handle code elements that are not inline (i.e., not inside a paragraph)
    if (tagName === 'code') {
      const parent = element.parentElement;
      const parentTag = parent?.tagName.toLowerCase();
      // Only handle code blocks that are not inside paragraphs or other inline elements
      return !['p', 'span', 'a', 'em', 'strong', 'b', 'i'].includes(parentTag);
    }
    
    return false;
  }

  /**
   * Convert element to Gutenberg code block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Code block
   */
  async convert(element, options) {
    const attrs = this.extractGutenbergAttributes(element, options);
    
    // Extract code content
    let content = '';
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'pre') {
      // For pre elements, look for nested code element or use text content
      const codeElement = element.querySelector('code');
      if (codeElement) {
        content = codeElement.textContent || codeElement.innerText || '';
      } else {
        content = element.textContent || element.innerText || '';
      }
    } else {
      // For code elements, use text content directly
      content = element.textContent || element.innerText || '';
    }
    
    if (content) {
      attrs.content = content;
    }
    
    // Add blockId
    attrs.blockId = this.generateBlockId();
    
    const openingTag = '<pre class="wp-block-code">';
    const closingTag = '</pre>';
    const innerHTML = openingTag + `<code>${this.escapeHtml(content)}</code>` + closingTag;
    
    return {
      blockName: 'core/code',
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
    
    // Check for language class (common in syntax highlighting)
    const classList = element.classList;
    for (const className of classList) {
      if (className.startsWith('language-')) {
        const language = className.replace('language-', '');
        attrs.language = language;
        break;
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
   * Escape HTML entities in code content
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Get provider priority
   * @returns {number} Priority (higher than generic providers)
   */
  getPriority() {
    return 70;
  }

  /**
   * Get supported elements
   * @returns {Array} Supported element names
   */
  getSupportedElements() {
    return ['pre', 'code'];
  }
}