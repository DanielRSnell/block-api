/**
 * HTML utility functions for sanitization and parsing
 */

/**
 * Sanitize HTML for security
 * @param {string} html - Raw HTML string
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let cleaned = html;

  // Remove script and style tags for security
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove dangerous attributes
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["\'][^"\']*["\']/gi, '');
  cleaned = cleaned.replace(/\s*javascript\s*:/gi, '');
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Extract text content from HTML element
 * @param {Element} element - DOM element
 * @returns {string} Text content
 */
export function extractTextContent(element) {
  if (!element) return '';
  
  return element.textContent?.trim() || '';
}

/**
 * Extract attributes from HTML element
 * @param {Element} element - DOM element
 * @param {Object} options - Extraction options
 * @returns {Object} Extracted attributes
 */
export function extractElementAttributes(element, options = {}) {
  if (!element || !element.attributes) {
    return {};
  }

  const attrs = {};
  
  for (const attr of element.attributes) {
    const name = attr.name;
    const value = attr.value;
    
    // Skip class if not preserving classes
    if (name === 'class' && !options.preserveClasses) {
      continue;
    }
    
    // Skip style if not preserving styles
    if (name === 'style' && !options.preserveStyles) {
      continue;
    }
    
    attrs[name] = value;
  }
  
  return attrs;
}

/**
 * Parse CSS classes from class attribute
 * @param {string} classString - Class attribute value
 * @returns {Array} Array of class names
 */
export function parseClasses(classString) {
  if (!classString || typeof classString !== 'string') {
    return [];
  }
  
  return classString
    .split(' ')
    .map(cls => cls.trim())
    .filter(Boolean);
}

/**
 * Check if element is a custom element (contains hyphen)
 * @param {string} tagName - Tag name to check
 * @returns {boolean} Whether it's a custom element
 */
export function isCustomElement(tagName) {
  if (!tagName || typeof tagName !== 'string') {
    return false;
  }
  
  return /^[a-z]+-[a-z-]+$/.test(tagName.toLowerCase());
}

/**
 * Get element content type
 * @param {Element} element - DOM element to analyze
 * @returns {string} Content type: 'text_only', 'elements_only', 'mixed', 'empty'
 */
export function getElementContentType(element) {
  if (!element || !element.childNodes) {
    return 'empty';
  }

  let hasText = false;
  let hasElements = false;
  let textContent = '';

  for (const child of element.childNodes) {
    if (child.nodeType === 3) { // Text node
      const text = child.textContent?.trim();
      if (text) {
        hasText = true;
        textContent += text;
      }
    } else if (child.nodeType === 1) { // Element node
      hasElements = true;
    }
  }

  if (!hasText && !hasElements) {
    return 'empty';
  } else if (hasText && !hasElements) {
    return 'text_only';
  } else if (!hasText && hasElements) {
    return 'elements_only';
  } else {
    // Has both - check if text is substantial
    return textContent.length >= 5 ? 'mixed' : 'elements_only';
  }
}

/**
 * Check if element should be treated as text block
 * @param {Element} element - DOM element
 * @returns {boolean} Whether element should be text block
 */
export function shouldBeTextBlock(element) {
  if (!element) return false;
  
  const tagName = element.tagName.toLowerCase();
  const textTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button'];
  
  // Always text blocks for these tags
  if (textTags.includes(tagName)) {
    return true;
  }
  
  // Check content type for other elements
  const contentType = getElementContentType(element);
  return contentType === 'text_only';
}

/**
 * Build HTML attributes string
 * @param {Object} attributes - Attributes object
 * @returns {string} HTML attributes string
 */
export function buildAttributesString(attributes) {
  if (!attributes || typeof attributes !== 'object') {
    return '';
  }
  
  return Object.entries(attributes)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(' ');
}

/**
 * Escape HTML characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
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
 * Validate HTML structure
 * @param {string} html - HTML string to validate
 * @returns {Object} Validation result
 */
export function validateHtmlStructure(html) {
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  if (!html || typeof html !== 'string') {
    result.isValid = false;
    result.errors.push('HTML content is required');
    return result;
  }
  
  // Check for unclosed tags (basic validation)
  const openTags = html.match(/<[^/][^>]*>/g) || [];
  const closeTags = html.match(/<\/[^>]*>/g) || [];
  
  if (openTags.length !== closeTags.length) {
    result.warnings.push('Potentially unclosed HTML tags detected');
  }
  
  // Check for dangerous content
  if (/<script/i.test(html)) {
    result.warnings.push('Script tags detected - will be removed');
  }
  
  if (/on\w+\s*=/i.test(html)) {
    result.warnings.push('Event handlers detected - will be removed');
  }
  
  return result;
}