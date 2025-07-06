import { BaseProvider } from './BaseProvider.js';

/**
 * Form Provider
 * Handles conversion of form elements and their children to HTML blocks
 * High priority provider that captures forms and converts the entire form structure to HTML
 */
export class FormProvider extends BaseProvider {
  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    
    // Handle form elements and common form-related containers
    if (tagName === 'form') {
      return true;
    }
    
    // Also handle divs/containers that contain form elements
    if (['div', 'section', 'fieldset'].includes(tagName)) {
      return this.containsFormElements(element);
    }
    
    return false;
  }

  /**
   * Check if element contains form elements
   * @param {Element} element - DOM element
   * @returns {boolean} Contains form elements
   */
  containsFormElements(element) {
    const formElements = [
      'input', 'textarea', 'select', 'button[type="submit"]', 
      'button[type="button"]', 'button[type="reset"]', 'fieldset', 'legend'
    ];
    
    for (const selector of formElements) {
      if (element.querySelector(selector)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Convert form element to HTML block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} HTML block containing the entire form
   */
  async convert(element, options) {
    // Get the complete HTML of the form and its contents
    const formHtml = this.getFormHtml(element);
    
    // Extract form attributes for metadata
    const formInfo = this.extractFormInfo(element);
    
    return {
      blockName: 'core/html',
      attrs: {
        blockId: this.generateBlockId(),
        metadata: {
          name: 'Form Block',
          formType: formInfo.type,
          method: formInfo.method,
          action: formInfo.action,
          containsFields: formInfo.fieldCount
        }
      },
      innerBlocks: [],
      innerHTML: formHtml,
      innerContent: [formHtml]
    };
  }

  /**
   * Get the complete HTML for the form
   * @param {Element} element - DOM element
   * @returns {string} Complete form HTML
   */
  getFormHtml(element) {
    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true);
    
    // Clean up any unwanted attributes if needed
    this.cleanFormElement(clonedElement);
    
    return clonedElement.outerHTML;
  }

  /**
   * Clean form element of any problematic attributes
   * @param {Element} element - DOM element to clean
   */
  cleanFormElement(element) {
    // Remove any data attributes that might cause issues
    const attributesToRemove = [];
    
    for (const attr of element.attributes) {
      // Remove temporary processing attributes
      if (attr.name.startsWith('data-block-') || attr.name.startsWith('data-convert-')) {
        attributesToRemove.push(attr.name);
      }
    }
    
    attributesToRemove.forEach(attrName => {
      element.removeAttribute(attrName);
    });
    
    // Recursively clean child elements
    for (const child of element.children) {
      this.cleanFormElement(child);
    }
  }

  /**
   * Extract form information for metadata
   * @param {Element} element - DOM element
   * @returns {Object} Form information
   */
  extractFormInfo(element) {
    const tagName = element.tagName.toLowerCase();
    
    let formElement = element;
    if (tagName !== 'form') {
      // If this is a container, try to find the actual form element
      formElement = element.querySelector('form') || element;
    }
    
    const info = {
      type: tagName === 'form' ? 'form' : 'form-container',
      method: formElement.getAttribute('method') || 'GET',
      action: formElement.getAttribute('action') || '',
      fieldCount: this.countFormFields(element)
    };
    
    return info;
  }

  /**
   * Count form fields in the element
   * @param {Element} element - DOM element
   * @returns {number} Number of form fields
   */
  countFormFields(element) {
    const fieldSelectors = [
      'input:not([type="hidden"])', 
      'textarea', 
      'select', 
      'button[type="submit"]',
      'button[type="button"]',
      'button[type="reset"]'
    ];
    
    let count = 0;
    fieldSelectors.forEach(selector => {
      count += element.querySelectorAll(selector).length;
    });
    
    return count;
  }

  /**
   * Get provider priority - very high to capture forms before other providers
   * @returns {number} Priority (higher than all other providers)
   */
  getPriority() {
    return 150; // Higher than MediaProvider (100)
  }

  /**
   * Get supported elements
   * @returns {Array} Supported element names
   */
  getSupportedElements() {
    return ['form', 'fieldset', 'div', 'section'];
  }
}