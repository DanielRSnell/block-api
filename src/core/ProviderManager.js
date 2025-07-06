/**
 * Provider Manager
 * Manages and coordinates all block conversion providers
 */
export class ProviderManager {
  constructor(converter = null) {
    this.providers = [];
    this.converter = converter;
  }

  /**
   * Register a provider
   * @param {Object} provider - Provider instance
   */
  registerProvider(provider) {
    if (!provider || typeof provider.canHandle !== 'function' || typeof provider.convert !== 'function') {
      throw new Error('Invalid provider: must implement canHandle() and convert() methods');
    }

    // Pass converter reference to provider
    if (this.converter) {
      provider.converter = this.converter;
    }

    this.providers.push(provider);
    
    // Sort providers by priority (highest first)
    this.providers.sort((a, b) => (b.getPriority?.() || 0) - (a.getPriority?.() || 0));
  }

  /**
   * Get the appropriate provider for an element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object|null} Provider or null if none found
   */
  getProviderForElement(element, options) {
    for (const provider of this.providers) {
      if (provider.canHandle(element, options)) {
        return provider;
      }
    }
    return null;
  }

  /**
   * Convert element using appropriate provider
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object|null} Block data or null if no provider found
   */
  async convertElement(element, options) {
    const provider = this.getProviderForElement(element, options);
    
    if (!provider) {
      console.warn(`No provider found for element: ${element.tagName}`);
      return null;
    }
    
    return await provider.convert(element, options);
  }

  /**
   * Get all registered providers
   * @returns {Array} Array of provider instances
   */
  getProviders() {
    return [...this.providers];
  }

  /**
   * Clear all registered providers
   */
  clearProviders() {
    this.providers = [];
  }

  /**
   * Get provider statistics
   * @returns {Object} Provider statistics
   */
  getStats() {
    return {
      totalProviders: this.providers.length,
      providers: this.providers.map(provider => ({
        name: provider.constructor.name,
        priority: provider.getPriority?.() || 0,
        supportedElements: provider.getSupportedElements?.() || []
      }))
    };
  }
}