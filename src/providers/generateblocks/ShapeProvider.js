import { BaseProvider } from '../BaseProvider.js';
import crypto from 'crypto';

/**
 * Shape Provider
 * Handles conversion of SVG elements to generateblocks/shape blocks
 * Exact port of GB_Shape_Provider
 */
export class ShapeProvider extends BaseProvider {
  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    
    // Handle SVG elements directly
    if (tagName === 'svg') {
      return true;
    }
    
    // Handle elements with shape class or data-shape attribute
    if (element.hasAttribute('class') && element.getAttribute('class').includes('shape')) {
      return true;
    }
    
    if (element.hasAttribute('data-shape')) {
      return true;
    }
    
    // Handle icon-only buttons and links (buttons/links that contain only SVG, no text)
    if (tagName === 'button' || tagName === 'a') {
      const iconAnalysis = this.analyzeElementForIcons(element);
      const isIconOnly = iconAnalysis.hasIcons && !iconAnalysis.textContent.trim();
      
      if (isIconOnly) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Convert element to shape block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Shape block
   */
  async convert(element, options) {
    const tagName = element.tagName.toLowerCase();
    
    // Check if this is an icon-only button/link
    const isIconOnlyButton = (tagName === 'button' || tagName === 'a') && 
                              this.analyzeElementForIcons(element).hasIcons &&
                              !this.analyzeElementForIcons(element).textContent.trim();
    
    if (isIconOnlyButton) {
      return this.convertIconOnlyButton(element, options);
    }
    
    // Extract attributes in GenerateBlocks order for regular shapes
    const attrs = {};
    
    // 1. uniqueId - Generate short alphanumeric ID like "3aacd05a"
    const uniqueId = this.generateShortUniqueId();
    attrs.uniqueId = uniqueId;
    
    // 2. styles - CSS-in-JS object for the shape
    attrs.styles = this.extractShapeStyles(element);
    
    // 3. css - Generated CSS with unique class
    attrs.css = this.generateShapeCss(uniqueId, attrs.styles);
    
    // 4. blockId - GenerateBlocks format
    attrs.blockId = `block-ac${uniqueId.substring(0, 6)}-${uniqueId.substring(0, 4)}-4917-bf34-be8191ca72dc`;
    
    // 5. globalClasses - CSS classes from HTML (optional)
    const classes = this.extractCssClasses(element, options);
    if (classes.length > 0) {
      attrs.globalClasses = classes;
    }
    
    // 6. htmlAttributes - Only non-SVG attributes for the span (optional)
    const htmlAttrs = this.extractSpanHtmlAttributes(element, options);
    if (Object.keys(htmlAttrs).length > 0) {
      attrs.htmlAttributes = htmlAttrs;
    }
    
    // Extract SVG content for innerHTML
    const svgContent = this.extractSvgContent(element);
    
    // Build HTML - Shape uses span with gb-shape and unique class
    const spanClasses = ['gb-shape', `gb-shape-${uniqueId}`];
    
    // Add global classes
    if (classes.length > 0) {
      spanClasses.push(...classes);
    }
    
    const spanAttrs = { class: spanClasses.join(' ') };
    
    // Add only relevant HTML attributes to span (not SVG-specific ones)
    if (Object.keys(htmlAttrs).length > 0) {
      for (const [key, value] of Object.entries(htmlAttrs)) {
        // Skip SVG-specific attributes
        if (!['xmlns', 'viewBox', 'fill', 'stroke', 'width', 'height'].includes(key)) {
          spanAttrs[key] = value;
        }
      }
    }
    
    // Build span tag with SVG content
    const spanAttrString = Object.entries(spanAttrs)
      .map(([key, value]) => ` ${key}="${this.escapeHtml(value)}"`)
      .join('');
    
    const openingTag = `<span${spanAttrString}>`;
    const closingTag = '</span>';
    const innerHtml = openingTag + svgContent + closingTag;
    
    return {
      blockName: 'generateblocks/shape',
      attrs,
      innerBlocks: [],
      innerHTML: innerHtml,
      innerContent: [innerHtml]
    };
  }

  /**
   * Extract SVG content from element
   * @param {Element} element - DOM element
   * @returns {string} SVG content
   */
  extractSvgContent(element) {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'svg') {
      // For direct SVG elements, get the outer HTML
      return element.outerHTML;
    }
    
    // For elements containing SVG, extract the inner SVG
    const svgs = element.getElementsByTagName('svg');
    if (svgs.length > 0) {
      return svgs[0].outerHTML;
    }
    
    return '';
  }

