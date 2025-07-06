import { BaseProvider } from '../BaseProvider.js';

/**
 * Gutenberg List Provider
 * Converts ul and ol elements to core/list blocks
 */
export class ListProvider extends BaseProvider {
  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'ul' || tagName === 'ol';
  }

  /**
   * Convert element to Gutenberg list block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} List block
   */
  async convert(element, options) {
    const tagName = element.tagName.toLowerCase();
    const attrs = this.extractGutenbergAttributes(element, options);
    
    // Set list type
    if (tagName === 'ol') {
      attrs.ordered = true;
    }
    
    // Add blockId
    attrs.blockId = this.generateBlockId();
    
    // Process list items to create inner blocks
    const innerBlocks = [];
    const listItems = element.querySelectorAll(':scope > li');
    
    let innerContent = this.buildGutenbergTag(tagName, attrs);
    
    for (const li of listItems) {
      const itemAttrs = {
        blockId: this.generateBlockId()
      };
      
      const itemContent = li.textContent.trim();
      
      innerBlocks.push({
        blockName: 'core/list-item',
        attrs: itemAttrs,
        innerBlocks: [],
        innerHTML: `<li>${itemContent}</li>`,
        innerContent: [`<li>${itemContent}</li>`]
      });
      
      // Add to main innerHTML
      innerContent += `<!-- wp:list-item {"blockId":"${itemAttrs.blockId}"} -->
    <li>${itemContent}</li>
    <!-- /wp:list-item -->`;
    }
    
    innerContent += `</${tagName}>`;
    
    return {
      blockName: 'core/list',
      attrs,
      innerBlocks,
      innerHTML: innerContent,
      innerContent: [innerContent]
    };
  }

  /**
   * Extract list items from the list element
   * @param {Element} element - List element
   * @returns {Array} Array of list item values
   */
  extractListItems(element) {
    const values = [];
    const listItems = element.querySelectorAll(':scope > li');
    
    for (const li of listItems) {
      const content = li.innerHTML.trim();
      if (content) {
        values.push(content);
      }
    }
    
    return values;
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
    const classes = ['wp-block-list'];
    
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
      if (child.nodeType === 1 && child.tagName.toLowerCase() === 'li') {
        // Process list items directly as HTML
        const liContent = `<li>${child.innerHTML}</li>`;
        innerContent.push(liContent);
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
    return ['ul', 'ol'];
  }
}