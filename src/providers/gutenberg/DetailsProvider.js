import { BaseProvider } from '../BaseProvider.js';

/**
 * Gutenberg Details Provider
 * Converts details and summary elements to core/details blocks
 */
export class DetailsProvider extends BaseProvider {
  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'details';
  }

  /**
   * Convert element to Gutenberg details block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Details block
   */
  async convert(element, options) {
    const attrs = this.extractGutenbergAttributes(element, options);
    
    // Add blockId
    attrs.blockId = this.generateBlockId();
    
    // Extract summary text
    const summaryElement = element.querySelector('summary');
    const summaryText = summaryElement ? summaryElement.textContent.trim() : '';
    
    if (summaryText) {
      attrs.summary = summaryText;
    }
    
    // Process content inside details (excluding summary)
    const innerBlocks = [];
    const contentElements = Array.from(element.children).filter(child => 
      child.tagName.toLowerCase() !== 'summary'
    );
    
    let innerHTML = this.buildGutenbergTag('details', attrs);
    innerHTML += `<summary>${summaryText}</summary>`;
    
    if (contentElements.length === 0) {
      // Create empty paragraph if no content
      const emptyParagraphAttrs = {
        placeholder: 'Type / to add a hidden block',
        blockId: this.generateBlockId()
      };
      
      innerBlocks.push({
        blockName: 'core/paragraph',
        attrs: emptyParagraphAttrs,
        innerBlocks: [],
        innerHTML: '<p></p>',
        innerContent: ['<p></p>']
      });
      
      innerHTML += `<!-- wp:paragraph {"placeholder":"Type / to add a hidden block","blockId":"${emptyParagraphAttrs.blockId}"} -->\n<p></p>\n<!-- /wp:paragraph -->`;
    } else {
      // Process content elements
      for (const child of contentElements) {
        const childBlock = await this.convertChildElement(child, options);
        if (childBlock) {
          innerBlocks.push(childBlock);
          innerHTML += childBlock.innerHTML;
        }
      }
    }
    
    innerHTML += '</details>';
    
    return {
      blockName: 'core/details',
      attrs,
      innerBlocks,
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
   * Build opening tag for Gutenberg details blocks
   * @param {string} tagName - HTML tag name
   * @param {Object} attrs - Block attributes
   * @returns {string} Opening tag
   */
  buildGutenbergTag(tagName, attrs) {
    const classes = ['wp-block-details'];
    
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
   * Get provider priority
   * @returns {number} Priority (higher than generic providers)
   */
  getPriority() {
    return 65;
  }

  /**
   * Get supported elements
   * @returns {Array} Supported element names
   */
  getSupportedElements() {
    return ['details'];
  }
}