  /**
   * Extract HTML attributes for the span wrapper (non-SVG attributes)
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} HTML attributes
   */
  extractSpanHtmlAttributes(element, options) {
    const attrs = {};
    
    // For direct SVG elements, we want minimal attributes on the span
    if (element.tagName.toLowerCase() === 'svg') {
      // Only extract ID and style if present
      if (element.hasAttribute('id')) {
        attrs.id = element.getAttribute('id');
      }
      
      if (element.hasAttribute('style') && options.preserveStyles) {
        attrs.style = element.getAttribute('style');
      }
      
      return attrs;
    }
    
    // For container elements with SVG, extract non-SVG attributes
    for (const attr of element.attributes) {
      const name = attr.name;
      const value = attr.value;
      
      // Skip attributes that are handled separately or are SVG-specific
      const skipAttrs = ['class', 'data-shape', 'xmlns', 'viewBox', 'fill', 'stroke', 'width', 'height'];
      if (skipAttrs.includes(name)) {
        continue;
      }
      
      // Handle style preservation
      if (name === 'style' && options.preserveStyles) {
        attrs.style = value;
        continue;
      }
      
      // Include ID
      if (name === 'id') {
        attrs.id = value;
        continue;
      }
      
      // Preserve other non-SVG attributes
      attrs[name] = value;
    }
    
    return attrs;
  }

  /**
   * Generate short unique ID like GenerateBlocks uses
   * @returns {string} Short alphanumeric ID
   */
  generateShortUniqueId() {
    return crypto.randomBytes(4).toString('hex');
  }

  /**
   * Extract shape styles from element
   * @param {Element} element - DOM element
   * @returns {Object} Style object
   */
  extractShapeStyles(element) {
    const styles = {};
    
    // Default display style
    styles.display = 'inline-flex';
    
    // SVG-specific styles
    const svgStyles = {};
    
    // Extract dimensions from SVG or element
    if (element.hasAttribute('width')) {
      svgStyles.width = element.getAttribute('width');
      if (!svgStyles.width.includes('px')) {
        svgStyles.width += 'px';
      }
    } else {
      svgStyles.width = '30px'; // Default
    }
    
    if (element.hasAttribute('height')) {
      svgStyles.height = element.getAttribute('height');
      if (!svgStyles.height.includes('px')) {
        svgStyles.height += 'px';
      }
    } else {
      svgStyles.height = '30px'; // Default
    }
    
    // Extract fill from SVG or use default
    if (element.hasAttribute('fill')) {
      svgStyles.fill = element.getAttribute('fill');
    } else {
      svgStyles.fill = 'currentColor'; // Default
    }
    
    styles.svg = svgStyles;
    
    return styles;
  }

