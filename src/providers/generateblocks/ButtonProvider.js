import { BaseProvider } from '../BaseProvider.js';
import crypto from 'crypto';

/**
 * Button Provider for GenerateBlocks
 * Handles conversion of button elements with optional icons to generateblocks/text blocks
 * Creates proper structure with gb-shape for SVG icons and inline-flex styling
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
    
    // First check if this is an icon-only button - if so, let ShapeProvider handle it
    const buttonContent = this.analyzeButtonContent(element);
    const isIconOnly = buttonContent.hasIcons && !buttonContent.textContent.trim();
    
    if (isIconOnly) {
      return false; // Let ShapeProvider handle icon-only buttons
    }
    
    // Handle button elements with text content
    if (tagName === 'button') {
      return true;
    }
    
    // Handle anchor elements with button-like classes or roles that have text content
    if (tagName === 'a') {
      const classList = element.className || '';
      const role = element.getAttribute('role');
      
      // Check for common button class patterns
      const buttonPatterns = ['btn', 'button', 'cta', 'action'];
      const hasButtonClass = buttonPatterns.some(pattern => 
        classList.toLowerCase().includes(pattern)
      );
      
      if (hasButtonClass || role === 'button') {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Convert element to appropriate block structure
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} GenerateBlocks block
   */
  async convert(element, options) {
    const tagName = element.tagName.toLowerCase();
    const buttonContent = this.analyzeButtonContent(element);
    
    // Check if this is an icon-only button (has icons but no text)
    const isIconOnly = buttonContent.hasIcons && !buttonContent.textContent.trim();
    
    if (isIconOnly) {
      // Use generateblocks/element + generateblocks/shape format for icon-only buttons
      return this.createIconOnlyButton(element, buttonContent, options);
    } else {
      // Use generateblocks/text format for buttons with text
      return this.createTextButton(element, buttonContent, options);
    }
  }

  /**
   * Create icon-only button using generateblocks/element + generateblocks/shape
   * @param {Element} element - DOM element
   * @param {Object} buttonContent - Button content analysis
   * @param {Object} options - Conversion options
   * @returns {Object} GenerateBlocks element block with shape
   */
  createIconOnlyButton(element, buttonContent, options) {
    const tagName = element.tagName.toLowerCase();
    const uniqueId = this.generateShortUniqueId();
    
    // Build element attributes
    const attrs = {};
    attrs.uniqueId = uniqueId;
    attrs.tagName = tagName;
    attrs.styles = {};
    attrs.blockId = `block-${uniqueId}-mc8d2agk`;
    attrs.metadata = { name: "Button Element" };
    attrs.className = 'gb-element';
    
    // Extract global classes
    const classes = this.extractCssClasses(element, options);
    if (classes.length > 0) {
      attrs.globalClasses = classes;
    }
    
    // Extract HTML attributes (href, target, etc.)
    const htmlAttrs = this.extractButtonHtmlAttributes(element, options);
    if (Object.keys(htmlAttrs).length > 0) {
      attrs.htmlAttributes = htmlAttrs;
    }
    
    // Create shape inner block for the SVG
    const shapeId = this.generateShortUniqueId();
    const shapeAttrs = {
      uniqueId: shapeId,
      styles: {
        position: "absolute",
        bottom: "0",
        left: "0", 
        right: "0",
        overflowX: "hidden",
        overflowY: "hidden",
        pointerEvents: "none",
        color: "#000000",
        svg: {
          fill: "currentColor",
          width: "100%"
        }
      },
      css: `.gb-shape-${shapeId}{bottom:0;color:#000000;left:0;overflow-x:hidden;overflow-y:hidden;pointer-events:none;position:absolute;right:0}.gb-shape-${shapeId} svg{fill:currentColor;width:100%}`,
      blockId: `block-c7${shapeId}-6f41-4940-bdf4-ac4fddeb4846`,
      className: 'gb-shape--divider'
    };
    
    // Get the first SVG (assuming single icon for icon-only buttons)
    const svgContent = buttonContent.icons.length > 0 ? buttonContent.icons[0].outerHTML : '';
    
    const shapeInnerHTML = `<span class="gb-shape gb-shape-${shapeId} gb-shape--divider">${svgContent}</span>`;
    
    const shapeBlock = {
      blockName: 'generateblocks/shape',
      attrs: shapeAttrs,
      innerBlocks: [],
      innerHTML: shapeInnerHTML,
      innerContent: [shapeInnerHTML]
    };
    
    // Build element innerHTML
    const elementClassList = [];
    if (classes.length > 0) {
      elementClassList.push(...classes);
    }
    elementClassList.push('gb-element');
    
    let attrsString = ` class="${elementClassList.join(' ')}"`;
    for (const [key, value] of Object.entries(htmlAttrs)) {
      attrsString += ` ${key}="${this.escapeHtml(value)}"`;
    }
    
    const innerHTML = `<${tagName}${attrsString}>${shapeInnerHTML}</${tagName}>`;
    
    return {
      blockName: 'generateblocks/element',
      attrs,
      innerBlocks: [shapeBlock],
      innerHTML,
      innerContent: [innerHTML]
    };
  }

  /**
   * Create text button using generateblocks/text format (original implementation)
   * @param {Element} element - DOM element
   * @param {Object} buttonContent - Button content analysis
   * @param {Object} options - Conversion options
   * @returns {Object} GenerateBlocks text block
   */
  createTextButton(element, buttonContent, options) {
    const tagName = element.tagName.toLowerCase();
    const uniqueId = this.generateShortUniqueId();
    
    // Build attributes
    const attrs = {};
    attrs.uniqueId = uniqueId;
    attrs.tagName = tagName;
    
    // Add styles for button with optional icons
    attrs.styles = this.buildButtonStyles(buttonContent.hasIcons);
    
    // Generate CSS
    attrs.css = this.generateButtonCss(uniqueId, attrs.styles);
    
    // Generate blockId
    attrs.blockId = `block-fc${uniqueId}-d668-48e5-933e-28ba2c87cd4d`;
    
    // Extract global classes
    const classes = this.extractCssClasses(element, options);
    if (classes.length > 0) {
      attrs.globalClasses = classes;
    }
    
    // Extract HTML attributes (href, target, etc.)
    const htmlAttrs = this.extractButtonHtmlAttributes(element, options);
    if (Object.keys(htmlAttrs).length > 0) {
      attrs.htmlAttributes = htmlAttrs;
    }
    
    // Build innerHTML
    const innerHTML = this.buildButtonInnerHTML(element, buttonContent, uniqueId, classes, htmlAttrs);
    
    return {
      blockName: 'generateblocks/text',
      attrs,
      innerBlocks: [],
      innerHTML,
      innerContent: [innerHTML]
    };
  }

  /**
   * Analyze button content to identify icons and text
   * @param {Element} element - Button element
   * @returns {Object} Content analysis
   */
  analyzeButtonContent(element) {
    const content = {
      hasIcons: false,
      icons: [],
      textContent: '',
      textNodes: []
    };
    
    // Simple recursive approach to find SVGs and text
    this.analyzeNode(element, content);
    
    return content;
  }

  /**
   * Recursively analyze nodes
   * @param {Node} node - Node to analyze
   * @param {Object} content - Content object to populate
   */
  analyzeNode(node, content) {
    if (node.nodeType === 1) { // Element node
      if (node.tagName && node.tagName.toLowerCase() === 'svg') {
        content.hasIcons = true;
        content.icons.push({
          element: node,
          outerHTML: node.outerHTML
        });
      } else {
        // Recursively analyze children
        for (let child of node.childNodes) {
          this.analyzeNode(child, content);
        }
      }
    } else if (node.nodeType === 3) { // Text node
      const text = node.textContent.trim();
      if (text) {
        content.textNodes.push({ text });
        content.textContent += text + ' ';
      }
    }
  }

  /**
   * Get the position of a node relative to its container
   * @param {Node} node - Target node
   * @param {Element} container - Container element
   * @returns {number} Position index
   */
  getNodePosition(node, container) {
    let position = 0;
    let walker = container.firstChild;
    
    while (walker && walker !== node) {
      if (walker.nodeType === Node.ELEMENT_NODE || 
          (walker.nodeType === Node.TEXT_NODE && walker.textContent.trim())) {
        position++;
      }
      walker = walker.nextSibling;
    }
    
    return position;
  }

  /**
   * Build styles for button
   * @param {boolean} hasIcons - Whether button contains icons
   * @returns {Object} Styles object
   */
  buildButtonStyles(hasIcons) {
    const styles = {};
    
    if (hasIcons) {
      styles.display = 'inline-flex';
      styles.alignItems = 'center';
      styles.columnGap = '0.5em';
      
      // SVG styles for icons
      styles['.gb-shape svg'] = {
        width: '1em',
        height: '1em',
        fill: 'currentColor'
      };
    }
    
    return styles;
  }

  /**
   * Generate CSS for button
   * @param {string} uniqueId - Unique ID
   * @param {Object} styles - Styles object
   * @returns {string} Generated CSS
   */
  generateButtonCss(uniqueId, styles) {
    let css = '';
    
    // Base button styles
    if (styles.display || styles.alignItems || styles.columnGap) {
      css += `.gb-text-${uniqueId}{`;
      if (styles.alignItems) css += `align-items:${styles.alignItems};`;
      if (styles.columnGap) css += `column-gap:${styles.columnGap};`;
      if (styles.display) css += `display:${styles.display}`;
      css += '}';
    }
    
    // SVG icon styles
    if (styles['.gb-shape svg']) {
      css += `.gb-text-${uniqueId} .gb-shape svg{`;
      const svgStyles = styles['.gb-shape svg'];
      for (const [property, value] of Object.entries(svgStyles)) {
        css += `${property}:${value};`;
      }
      css += '}';
    }
    
    return css;
  }

  /**
   * Extract HTML attributes for button
   * @param {Element} element - Button element
   * @param {Object} options - Conversion options
   * @returns {Object} HTML attributes
   */
  extractButtonHtmlAttributes(element, options) {
    const attrs = {};
    
    // For anchor elements, preserve link attributes
    if (element.tagName.toLowerCase() === 'a') {
      if (element.hasAttribute('href')) {
        attrs.href = element.getAttribute('href');
      }
      if (element.hasAttribute('target')) {
        attrs.target = element.getAttribute('target');
      }
      if (element.hasAttribute('rel')) {
        attrs.rel = element.getAttribute('rel');
      }
    }
    
    // For button elements, preserve type and other attributes
    if (element.tagName.toLowerCase() === 'button') {
      if (element.hasAttribute('type')) {
        attrs.type = element.getAttribute('type');
      }
      if (element.hasAttribute('disabled')) {
        attrs.disabled = 'disabled';
      }
    }
    
    // Preserve data attributes
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-') && !['data-shape'].includes(attr.name)) {
        attrs[attr.name] = attr.value;
      }
    }
    
    // Preserve aria attributes
    for (const attr of element.attributes) {
      if (attr.name.startsWith('aria-')) {
        attrs[attr.name] = attr.value;
      }
    }
    
    return attrs;
  }

  /**
   * Build innerHTML for button with proper icon structure
   * @param {Element} element - Button element
   * @param {Object} content - Button content analysis
   * @param {string} uniqueId - Unique ID
   * @param {Array} classes - CSS classes
   * @param {Object} htmlAttrs - HTML attributes
   * @returns {string} Generated innerHTML
   */
  buildButtonInnerHTML(element, content, uniqueId, classes, htmlAttrs) {
    const tagName = element.tagName.toLowerCase();
    
    // Build class list
    const classList = ['gb-text'];
    if (classes.length > 0) {
      classList.push(...classes);
    }
    classList.push(`gb-text-${uniqueId}`);
    
    // Build attributes string
    let attrsString = ` class="${classList.join(' ')}"`;
    
    // Add HTML attributes
    for (const [key, value] of Object.entries(htmlAttrs)) {
      attrsString += ` ${key}="${this.escapeHtml(value)}"`;
    }
    
    // Build content with proper icon structure
    let innerContent = '';
    
    if (content.hasIcons) {
      // Create spans for each icon and text content
      const contentParts = this.buildContentParts(element, content);
      innerContent = contentParts.join('');
    } else {
      // Simple text content - no extra span wrapper
      innerContent = this.escapeHtml(content.textContent.trim());
    }
    
    return `<${tagName}${attrsString}>${innerContent}</${tagName}>`;
  }

  /**
   * Build content parts with proper icon and text structure
   * @param {Element} element - Button element
   * @param {Object} content - Content analysis
   * @returns {Array} Content parts
   */
  buildContentParts(element, content) {
    const parts = [];
    
    // Simple approach: icons first, then text
    // Add all icons
    for (const icon of content.icons) {
      parts.push(`<span class="gb-shape">${icon.outerHTML}</span>`);
    }
    
    // Add text content without extra span wrapper
    if (content.textContent.trim()) {
      parts.push(this.escapeHtml(content.textContent.trim()));
    }
    
    return parts;
  }

  /**
   * Generate short unique ID
   * @returns {string} Short alphanumeric ID
   */
  generateShortUniqueId() {
    return crypto.randomBytes(4).toString('hex');
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
   * Get provider priority (higher than TextProvider to intercept buttons)
   * @returns {number} Priority
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