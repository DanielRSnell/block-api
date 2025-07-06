import { BaseProvider } from '../BaseProvider.js';
import { isCustomElement } from '../../utils/htmlUtils.js';
import { generateUniqueId } from '../../utils/blockUtils.js';

/**
 * Accordion Provider
 * Handles conversion of accordion custom elements to GenerateBlocks Pro accordion blocks
 */
export class AccordionProvider extends BaseProvider {
  /**
   * Accordion element mappings to GenerateBlocks Pro
   */
  static elementMappings = {
    'accordion': {
      blockType: 'generateblocks-pro/accordion',
      tagName: 'div'
    },
    'accordion-item': {
      blockType: 'generateblocks-pro/accordion-item',
      tagName: 'div'
    },
    'accordion-toggle': {
      blockType: 'generateblocks-pro/accordion-toggle',
      tagName: 'div'
    },
    'accordion-content': {
      blockType: 'generateblocks-pro/accordion-content',
      tagName: 'div'
    }
  };

  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    return AccordionProvider.elementMappings.hasOwnProperty(tagName);
  }

  /**
   * Convert element to accordion block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Accordion block
   */
  async convert(element, options) {
    const tagName = element.tagName.toLowerCase();
    const mapping = AccordionProvider.elementMappings[tagName];
    
    if (!mapping) {
      throw new Error(`Unsupported accordion element: ${tagName}`);
    }
    
    switch (mapping.blockType) {
      case 'generateblocks-pro/accordion':
        return this.convertAccordion(element, mapping, options);
      case 'generateblocks-pro/accordion-item':
        return this.convertAccordionItem(element, mapping, options);
      case 'generateblocks-pro/accordion-toggle':
        return this.convertAccordionToggle(element, mapping, options);
      case 'generateblocks-pro/accordion-content':
        return this.convertAccordionContent(element, mapping, options);
      default:
        throw new Error(`Unknown accordion block type: ${mapping.blockType}`);
    }
  }

  /**
   * Convert accordion root element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Accordion block
   */
  async convertAccordion(element, mapping, options) {
    const attrs = this.extractCustomAttributes(element, mapping.blockType, options);
    
    // Add tagName to attributes (required for proper block structure)
    attrs.tagName = mapping.tagName;
    
    // Process children
    const { innerBlocks, innerContent } = await this.processChildren(element, options);
    
    const tagName = mapping.tagName;
    const openingTag = this.buildOpeningTag(tagName, attrs, mapping.blockType);
    const closingTag = `</${tagName}>`;
    
    return {
      blockName: mapping.blockType,
      attrs,
      innerBlocks,
      innerHTML: openingTag + this.buildInnerHTML(innerContent) + closingTag,
      innerContent: [openingTag, ...innerContent, closingTag]
    };
  }

  /**
   * Convert accordion item element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Accordion item block
   */
  async convertAccordionItem(element, mapping, options) {
    const attrs = this.extractCustomAttributes(element, mapping.blockType, options);
    
    // Add tagName to attributes (required for proper block structure)
    attrs.tagName = mapping.tagName;
    
    // Process children
    const { innerBlocks, innerContent } = await this.processChildren(element, options);
    
    const tagName = mapping.tagName;
    const openingTag = this.buildOpeningTag(tagName, attrs, mapping.blockType);
    const closingTag = `</${tagName}>`;
    
    return {
      blockName: mapping.blockType,
      attrs,
      innerBlocks,
      innerHTML: openingTag + this.buildInnerHTML(innerContent) + closingTag,
      innerContent: [openingTag, ...innerContent, closingTag]
    };
  }

  /**
   * Convert accordion toggle element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Accordion toggle block
   */
  async convertAccordionToggle(element, mapping, options) {
    const attrs = this.extractCustomAttributes(element, mapping.blockType, options);
    
    // Add tagName to attributes (required for proper block structure)
    attrs.tagName = mapping.tagName;
    
    // Generate unique ID for toggle
    const toggleId = `gb-accordion-toggle-${attrs.uniqueId}`;
    
    if (!attrs.htmlAttributes) {
      attrs.htmlAttributes = {};
    }
    attrs.htmlAttributes.id = toggleId;
    
    // Add className for accordion toggle (GenerateBlocks Pro expects this)
    attrs.className = 'gb-accordion__toggle';
    
    // Get text content and wrap it in a text block (like PHP version)
    const textContent = element.textContent?.trim() || '';
    
    // Create inner text block for the toggle text
    const textUniqueId = generateUniqueId();
    const textBlock = {
      blockName: 'generateblocks/text',
      attrs: {
        uniqueId: textUniqueId,
        tagName: 'span',
        blockId: `block-${textUniqueId.substring(0, 8)}-${this.generateShortId()}`,
        metadata: {
          name: 'Span Text'
        },
        className: 'gb-text'
      },
      innerBlocks: [],
      innerHTML: `<span class="gb-text gb-text">${textContent}</span>`,
      innerContent: [`<span class="gb-text gb-text">${textContent}</span>`]
    };
    
    const tagName = mapping.tagName;
    const openingTag = this.buildOpeningTag(tagName, attrs, mapping.blockType);
    const closingTag = `</${tagName}>`;
    
    return {
      blockName: mapping.blockType,
      attrs,
      innerBlocks: [textBlock],
      innerHTML: openingTag + textBlock.innerHTML + closingTag,
      innerContent: [openingTag, null, closingTag]
    };
  }

  /**
   * Convert accordion content element
   * @param {Element} element - DOM element
   * @param {Object} mapping - Element mapping
   * @param {Object} options - Conversion options
   * @returns {Object} Accordion content block
   */
  async convertAccordionContent(element, mapping, options) {
    const attrs = this.extractCustomAttributes(element, mapping.blockType, options);
    
    // Add tagName to attributes (required for proper block structure)
    attrs.tagName = mapping.tagName;
    
    // Generate unique ID for content
    const contentId = `gb-accordion-content-${attrs.uniqueId}`;
    
    if (!attrs.htmlAttributes) {
      attrs.htmlAttributes = {};
    }
    attrs.htmlAttributes.id = contentId;
    
    // Process children
    const { innerBlocks, innerContent } = await this.processChildren(element, options);
    
    const tagName = mapping.tagName;
    const openingTag = this.buildOpeningTag(tagName, attrs, mapping.blockType);
    const closingTag = `</${tagName}>`;
    
    return {
      blockName: mapping.blockType,
      attrs,
      innerBlocks,
      innerHTML: openingTag + this.buildInnerHTML(innerContent) + closingTag,
      innerContent: [openingTag, ...innerContent, closingTag]
    };
  }

  /**
   * Extract attributes for custom elements, filtering out accordion-specific attributes
   * @param {Element} element - DOM element
   * @param {string} blockType - Block type
   * @param {Object} options - Conversion options
   * @returns {Object} Block attributes
   */
  extractCustomAttributes(element, blockType, options) {
    const attrs = this.extractAttributes(element, blockType, options);
    
    // Remove custom element specific attributes from htmlAttributes
    const customAttrs = ['tag'];
    
    if (attrs.htmlAttributes) {
      for (const customAttr of customAttrs) {
        delete attrs.htmlAttributes[customAttr];
      }
      
      // Remove htmlAttributes if empty
      if (Object.keys(attrs.htmlAttributes).length === 0) {
        delete attrs.htmlAttributes;
      }
    }
    
    // Handle blocks that shouldn't have className
    const blocksWithoutClassName = [
      'generateblocks-pro/accordion',
      'generateblocks-pro/accordion-item',
      'generateblocks-pro/accordion-content'
    ];
    
    if (blocksWithoutClassName.includes(blockType)) {
      delete attrs.className;
    }
    
    return attrs;
  }

  /**
   * Get provider priority
   * @returns {number} Priority (high for custom elements)
   */
  getPriority() {
    return 75;
  }

  /**
   * Process child elements
   * @param {Element} element - Parent DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Inner blocks and content
   */
  async processChildren(element, options) {
    const innerBlocks = [];
    const innerContent = [];
    
    for (const child of element.childNodes) {
      if (child.nodeType === 1) { // Element node
        // Convert child element using provider system
        const childBlock = await this.convertChildElement(child, options);
        if (childBlock) {
          innerBlocks.push(childBlock);
          innerContent.push(null); // Placeholder for child block
        }
      } else if (child.nodeType === 3) { // Text node
        const text = child.textContent?.trim();
        if (text) {
          // For accordion elements, preserve text content
          innerContent.push(text);
        }
      }
    }
    
    return { innerBlocks, innerContent };
  }

  /**
   * Convert child element using provider manager
   * @param {Element} element - Child element
   * @param {Object} options - Conversion options
   * @returns {Object|null} Block or null
   */
  async convertChildElement(element, options) {
    // Use the provider manager from the converter instance
    if (this.converter && this.converter.providerManager) {
      return await this.converter.providerManager.convertElement(element, options);
    }
    
    // Fallback if no provider manager available
    return null;
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
   * Generate short helper ID
   * @returns {string} Short hex ID
   */
  generateShortId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Get supported elements
   * @returns {Array} Supported custom element names
   */
  getSupportedElements() {
    return Object.keys(AccordionProvider.elementMappings);
  }
}