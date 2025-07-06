import { BaseProvider } from '../BaseProvider.js';
import { generateUniqueId } from '../../utils/blockUtils.js';

/**
 * Greenshift Element Provider
 * Universal provider that converts any HTML element to greenshift-blocks/element
 * Based on the "One Block to Rule Them All" philosophy
 */
export class ElementProvider extends BaseProvider {
  /**
   * CSS class mapping for common utility classes
   */
  static classMapping = {
    // Layout classes
    'container': { maxWidth: ['1200px', '100%', '100%', '100%'] },
    'text-center': { textAlign: ['center', 'center', 'center', 'center'] },
    'text-left': { textAlign: ['left', 'left', 'left', 'left'] },
    'text-right': { textAlign: ['right', 'right', 'right', 'right'] },
    
    // Spacing classes
    'p-1': { padding: ['0.25rem', '0.25rem', '0.25rem', '0.25rem'] },
    'p-2': { padding: ['0.5rem', '0.5rem', '0.5rem', '0.5rem'] },
    'p-3': { padding: ['1rem', '1rem', '1rem', '1rem'] },
    'p-4': { padding: ['1.5rem', '1.5rem', '1.5rem', '1.5rem'] },
    'p-5': { padding: ['3rem', '3rem', '3rem', '3rem'] },
    
    // Margin classes
    'm-1': { margin: ['0.25rem', '0.25rem', '0.25rem', '0.25rem'] },
    'm-2': { margin: ['0.5rem', '0.5rem', '0.5rem', '0.5rem'] },
    'm-3': { margin: ['1rem', '1rem', '1rem', '1rem'] },
    'm-4': { margin: ['1.5rem', '1.5rem', '1.5rem', '1.5rem'] },
    'm-5': { margin: ['3rem', '3rem', '3rem', '3rem'] },
    
    // Display classes
    'hidden': { display: ['none', 'none', 'none', 'none'] },
    'block': { display: ['block', 'block', 'block', 'block'] },
    'inline': { display: ['inline', 'inline', 'inline', 'inline'] },
    'flex': { display: ['flex', 'flex', 'flex', 'flex'] },
    'grid': { display: ['grid', 'grid', 'grid', 'grid'] },
    
    // Color classes
    'bg-primary': { backgroundColor: ['var(--primary-color)', 'var(--primary-color)', 'var(--primary-color)', 'var(--primary-color)'] },
    'bg-secondary': { backgroundColor: ['var(--secondary-color)', 'var(--secondary-color)', 'var(--secondary-color)', 'var(--secondary-color)'] },
    'text-primary': { color: ['var(--primary-color)', 'var(--primary-color)', 'var(--primary-color)', 'var(--primary-color)'] },
    'text-secondary': { color: ['var(--secondary-color)', 'var(--secondary-color)', 'var(--secondary-color)', 'var(--secondary-color)'] },
    
    // Flexbox classes
    'justify-center': { justifyContent: ['center', 'center', 'center', 'center'] },
    'justify-between': { justifyContent: ['space-between', 'space-between', 'space-between', 'space-between'] },
    'items-center': { alignItems: ['center', 'center', 'center', 'center'] },
    'items-start': { alignItems: ['flex-start', 'flex-start', 'flex-start', 'flex-start'] },
    'items-end': { alignItems: ['flex-end', 'flex-end', 'flex-end', 'flex-end'] },
    
    // Width classes
    'w-full': { width: ['100%', '100%', '100%', '100%'] },
    'w-1/2': { width: ['50%', '50%', '100%', '100%'] },
    'w-1/3': { width: ['33.333%', '33.333%', '100%', '100%'] },
    'w-1/4': { width: ['25%', '25%', '50%', '100%'] },
    
    // Height classes
    'h-full': { height: ['100%', '100%', '100%', '100%'] },
    'h-screen': { height: ['100vh', '100vh', '100vh', '100vh'] },
    
    // Border classes
    'border': { border: ['1px solid #e5e7eb', '1px solid #e5e7eb', '1px solid #e5e7eb', '1px solid #e5e7eb'] },
    'border-2': { border: ['2px solid #e5e7eb', '2px solid #e5e7eb', '2px solid #e5e7eb', '2px solid #e5e7eb'] },
    'rounded': { borderRadius: ['0.25rem', '0.25rem', '0.25rem', '0.25rem'] },
    'rounded-lg': { borderRadius: ['0.5rem', '0.5rem', '0.5rem', '0.5rem'] },
    'rounded-xl': { borderRadius: ['0.75rem', '0.75rem', '0.75rem', '0.75rem'] },
    'rounded-full': { borderRadius: ['9999px', '9999px', '9999px', '9999px'] },
    
    // Shadow classes
    'shadow': { boxShadow: ['0 1px 3px 0 rgb(0 0 0 / 0.1)', '0 1px 3px 0 rgb(0 0 0 / 0.1)', '0 1px 3px 0 rgb(0 0 0 / 0.1)', '0 1px 3px 0 rgb(0 0 0 / 0.1)'] },
    'shadow-md': { boxShadow: ['0 4px 6px -1px rgb(0 0 0 / 0.1)', '0 4px 6px -1px rgb(0 0 0 / 0.1)', '0 4px 6px -1px rgb(0 0 0 / 0.1)', '0 4px 6px -1px rgb(0 0 0 / 0.1)'] },
    'shadow-lg': { boxShadow: ['0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 10px 15px -3px rgb(0 0 0 / 0.1)'] },
    
    // Typography classes
    'text-xs': { fontSize: ['0.75rem', '0.75rem', '0.75rem', '0.75rem'] },
    'text-sm': { fontSize: ['0.875rem', '0.875rem', '0.875rem', '0.875rem'] },
    'text-base': { fontSize: ['1rem', '1rem', '1rem', '1rem'] },
    'text-lg': { fontSize: ['1.125rem', '1.125rem', '1.125rem', '1.125rem'] },
    'text-xl': { fontSize: ['1.25rem', '1.25rem', '1.25rem', '1.25rem'] },
    'text-2xl': { fontSize: ['1.5rem', '1.5rem', '1.5rem', '1.5rem'] },
    'text-3xl': { fontSize: ['1.875rem', '1.875rem', '1.875rem', '1.875rem'] },
    'text-4xl': { fontSize: ['2.25rem', '2.25rem', '2.25rem', '2.25rem'] },
    'text-5xl': { fontSize: ['3rem', '3rem', '3rem', '3rem'] },
    'text-6xl': { fontSize: ['3.75rem', '3.75rem', '3.75rem', '3.75rem'] },
    'font-thin': { fontWeight: ['100', '100', '100', '100'] },
    'font-light': { fontWeight: ['300', '300', '300', '300'] },
    'font-normal': { fontWeight: ['400', '400', '400', '400'] },
    'font-medium': { fontWeight: ['500', '500', '500', '500'] },
    'font-semibold': { fontWeight: ['600', '600', '600', '600'] },
    'font-bold': { fontWeight: ['700', '700', '700', '700'] },
    'font-extrabold': { fontWeight: ['800', '800', '800', '800'] },
    'font-black': { fontWeight: ['900', '900', '900', '900'] },
  };