  /**
   * Generate CSS for shape block
   * @param {string} uniqueId - Unique ID for the block
   * @param {Object} styles - Style object
   * @returns {string} Generated CSS
   */
  generateShapeCss(uniqueId, styles) {
    let css = '';
    
    // Base class styles
    css += `.gb-shape-${uniqueId}{`;
    if (styles.display) {
      css += `display:${styles.display};`;
    }
    css += '}';
    
    // SVG styles
    if (styles.svg && typeof styles.svg === 'object') {
      css += `.gb-shape-${uniqueId} svg{`;
      for (const [property, value] of Object.entries(styles.svg)) {
        css += `${property}:${value};`;
      }
      css += '}';
    }
    
    return css;
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
   * @returns {number} Priority (higher than custom elements, specific to SVG shapes)
   */
  getPriority() {
    return 80;
  }

  /**
   * Convert icon-only button/link to generateblocks/element + generateblocks/shape
   * @param {Element} element - Button or link element
   * @param {Object} options - Conversion options
   * @returns {Object} GenerateBlocks element block with nested shape
   */
  convertIconOnlyButton(element, options) {
    const tagName = element.tagName.toLowerCase();
    const uniqueId = this.generateShortUniqueId();
    
    // Create element attributes
    const elementAttrs = {
      uniqueId: uniqueId,
      tagName: tagName,
      styles: {},
      blockId: `block-${uniqueId}-mc8d2agk`,
      metadata: { name: "Button Element" },
      className: 'gb-element'
    };
    
    // Extract global classes for the element
    const classes = this.extractCssClasses(element, options);
    if (classes.length > 0) {
      elementAttrs.globalClasses = classes;
    }
    
    // Extract HTML attributes (href, target, etc.)
    const htmlAttrs = this.extractButtonHtmlAttributes(element, options);
    if (Object.keys(htmlAttrs).length > 0) {
      elementAttrs.htmlAttributes = htmlAttrs;
    }
    
    // Create nested shape block
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
      blockId: `block-88${shapeId}-9f74-468d-9f12-9fb1d01c1dc4`,
      className: 'gb-shape--divider'
    };
    
    // Extract SVG content
    const iconAnalysis = this.analyzeElementForIcons(element);
    const svgContent = iconAnalysis.icons.length > 0 ? iconAnalysis.icons[0].outerHTML : '';
    
    const shapeInnerHTML = `<span class="gb-shape gb-shape-${shapeId} gb-shape--divider">${svgContent}</span>`;
    
    const shapeBlock = {
      blockName: 'generateblocks/shape',
      attrs: shapeAttrs,
      innerBlocks: [],
      innerHTML: shapeInnerHTML,
      innerContent: [shapeInnerHTML]
    };
    
    // Build element classList
    const elementClassList = [];
    if (classes.length > 0) {
      elementClassList.push(...classes);
    }
    elementClassList.push('gb-element');
    
    let attrsString = ` class="${elementClassList.join(' ')}"`;
    for (const [key, value] of Object.entries(htmlAttrs)) {
      attrsString += ` ${key}="${this.escapeHtml(value)}"`;
    }
    
    const elementInnerHTML = `<${tagName}${attrsString}><!-- wp:generateblocks/shape ${JSON.stringify(shapeAttrs)} -->\n${shapeInnerHTML}\n<!-- /wp:generateblocks/shape --></${tagName}>`;
    
    return {
      blockName: 'generateblocks/element',
      attrs: elementAttrs,
      innerBlocks: [shapeBlock],
      innerHTML: elementInnerHTML,
      innerContent: [elementInnerHTML]
    };
  }

  /**
   * Extract button HTML attributes
   * @param {Element} element - Button/link element
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
   * Analyze element for SVG icons and text content
   * @param {Element} element - Element to analyze
   * @returns {Object} Analysis result with hasIcons and textContent
   */
  analyzeElementForIcons(element) {
    const analysis = {
      hasIcons: false,
      icons: [],
      textContent: ''
    };
    
    // Simple recursive approach to find SVGs and text
    this.analyzeNodeForIcons(element, analysis);
    
    return analysis;
  }

  /**
   * Recursively analyze nodes for icons and text
   * @param {Node} node - Node to analyze
   * @param {Object} analysis - Analysis object to populate
   */
  analyzeNodeForIcons(node, analysis) {
    if (node.nodeType === 1) { // Element node
      if (node.tagName && node.tagName.toLowerCase() === 'svg') {
        analysis.hasIcons = true;
        analysis.icons.push({
          element: node,
          outerHTML: node.outerHTML
        });
      } else {
        // Recursively analyze children
        for (let child of node.childNodes) {
          this.analyzeNodeForIcons(child, analysis);
        }
      }
    } else if (node.nodeType === 3) { // Text node
      const text = node.textContent.trim();
      if (text) {
        analysis.textContent += text + ' ';
      }
    }
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
   * Get supported elements
   * @returns {Array} Supported element names
   */
  getSupportedElements() {
    return ['svg', 'button', 'a'];
  }
}