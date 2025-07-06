import { BaseProvider } from './BaseProvider.js';

/**
 * Fallback Provider
 * Handles conversion of unsupported elements to core/html blocks
 * Exact port of GB_Fallback_Provider
 */
export class FallbackProvider extends BaseProvider {
  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle (always true - fallback provider)
   */
  canHandle(element, options) {
    // Fallback provider handles everything that other providers don't
    return true;
  }

  /**
   * Convert element to WordPress HTML block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} HTML block
   */
  async convert(element, options) {
    const html = element.outerHTML;
    
    return {
      blockName: 'core/html',
      attrs: {},
      innerBlocks: [],
      innerHTML: html,
      innerContent: [html]
    };
  }

  /**
   * Get provider priority
   * @returns {number} Priority (lowest - absolute fallback)
   */
  getPriority() {
    return 1;
  }

  /**
   * Get supported elements
   * @returns {Array} Supported element names (all as fallback)
   */
  getSupportedElements() {
    return ['*'];
  }
}