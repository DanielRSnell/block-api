import { BaseProvider } from '../BaseProvider.js';

/**
 * Gutenberg Quote Provider
 * Converts blockquote elements to core/quote blocks
 */
export class QuoteProvider extends BaseProvider {
  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'blockquote';
  }

  /**
   * Convert element to Gutenberg quote block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Quote block
   */
  async convert(element, options) {
    const attrs = this.extractGutenbergAttributes(element, options);
    
    // Add blockId
    attrs.blockId = this.generateBlockId();
    
    // Extract quote content and citation
    const { value, citation } = this.extractQuoteContent(element);
    
    if (value) {
      attrs.value = value;
    }
    
    if (citation) {
      attrs.citation = citation;
    }
    
    // Build inner blocks for paragraph content
    const innerBlocks = [];
    const paragraphs = element.querySelectorAll('p');
    
    let innerHTML = this.buildGutenbergTag('blockquote', attrs);
    
    if (paragraphs.length > 0) {
      for (const p of paragraphs) {
        const pAttrs = {
          blockId: this.generateBlockId()
        };
        
        const pContent = p.textContent.trim();
        
        innerBlocks.push({
          blockName: 'core/paragraph',
          attrs: pAttrs,
          innerBlocks: [],
          innerHTML: `<p>${pContent}</p>`,
          innerContent: [`<p>${pContent}</p>`]
        });
        
        innerHTML += `<!-- wp:paragraph {"blockId":"${pAttrs.blockId}"} -->
    <p>${pContent}</p>
    <!-- /wp:paragraph -->`;
      }
    } else {
      // Handle text content directly
      const textContent = element.textContent.trim();
      if (textContent) {
        const pAttrs = {
          blockId: this.generateBlockId()
        };
        
        innerBlocks.push({
          blockName: 'core/paragraph',
          attrs: pAttrs,
          innerBlocks: [],
          innerHTML: `<p>${textContent}</p>`,
          innerContent: [`<p>${textContent}</p>`]
        });
        
        innerHTML += `<!-- wp:paragraph {"blockId":"${pAttrs.blockId}"} -->
    <p>${textContent}</p>
    <!-- /wp:paragraph -->`;
      }
    }
    
    innerHTML += '</blockquote>';
    
    return {
      blockName: 'core/quote',
      attrs,
      innerBlocks,
      innerHTML,
      innerContent: [innerHTML]
    };
  }

  /**
   * Extract quote content and citation
   * @param {Element} element - Blockquote element
   * @returns {Object} Quote value and citation
   */
  extractQuoteContent(element) {
    let value = '';
    let citation = '';
    
    // Look for cite element or data-cite attribute
    const citeElement = element.querySelector('cite');
    if (citeElement) {
      citation = citeElement.textContent.trim();
      // Remove cite element from value extraction
      citeElement.remove();
    }
    
    // Check for cite attribute
    const citeAttr = element.getAttribute('cite');
    if (citeAttr && !citation) {
      citation = citeAttr;
    }
    
    // Extract the main quote content
    value = element.innerHTML.trim();
    
    return { value, citation };
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
    
    // HTML attributes (excluding cite which is handled separately)
    const htmlAttrs = {};
    for (const attr of element.attributes) {
      const name = attr.name;
      const value = attr.value;
      
      // Skip class and cite attributes (handled separately)
      if (name === 'class' || name === 'cite') continue;
      
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
    const classes = ['wp-block-quote'];
    
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
    const innerContent = [];
    
    for (const child of element.childNodes) {
      if (child.nodeType === 1) { // Element node
        // Process child elements as HTML
        const childHtml = child.outerHTML;
        innerContent.push(childHtml);
      } else if (child.nodeType === 3) { // Text node
        const text = child.textContent?.trim();
        if (text) {
          innerContent.push(text);
        }
      }
    }
    
    return { innerBlocks: [], innerContent };
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
    return ['blockquote'];
  }
}