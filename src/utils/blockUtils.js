import { v4 as uuidv4 } from 'uuid';

/**
 * Generate unique ID for blocks
 * @returns {string} Unique ID
 */
export function generateUniqueId() {
  return uuidv4();
}

/**
 * Create block structure with proper WordPress format
 * @param {string} blockName - Block name (e.g., 'generateblocks/text')
 * @param {Object} attrs - Block attributes
 * @param {Array} innerBlocks - Inner blocks
 * @param {Array} innerContent - Inner content array
 * @returns {Object} Block structure
 */
export function createBlock(blockName, attrs = {}, innerBlocks = [], innerContent = []) {
  return {
    blockName,
    attrs,
    innerBlocks,
    innerHTML: '',
    innerContent
  };
}

/**
 * Create text block
 * @param {string} content - Text content
 * @param {string} tagName - HTML tag name
 * @param {Object} options - Additional options
 * @returns {Object} Text block
 */
export function createTextBlock(content, tagName = 'p', options = {}) {
  const attrs = {
    uniqueId: generateUniqueId(),
    tagName,
    content,
    className: 'gb-text',
    ...options.attrs
  };

  const innerHTML = `<${tagName} class="gb-text">${content}</${tagName}>`;

  return {
    blockName: 'generateblocks/text',
    attrs,
    innerBlocks: [],
    innerHTML,
    innerContent: [innerHTML]
  };
}

/**
 * Create element block
 * @param {string} tagName - HTML tag name
 * @param {Object} options - Block options
 * @returns {Object} Element block
 */
export function createElementBlock(tagName, options = {}) {
  const attrs = {
    uniqueId: generateUniqueId(),
    tagName,
    className: 'gb-element',
    ...options.attrs
  };

  const openingTag = `<${tagName} class="gb-element">`;
  const closingTag = `</${tagName}>`;

  return {
    blockName: 'generateblocks/element',
    attrs,
    innerBlocks: options.innerBlocks || [],
    innerHTML: openingTag + closingTag,
    innerContent: [openingTag, ...(options.innerContent || []), closingTag]
  };
}

/**
 * Create media block
 * @param {Object} mediaAttrs - Media attributes (src, alt, etc.)
 * @param {Object} options - Additional options
 * @returns {Object} Media block
 */
export function createMediaBlock(mediaAttrs, options = {}) {
  const attrs = {
    uniqueId: generateUniqueId(),
    tagName: 'img',
    className: 'gb-media',
    htmlAttributes: mediaAttrs,
    ...options.attrs
  };

  return {
    blockName: 'generateblocks/media',
    attrs,
    innerBlocks: [],
    innerHTML: '',
    innerContent: []
  };
}

/**
 * Serialize block to WordPress block markup
 * @param {Object} block - Block data
 * @returns {string} Serialized block markup
 */
export function serializeBlock(block) {
  const { blockName, attrs, innerBlocks, innerContent } = block;
  
  // Build attribute string
  const attrString = Object.keys(attrs).length > 0 
    ? ' ' + JSON.stringify(attrs, null, 0)
    : '';
  
  // Handle self-closing blocks
  if (!innerBlocks?.length && !innerContent?.length) {
    return `<!-- wp:${blockName}${attrString} /-->`;
  }
  
  // Build content - each block comment on its own line
  let content = '';
  let childIndex = 0;
  
  if (innerContent) {
    for (let i = 0; i < innerContent.length; i++) {
      const item = innerContent[i];
      if (item === null) {
        // Placeholder for child block - each block on new line
        if (innerBlocks?.[childIndex]) {
          content += '\n' + serializeBlock(innerBlocks[childIndex]);
          childIndex++;
        }
      } else {
        content += item;
      }
    }
  }
  
  return `<!-- wp:${blockName}${attrString} -->\n${content}\n<!-- /wp:${blockName} -->`;
}

/**
 * Validate block structure
 * @param {Object} block - Block to validate
 * @returns {boolean} Whether block is valid
 */
export function validateBlock(block) {
  if (!block || typeof block !== 'object') {
    return false;
  }
  
  // Required properties
  const required = ['blockName', 'attrs', 'innerBlocks', 'innerContent'];
  for (const prop of required) {
    if (!(prop in block)) {
      return false;
    }
  }
  
  // Type checks
  if (typeof block.blockName !== 'string') return false;
  if (typeof block.attrs !== 'object') return false;
  if (!Array.isArray(block.innerBlocks)) return false;
  if (!Array.isArray(block.innerContent)) return false;
  
  return true;
}

/**
 * Get block statistics
 * @param {Array} blocks - Array of blocks
 * @returns {Object} Block statistics
 */
export function getBlockStats(blocks) {
  const stats = {
    totalBlocks: 0,
    blockTypes: {},
    generateblocksBlocks: 0,
    coreBlocks: 0,
    customBlocks: 0
  };

  function countBlocks(blockArray) {
    for (const block of blockArray) {
      stats.totalBlocks++;
      
      const blockName = block.blockName;
      stats.blockTypes[blockName] = (stats.blockTypes[blockName] || 0) + 1;
      
      if (blockName.startsWith('generateblocks/') || blockName.startsWith('generateblocks-pro/')) {
        stats.generateblocksBlocks++;
      } else if (blockName.startsWith('core/')) {
        stats.coreBlocks++;
      } else {
        stats.customBlocks++;
      }
      
      if (block.innerBlocks?.length) {
        countBlocks(block.innerBlocks);
      }
    }
  }

  countBlocks(blocks);
  return stats;
}