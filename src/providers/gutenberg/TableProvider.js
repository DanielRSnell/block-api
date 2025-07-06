import { BaseProvider } from '../BaseProvider.js';

/**
 * Gutenberg Table Provider
 * Converts table elements to core/table blocks
 */
export class TableProvider extends BaseProvider {
  /**
   * Check if this provider can handle the element
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {boolean} Can handle
   */
  canHandle(element, options) {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'table';
  }

  /**
   * Convert element to Gutenberg table block
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Table block
   */
  async convert(element, options) {
    const attrs = this.extractGutenbergAttributes(element, options);
    
    // Extract table structure
    const { head, body, foot } = this.extractTableStructure(element);
    
    if (head.length > 0) {
      attrs.head = head;
    }
    
    if (body.length > 0) {
      attrs.body = body;
    }
    
    if (foot.length > 0) {
      attrs.foot = foot;
    }
    
    // Determine if table has header
    attrs.hasFixedLayout = false; // Default for responsive tables
    
    // Add blockId
    attrs.blockId = this.generateBlockId();
    
    const tableHTML = this.buildTableHTML(head, body, foot);
    const innerHTML = this.buildGutenbergTableHTML(tableHTML, attrs);
    
    return {
      blockName: 'core/table',
      attrs,
      innerBlocks: [],
      innerHTML,
      innerContent: [innerHTML]
    };
  }

  /**
   * Extract table structure (head, body, foot)
   * @param {Element} element - Table element
   * @returns {Object} Table structure
   */
  extractTableStructure(element) {
    const head = [];
    const body = [];
    const foot = [];
    
    // Extract thead
    const thead = element.querySelector('thead');
    if (thead) {
      const rows = thead.querySelectorAll('tr');
      for (const row of rows) {
        head.push(this.extractTableRow(row));
      }
    }
    
    // Extract tbody or direct tr elements
    const tbody = element.querySelector('tbody');
    const bodyRows = tbody ? tbody.querySelectorAll('tr') : element.querySelectorAll(':scope > tr');
    for (const row of bodyRows) {
      body.push(this.extractTableRow(row));
    }
    
    // Extract tfoot
    const tfoot = element.querySelector('tfoot');
    if (tfoot) {
      const rows = tfoot.querySelectorAll('tr');
      for (const row of rows) {
        foot.push(this.extractTableRow(row));
      }
    }
    
    // If no thead but first row has th elements, move it to head
    if (head.length === 0 && body.length > 0) {
      const firstRow = body[0];
      if (firstRow && firstRow.cells && firstRow.cells.some(cell => cell.tag === 'th')) {
        head.push(body.shift());
      }
    }
    
    return { head, body, foot };
  }

  /**
   * Extract table row data
   * @param {Element} row - Table row element
   * @returns {Object} Row data
   */
  extractTableRow(row) {
    const cells = [];
    const cellElements = row.querySelectorAll('td, th');
    
    for (const cell of cellElements) {
      const cellData = {
        content: cell.innerHTML.trim(),
        tag: cell.tagName.toLowerCase()
      };
      
      // Handle colspan and rowspan
      const colspan = cell.getAttribute('colspan');
      const rowspan = cell.getAttribute('rowspan');
      
      if (colspan && parseInt(colspan) > 1) {
        cellData.colspan = parseInt(colspan);
      }
      
      if (rowspan && parseInt(rowspan) > 1) {
        cellData.rowspan = parseInt(rowspan);
      }
      
      cells.push(cellData);
    }
    
    return { cells };
  }

  /**
   * Build table HTML from structure
   * @param {Array} head - Header rows
   * @param {Array} body - Body rows
   * @param {Array} foot - Footer rows
   * @returns {string} Table HTML
   */
  buildTableHTML(head, body, foot) {
    let html = '';
    
    if (head.length > 0) {
      html += '<thead>';
      for (const row of head) {
        html += '<tr>';
        for (const cell of row.cells) {
          const tag = cell.tag || 'th';
          const attrs = [];
          if (cell.colspan) attrs.push(`colspan="${cell.colspan}"`);
          if (cell.rowspan) attrs.push(`rowspan="${cell.rowspan}"`);
          const attrString = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
          html += `<${tag}${attrString}>${cell.content}</${tag}>`;
        }
        html += '</tr>';
      }
      html += '</thead>';
    }
    
    if (body.length > 0) {
      html += '<tbody>';
      for (const row of body) {
        html += '<tr>';
        for (const cell of row.cells) {
          const tag = cell.tag || 'td';
          const attrs = [];
          if (cell.colspan) attrs.push(`colspan="${cell.colspan}"`);
          if (cell.rowspan) attrs.push(`rowspan="${cell.rowspan}"`);
          const attrString = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
          html += `<${tag}${attrString}>${cell.content}</${tag}>`;
        }
        html += '</tr>';
      }
      html += '</tbody>';
    }
    
    if (foot.length > 0) {
      html += '<tfoot>';
      for (const row of foot) {
        html += '<tr>';
        for (const cell of row.cells) {
          const tag = cell.tag || 'td';
          const attrs = [];
          if (cell.colspan) attrs.push(`colspan="${cell.colspan}"`);
          if (cell.rowspan) attrs.push(`rowspan="${cell.rowspan}"`);
          const attrString = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
          html += `<${tag}${attrString}>${cell.content}</${tag}>`;
        }
        html += '</tr>';
      }
      html += '</tfoot>';
    }
    
    return html;
  }

  /**
   * Extract attributes for Gutenberg blocks
   * @param {Element} element - DOM element
   * @param {Object} options - Conversion options
   * @returns {Object} Block attributes
   */
  extractGutenbergAttributes(element, options) {
    const attrs = {};
    
    // CSS classes
    if (element.hasAttribute('class')) {
      const classString = element.getAttribute('class');
      const classes = classString.split(' ')
        .map(cls => cls.trim())
        .filter(Boolean);
      if (classes.length > 0) {
        attrs.className = classes.join(' ');
      }
    }
    
    return attrs;
  }

  /**
   * Build complete Gutenberg table HTML with figure wrapper
   * @param {string} tableHTML - Inner table HTML
   * @param {Object} attrs - Block attributes
   * @returns {string} Complete table HTML
   */
  buildGutenbergTableHTML(tableHTML, attrs) {
    const figureClasses = ['wp-block-table'];
    
    // Add CSS classes to figure
    if (attrs.className) {
      figureClasses.push(attrs.className);
    }
    
    const figureClassAttr = ` class="${figureClasses.join(' ')}"`;
    
    return `<figure${figureClassAttr}><table>${tableHTML}</table></figure>`;
  }

  /**
   * Get provider priority
   * @returns {number} Priority (higher than generic providers)
   */
  getPriority() {
    return 70;
  }

  /**
   * Get supported elements
   * @returns {Array} Supported element names
   */
  getSupportedElements() {
    return ['table'];
  }
}