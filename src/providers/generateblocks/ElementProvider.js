import { BaseProvider } from '../BaseProvider.js';

/**
 * Element Provider
 * Handles conversion of container elements to generateblocks/element blocks
 */
export class ElementProvider extends BaseProvider {
  /**
   * Container elements that should always be element blocks
   */
  static containerElements = [
    'div', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main', 
    'figure', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'form', 'fieldset'
  ];

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
    
    // Always handle known container elements
    if (ElementProvider.containerElements.includes(tagName)) {
      return true;
    }
    
    // Handle elements that contain other elements
    if (options.semanticMapping) {
      const contentType = this.analyzeElementContent(element);
      return ['child_elements', 'mixed_content', 'empty'].includes(contentType);
    }
    
    return false;
  }

  /**
   * Convert element to element block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Element block
   */
  async convert(element, options) {
    const tagName = element.tagName.toLowerCase();
    const attrs = this.extractAttributes(element, 'generateblocks/element', options);
    
    // Handle special tag conversions
    const actualTagName = this.getActualTagName(tagName, element, options);
    if (actualTagName !== tagName) {
      attrs.tagName = actualTagName;
      // Preserve original tag name as data attribute
      if (!attrs.htmlAttributes) {
        attrs.htmlAttributes = {};
      }
      attrs.htmlAttributes['data-original-tag'] = tagName;
    }
    
    // Process children
    const { innerBlocks, innerContent } = await this.processChildren(element, options);
    
    // Build HTML structure
    const openingTag = this.buildOpeningTag(actualTagName, attrs, 'generateblocks/element');
    const closingTag = `</${actualTagName}>`;
    
    const innerHTML = openingTag + this.buildInnerHTML(innerContent) + closingTag;
    
    return {
      blockName: 'generateblocks/element',
      attrs,
      innerBlocks,
      innerHTML,
      innerContent: [openingTag, ...innerContent, closingTag]
    };
  }

  /**
   * Get actual tag name (handle conversions like picture -> div)
   * @param {string} tagName - Original tag name
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {string} Actual tag name to use
   */
  getActualTagName(tagName, element, options) {
    // Convert unsupported elements to div
    const unsupportedElements = ['picture', 'video', 'audio', 'canvas', 'svg', 'object', 'embed'];
    
    if (unsupportedElements.includes(tagName)) {
      return 'div';
    }
    
    return tagName;
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
          // Handle orphaned text as inline content or text block
          if (text.length > 20) {
            // Create text block for substantial text
            const textBlock = this.createOrphanedTextBlock(text, options);
            innerBlocks.push(textBlock);
            innerContent.push(null);
          } else {
            // Keep short text as inline content
            innerContent.push(text);
          }
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
   * Create text block for orphaned text
   * @param {string} text - Text content
   * @param {Object} options - Conversion options
   * @returns {Object} Text block
   */
  createOrphanedTextBlock(text, options) {
    return {
      blockName: 'generateblocks/text',
      attrs: {
        uniqueId: `orphaned-${Date.now()}`,
        tagName: 'span',
        content: text,
        className: 'gb-text'
      },
      innerBlocks: [],
      innerHTML: `<span class="gb-text">${text}</span>`,
      innerContent: [`<span class="gb-text">${text}</span>`]
    };
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
   * @returns {number} Priority (lower than text/media providers)
   */
  getPriority() {
    return 25;
  }

  /**
   * Get supported elements
   * @returns {Array} Supported element names
   */
  getSupportedElements() {
    return [...ElementProvider.containerElements];
  }
}