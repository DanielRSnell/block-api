/**
 * Convert WordPress block markup back to clean HTML
 * Specifically handles Greenshift blocks
 */
export class BlocksToHtmlConverter {
  constructor() {
    this.blockRegex = /<!-- wp:([^{}\s]+)(?:\s+({[^}]*}))?\s*(?:-->|\/-->)/g;
    this.closingBlockRegex = /<!-- \/wp:([^{}\s]+) -->/g;
  }

  /**
   * Convert block markup to clean HTML
   * @param {string} blockMarkup - WordPress block markup
   * @returns {string} Clean HTML
   */
  convertToHtml(blockMarkup) {
    try {
      // Remove all block comments and return clean HTML
      let html = blockMarkup;
      
      // Remove opening block comments (including multiline ones)
      html = html.replace(/<!-- wp:[^]*?-->/g, '');
      
      // Remove closing block comments
      html = html.replace(/<!-- \/wp:[^]*?-->/g, '');
      
      // Clean up whitespace
      html = html.replace(/\n\s*\n/g, '\n');
      html = html.trim();
      
      // Format the HTML nicely
      html = this.formatHtml(html);
      
      return html;
    } catch (error) {
      console.error('Error converting blocks to HTML:', error);
      return blockMarkup;
    }
  }

  /**
   * Format HTML with proper indentation
   * @param {string} html - Raw HTML string
   * @returns {string} Formatted HTML
   */
  formatHtml(html) {
    let formatted = '';
    let indent = 0;
    const indentSize = 2;
    
    // Split by tags
    const tokens = html.split(/(<[^>]*>)/);
    
    for (let token of tokens) {
      if (!token.trim()) continue;
      
      if (token.startsWith('</')) {
        // Closing tag
        indent -= indentSize;
        formatted += ' '.repeat(Math.max(0, indent)) + token + '\n';
      } else if (token.startsWith('<') && !token.endsWith('/>')) {
        // Opening tag
        formatted += ' '.repeat(indent) + token + '\n';
        if (!this.isSelfClosing(token)) {
          indent += indentSize;
        }
      } else if (token.startsWith('<') && token.endsWith('/>')) {
        // Self-closing tag
        formatted += ' '.repeat(indent) + token + '\n';
      } else {
        // Text content
        const trimmedToken = token.trim();
        if (trimmedToken) {
          formatted += ' '.repeat(indent) + trimmedToken + '\n';
        }
      }
    }
    
    return formatted.trim();
  }

  /**
   * Check if a tag is self-closing
   * @param {string} tag - HTML tag
   * @returns {boolean} Whether the tag is self-closing
   */
  isSelfClosing(tag) {
    const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    const tagName = tag.match(/<(\w+)/);
    return tagName && selfClosingTags.includes(tagName[1].toLowerCase());
  }

  /**
   * Parse block attributes from JSON string
   * @param {string} attributesJson - JSON string of block attributes
   * @returns {Object} Parsed attributes
   */
  parseBlockAttributes(attributesJson) {
    try {
      return JSON.parse(attributesJson || '{}');
    } catch (error) {
      console.warn('Failed to parse block attributes:', attributesJson);
      return {};
    }
  }

  /**
   * Extract all blocks from markup
   * @param {string} blockMarkup - Block markup
   * @returns {Array} Array of block information
   */
  extractBlocks(blockMarkup) {
    const blocks = [];
    let match;
    
    // Reset regex
    this.blockRegex.lastIndex = 0;
    
    while ((match = this.blockRegex.exec(blockMarkup)) !== null) {
      const blockName = match[1];
      const attributes = this.parseBlockAttributes(match[2]);
      
      blocks.push({
        name: blockName,
        attributes,
        fullMatch: match[0]
      });
    }
    
    return blocks;
  }

  /**
   * Convert specific block markup to HTML with analysis
   * @param {string} blockMarkup - Block markup
   * @returns {Object} Conversion result with analysis
   */
  convertWithAnalysis(blockMarkup) {
    const blocks = this.extractBlocks(blockMarkup);
    const html = this.convertToHtml(blockMarkup);
    
    const analysis = {
      totalBlocks: blocks.length,
      blockTypes: {},
      greenshiftBlocks: 0,
      elements: []
    };

    blocks.forEach(block => {
      analysis.blockTypes[block.name] = (analysis.blockTypes[block.name] || 0) + 1;
      
      if (block.name.startsWith('greenshift-blocks/')) {
        analysis.greenshiftBlocks++;
      }
      
      if (block.attributes.tag) {
        analysis.elements.push(block.attributes.tag);
      }
    });

    return {
      html,
      analysis,
      originalBlocks: blocks.length,
      cleanHtml: html
    };
  }
}