  /**
   * HTML attribute mapping to Greenshift attributes
   */
  static attributeMapping = {
    'id': 'uniqueId',
    'class': 'globalClasses',
    'href': 'url',
    'target': 'linkTarget',
    'rel': 'relNofollow',
    'src': 'url',
    'alt': 'alt',
    'width': 'width',
    'height': 'height',
    'type': 'inputType',
    'name': 'inputName',
    'value': 'inputValue',
    'placeholder': 'placeholder',
  };

  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} True if can handle
   */
  canHandle(element, options) {
    // Universal handler - can handle any element
    return true;
  }

  /**
   * Convert element to Greenshift block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Greenshift block
   */
  async convert(element, options) {
    const attrs = this.extractGreenshiftAttributes(element, options);
    const innerBlocks = await this.processChildren(element, options);
    
    // Determine content type
    const contentType = this.analyzeElementContent(element);
    const textContent = this.extractTextContent(element);
    
    // Set content type and innerHTML based on element content
    if (contentType === 'text_only' && textContent) {
      attrs.type = 'text';
      attrs.innerText = textContent;
    } else if (innerBlocks.length > 0) {
      attrs.type = 'inner';
    } else {
      attrs.type = 'no';
    }

    const innerHTML = this.generateInnerHTML(element, attrs, textContent);
    const innerContent = this.generateInnerContent(element, attrs, textContent, innerBlocks);

    return {
      blockName: 'greenshift-blocks/element',
      attrs,
      innerBlocks,
      innerHTML,
      innerContent
    };
  }

  /**
   * Extract Greenshift-specific attributes from element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Greenshift attributes
   */
  extractGreenshiftAttributes(element, options) {
    const attrs = {};
    const uniqueId = generateUniqueId();
    
    // 1. Core Greenshift attributes (required)
    attrs.id = `gsbp-${uniqueId.substring(0, 7)}`;  // Greenshift format
    attrs.localId = attrs.id;  // Same as id
    attrs.blockId = `block-${uniqueId}`;  // Full UUID format
    
    // 2. HTML tag (not tagName!)
    const tagName = element.tagName.toLowerCase();
    if (tagName !== 'div') {
      attrs.tag = tagName;  // Only set if not div (div is default)
    }
    
    // 3. Handle text content for text-only elements
    const contentType = this.analyzeElementContent(element);
    const textContent = this.extractTextContent(element);
    
    if (contentType === 'text_only' && textContent) {
      // For text elements, preserve HTML markup
      attrs.textContent = this.extractHtmlContent(element);
      // No type needed for text-only elements
    } else if (element.children.length > 0) {
      attrs.type = 'inner';  // Has child elements
    } else if (!textContent) {
      attrs.type = 'no';  // Empty element
    }
    
    // 4. Handle HTML attributes
    const htmlAttrs = this.extractHtmlAttributes(element, options);
    const dynamicAttributes = [];
    
    // Define attributes that should NOT go into dynamicAttributes
    const excludedAttributes = new Set([
      'id', 'class', 'src', 'alt', 'href', 'target', 'rel', 'type', 'name', 
      'value', 'placeholder', 'width', 'height', 'style', 'title', 'role',
      'tabindex', 'disabled', 'readonly', 'required', 'checked', 'selected'
    ]);
    
    for (const [key, value] of Object.entries(htmlAttrs)) {
      if (key === 'id') {
        // Use HTML id as the Greenshift id if present
        attrs.id = `gsbp-${value}`;
        attrs.localId = attrs.id;
      } else if (key === 'href') {
        attrs.href = value;
      } else if (key === 'src') {
        attrs.src = value;
      } else if (key === 'alt') {
        attrs.alt = value;
      } else if (key === 'target') {
        attrs.target = value;
      } else if (key.startsWith('data-') || key.startsWith('aria-')) {
        // Keep data and aria attributes as-is (these can stay as direct attributes)
        attrs[key] = value;
      } else if (!excludedAttributes.has(key)) {
        // All other attributes (like Alpine.js x-data, x-init, etc.) go to dynamicAttributes
        dynamicAttributes.push({
          name: key,
          value: value
        });
      }
    }
    
    // Add dynamicAttributes if we have any
    if (dynamicAttributes.length > 0) {
      attrs.dynamicAttributes = dynamicAttributes;
    }
    
    // 5. Handle CSS classes
    const classes = this.extractCssClasses(element, options);
    if (classes.length > 0) {
      attrs.className = classes.join(' ');  // Greenshift uses className, not globalClasses
    }
    
    // 6. Handle special element types
    const specialAttrs = this.parseSpecialElement(element);
    Object.assign(attrs, specialAttrs);
    
    return attrs;
  }

  /**
   * Parse utility classes into Greenshift styling attributes
   * @param {Array} classes - CSS class names
   * @returns {Object} Parsed styling attributes
   */
  parseUtilityClasses(classes) {
    const attrs = {};
    
    for (const className of classes) {
      if (ElementProvider.classMapping[className]) {
        Object.assign(attrs, ElementProvider.classMapping[className]);
      }
    }
    
    return attrs;
  }

  /**
   * Parse inline styles into Greenshift attributes
   * @param {Element} element - DOM element
   * @returns {Object} Parsed style attributes
   */
  parseInlineStyles(element) {
    const attrs = {};
    const style = element.getAttribute('style');
    
    if (!style) return attrs;
    
    // Parse CSS properties
    const properties = style.split(';').map(prop => prop.trim()).filter(Boolean);
    
    for (const property of properties) {
      const [key, value] = property.split(':').map(s => s.trim());
      if (!key || !value) continue;
      
      // Convert CSS property to camelCase
      const camelKey = key.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
      
      // Convert to responsive array format
      attrs[camelKey] = [value, value, value, value];
    }
    
    return attrs;
  }

  /**
   * Parse animation data attributes
   * @param {Element} element - DOM element
   * @returns {Object} Animation attributes
   */
  parseAnimationAttributes(element) {
    const attrs = {};
    
    const animationType = element.getAttribute('data-animation');
    const animationTrigger = element.getAttribute('data-trigger');
    const animationDelay = element.getAttribute('data-delay');
    const animationDuration = element.getAttribute('data-duration');
    
    if (animationType) {
      attrs.type = animationType;
    }
    
    if (animationTrigger) {
      attrs.trigger = animationTrigger;
    }
    
    if (animationDelay) {
      attrs.delay = animationDelay;
    }
    
    if (animationDuration) {
      attrs.duration = animationDuration;
    }
    
    return attrs;
  }

  /**
   * Parse special element types (buttons, images, etc.)
   * @param {Element} element - DOM element
   * @returns {Object} Special attributes
   */
  parseSpecialElement(element) {
    const attrs = {};
    const tagName = element.tagName.toLowerCase();
    
    // Button elements
    if (tagName === 'button' || (tagName === 'a' && this.looksLikeButton(element))) {
      attrs.isButton = true;
      attrs.buttonStyle = this.extractButtonStyle(element);
    }
    
    // Image elements
    if (tagName === 'img') {
      const src = element.getAttribute('src');
      const alt = element.getAttribute('alt');
      const width = element.getAttribute('width');
      const height = element.getAttribute('height');
      
      if (src) {
        attrs.src = src;
        // Generate media ID from URL (simple hash)
        attrs.mediaid = this.generateMediaId(src);
      }
      if (alt !== null) attrs.alt = alt || '';
      
      // Add dimensions if available, or use defaults
      if (width && height) {
        attrs.originalWidth = parseInt(width);
        attrs.originalHeight = parseInt(height);
      } else {
        // Default dimensions for unknown images
        attrs.originalWidth = 1240;
        attrs.originalHeight = 1240;
      }
    }
    
    // SVG elements
    if (tagName === 'svg') {
      const svgContent = this.extractSvgContent(element);
      if (svgContent) {
        attrs.icon = {
          icon: {
            font: "rhicon rhi-custom",
            svg: svgContent,
            image: ""
          },
          fill: "currentColor",
          fillhover: "currentColor",
          type: "svg"
        };
      }
    }
    
    // Form elements
    if (['input', 'textarea', 'select'].includes(tagName)) {
      attrs.isFormElement = true;
      attrs.formType = tagName;
    }
    
    return attrs;
  }

  /**
   * Generate a media ID from image URL
   * @param {string} src - Image source URL
   * @returns {number} Generated media ID
   */
  generateMediaId(src) {
    // Simple hash function to generate consistent IDs
    let hash = 0;
    for (let i = 0; i < src.length; i++) {
      const char = src.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 1000 + 100; // Keep it reasonable (100-1099)
  }

  /**
   * Extract SVG content including path elements
   * @param {Element} svgElement - SVG DOM element
   * @returns {string} SVG markup
   */
  extractSvgContent(svgElement) {
    // Get all attributes from the SVG element
    const viewBox = svgElement.getAttribute('viewBox') || '0 0 24 24';
    const xmlns = svgElement.getAttribute('xmlns') || 'http://www.w3.org/2000/svg';
    
    // Get inner content (paths, etc.) and fix self-closing path elements
    let innerContent = svgElement.innerHTML;
    
    if (innerContent.trim()) {
      // Fix path elements to be self-closing and add xmlns attribute
      innerContent = innerContent.replace(/<path([^>]*?)><\/path>/g, '<path xmlns="http://www.w3.org/2000/svg"$1/>');
      innerContent = innerContent.replace(/<path([^>]*?)(?<!\/)>/g, '<path xmlns="http://www.w3.org/2000/svg"$1/>');
      
      return `<svg xmlns="${xmlns}" viewBox="${viewBox}" fill="currentColor">${innerContent}</svg>`;
    }
    
    return '';
  }

  /**
   * Extract HTML content preserving markup for text elements
   * @param {Element} element - DOM element
   * @returns {string} HTML content
   */
  extractHtmlContent(element) {
    // Return innerHTML for text elements to preserve markup like <mark>, <strong>, etc.
    return element.innerHTML.trim();
  }

  /**
   * Check if element looks like a button
   * @param {Element} element - DOM element
   * @returns {boolean} True if looks like button
   */
  looksLikeButton(element) {
    const classes = element.getAttribute('class') || '';
    const buttonKeywords = ['btn', 'button', 'cta', 'action'];
    
    return buttonKeywords.some(keyword => 
      classes.toLowerCase().includes(keyword)
    );
  }

  /**
   * Extract button style from element
   * @param {Element} element - DOM element
   * @returns {string} Button style
   */
  extractButtonStyle(element) {
    const classes = element.getAttribute('class') || '';
    
    if (classes.includes('btn-primary') || classes.includes('primary')) {
      return 'primary';
    } else if (classes.includes('btn-secondary') || classes.includes('secondary')) {
      return 'secondary';
    } else if (classes.includes('btn-outline') || classes.includes('outline')) {
      return 'outline';
    }
    
    return 'default';
  }

  /**
   * Process child elements recursively
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Array} Array of child blocks
   */
  async processChildren(element, options) {
    const innerBlocks = [];
    
    for (const child of element.children) {
      const tagName = child.tagName.toLowerCase();
      
      // Skip empty elements, but NOT self-closing elements like img, input, br, etc.
      const isSelfClosing = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'].includes(tagName);
      if (!isSelfClosing && !child.textContent?.trim() && child.children.length === 0) {
        continue;
      }
      
      // Convert child element
      const childBlock = await this.convert(child, options);
      innerBlocks.push(childBlock);
    }
    
    return innerBlocks;
  }

  /**
   * Generate innerHTML for the block
   * @param {Element} element - DOM element
   * @param {Object} attrs - Block attributes
   * @param {string} textContent - Text content
   * @returns {string} Generated HTML
   */
  generateInnerHTML(element, attrs, textContent) {
    const tagName = attrs.tag || 'div';  // Use tag attribute, default to div
    const openingTag = this.buildGreenshiftOpeningTag(tagName, attrs);
    const closingTag = `</${tagName}>`;
    
    // Handle self-closing tags
    if (['img', 'input', 'br', 'hr', 'meta', 'link'].includes(tagName)) {
      return this.buildGreenshiftSelfClosingTag(tagName, attrs);
    }
    
    // Handle SVG elements with icon content
    if (tagName === 'svg' && attrs.icon && attrs.icon.icon.svg) {
      // Extract path content from the SVG
      const svgContent = attrs.icon.icon.svg;
      const pathMatch = svgContent.match(/<path[^>]*\/?>/);
      const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/) || ['', '0 0 24 24'];
      
      if (pathMatch) {
        return `<svg viewBox="${viewBoxMatch[1]}" class="${attrs.className || ''} ${attrs.id || ''}">${pathMatch[0]}</svg>`;
      }
    }
    
    if (attrs.textContent) {
      return `${openingTag}${attrs.textContent}${closingTag}`;
    } else if (attrs.type === 'inner') {
      return `${openingTag}${closingTag}`;
    } else {
      return `${openingTag}${closingTag}`;
    }
  }

  /**
   * Build opening tag for Greenshift element
   * @param {string} tagName - HTML tag name
   * @param {Object} attrs - Block attributes
   * @returns {string} Opening tag
   */
  buildGreenshiftOpeningTag(tagName, attrs) {
    const htmlAttrs = [];
    
    // Add ID classes (Greenshift format)
    if (attrs.className) {
      if (attrs.id) {
        htmlAttrs.push(`class="${attrs.className} ${attrs.id}"`);
      } else {
        htmlAttrs.push(`class="${attrs.className}"`);
      }
    } else if (attrs.id) {
      htmlAttrs.push(`class="${attrs.id}"`);
    }
    
    // Add specific HTML attributes
    if (attrs.href && tagName === 'a') {
      htmlAttrs.push(`href="${attrs.href}"`);
    }
    
    if (attrs.src && tagName === 'img') {
      htmlAttrs.push(`src="${attrs.src}"`);
      htmlAttrs.push(`loading="lazy"`);  // Greenshift default
    }
    
    if (attrs.alt && tagName === 'img') {
      htmlAttrs.push(`alt="${attrs.alt}"`);
    }
    
    if (attrs.target && tagName === 'a') {
      htmlAttrs.push(`target="${attrs.target}"`);
    }
    
    // Add data attributes
    for (const [key, value] of Object.entries(attrs)) {
      if (key.startsWith('data-') || key.startsWith('aria-')) {
        htmlAttrs.push(`${key}="${value}"`);
      }
    }
    
    // Add dynamic attributes
    if (attrs.dynamicAttributes) {
      for (const dynAttr of attrs.dynamicAttributes) {
        htmlAttrs.push(`${dynAttr.name}="${dynAttr.value}"`);
      }
    }
    
    const attributeString = htmlAttrs.length > 0 ? ' ' + htmlAttrs.join(' ') : '';
    return `<${tagName}${attributeString}>`;
  }

  /**
   * Build self-closing tag for Greenshift element
   * @param {string} tagName - HTML tag name
   * @param {Object} attrs - Block attributes
   * @returns {string} Self-closing tag
   */
  buildGreenshiftSelfClosingTag(tagName, attrs) {
    const htmlAttrs = [];
    
    // Add ID classes (Greenshift format)
    if (attrs.className) {
      if (attrs.id) {
        htmlAttrs.push(`class="${attrs.className} ${attrs.id}"`);
      } else {
        htmlAttrs.push(`class="${attrs.className}"`);
      }
    } else if (attrs.id) {
      htmlAttrs.push(`class="${attrs.id}"`);
    }
    
    // Add specific HTML attributes for self-closing tags
    if (attrs.src && tagName === 'img') {
      htmlAttrs.push(`src="${attrs.src}"`);
      htmlAttrs.push(`loading="lazy"`);
      
      // Add dimensions if available
      if (attrs.originalWidth) {
        htmlAttrs.push(`width="${attrs.originalWidth}"`);
      }
      if (attrs.originalHeight) {
        htmlAttrs.push(`height="${attrs.originalHeight}"`);
      }
    }
    
    if (attrs.alt !== undefined && tagName === 'img') {
      htmlAttrs.push(`alt="${attrs.alt}"`);
    }
    
    // Add data attributes
    for (const [key, value] of Object.entries(attrs)) {
      if (key.startsWith('data-') || key.startsWith('aria-')) {
        htmlAttrs.push(`${key}="${value}"`);
      }
    }
    
    // Add dynamic attributes
    if (attrs.dynamicAttributes) {
      for (const dynAttr of attrs.dynamicAttributes) {
        htmlAttrs.push(`${dynAttr.name}="${dynAttr.value}"`);
      }
    }
    
    const attributeString = htmlAttrs.length > 0 ? ' ' + htmlAttrs.join(' ') : '';
    return `<${tagName}${attributeString}/>`;
  }

  /**
   * Generate innerContent for the block
   * @param {Element} element - DOM element
   * @param {Object} attrs - Block attributes
   * @param {string} textContent - Text content
   * @param {Array} innerBlocks - Inner blocks
   * @returns {Array} Generated inner content
   */
  generateInnerContent(element, attrs, textContent, innerBlocks) {
    const tagName = attrs.tag || 'div';
    
    // Handle self-closing tags
    if (['img', 'input', 'br', 'hr', 'meta', 'link'].includes(tagName)) {
      return [this.buildGreenshiftSelfClosingTag(tagName, attrs)];
    }
    
    // Handle SVG elements with icon content
    if (tagName === 'svg' && attrs.icon && attrs.icon.icon.svg) {
      const svgContent = attrs.icon.icon.svg;
      const pathMatch = svgContent.match(/<path[^>]*\/?>/);
      const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/) || ['', '0 0 24 24'];
      
      if (pathMatch) {
        return [`<svg viewBox="${viewBoxMatch[1]}" class="${attrs.className || ''} ${attrs.id || ''}">${pathMatch[0]}</svg>`];
      }
    }
    
    const openingTag = this.buildGreenshiftOpeningTag(tagName, attrs);
    const closingTag = `</${tagName}>`;
    
    if (attrs.textContent) {
      return [openingTag, attrs.textContent, closingTag];
    } else if (attrs.type === 'inner' && innerBlocks.length > 0) {
      const content = [openingTag];
      innerBlocks.forEach(() => content.push(null));
      content.push(closingTag);
      return content;
    } else {
      return [openingTag, closingTag];
    }
  }

  /**
   * Get provider priority
   * @returns {number} Priority (higher = more important)
   */
  getPriority() {
    return 110; // Highest priority - universal converter, handles images/SVGs before other providers
  }

  /**
   * Get supported elements
   * @returns {Array} Array of supported HTML elements
   */
  getSupportedElements() {
    return ['*']; // Supports all elements
  }
}