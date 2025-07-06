import { BaseProvider } from '../BaseProvider.js';

/**
 * Gutenberg Button Provider
 * Converts button elements and styled links to core/button blocks
 */
export class ButtonProvider extends BaseProvider {
  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    
    // Handle button elements
    if (tagName === 'button') {
      return true;
    }
    
    // Handle links that look like buttons (have button-like classes)
    if (tagName === 'a') {
      const classList = element.classList;
      const buttonClasses = ['btn', 'button', 'cta', 'call-to-action'];
      return buttonClasses.some(btnClass => 
        Array.from(classList).some(cls => cls.toLowerCase().includes(btnClass))
      );
    }
    
    return false;
  }

  /**
   * Convert element to Gutenberg button block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Button block
   */
  async convert(element, options) {
    const buttonsAttrs = {
      blockId: this.generateBlockId()
    };
    
    const buttonAttrs = {
      blockId: this.generateBlockId()
    };
    
    const tagName = element.tagName.toLowerCase();
    
    // Extract button text
    const text = this.extractTextContent(element);
    if (text) {
      buttonAttrs.text = text;
    }
    
    // Extract URL for links
    if (tagName === 'a') {
      const href = element.getAttribute('href');
      if (href) {
        buttonAttrs.url = href;
      }
      
      // Check for target attribute
      const target = element.getAttribute('target');
      if (target === '_blank') {
        buttonAttrs.linkTarget = '_blank';
      }
      
      // Check for rel attribute
      const rel = element.getAttribute('rel');
      if (rel) {
        buttonAttrs.rel = rel;
      }
    }
    
    // Build the button HTML with proper classes
    const buttonHTML = this.buildButtonHTML(text);
    
    // Create inner button block
    const innerButtonBlock = {
      blockName: 'core/button',
      attrs: buttonAttrs,
      innerBlocks: [],
      innerHTML: buttonHTML,
      innerContent: [buttonHTML]
    };
    
    // Build the buttons wrapper HTML
    const innerHTML = `<div class="wp-block-buttons"><!-- wp:button {"blockId":"${buttonAttrs.blockId}"} -->
    ${buttonHTML}
    <!-- /wp:button --></div>`;
    
    return {
      blockName: 'core/buttons',
      attrs: buttonsAttrs,
      innerBlocks: [innerButtonBlock],
      innerHTML,
      innerContent: [innerHTML]
    };
  }

  /**
   * Determine button style based on element classes
   * @param {Element} element - Button element
   * @param {Object} attrs - Block attributes
   */
  determineButtonStyle(element, attrs) {
    const classList = Array.from(element.classList);
    
    // Common button style mappings
    const styleMap = {
      'primary': 'is-style-fill',
      'secondary': 'is-style-outline',
      'outline': 'is-style-outline',
      'ghost': 'is-style-outline',
      'text': 'is-style-text'
    };
    
    for (const [keyword, style] of Object.entries(styleMap)) {
      if (classList.some(cls => cls.toLowerCase().includes(keyword))) {
        attrs.className = attrs.className ? `${attrs.className} ${style}` : style;
        break;
      }
    }
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
   * Build button HTML with proper Gutenberg structure
   * @param {string} text - Button text
   * @returns {string} Button HTML
   */
  buildButtonHTML(text) {
    return `<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">${text}</a></div>`;
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
    return ['button', 'a'];
  }
}