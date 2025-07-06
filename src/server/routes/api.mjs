import express from 'express';
import { HtmlToBlocksConverter } from '../../core/HtmlToBlocksConverter.js';
import { BlocksToHtmlConverter } from '../../core/BlocksToHtmlConverter.js';
import { swaggerDocument } from '../config/swagger.mjs';

const router = express.Router();

// Convert HTML to blocks
router.post('/convert', async (req, res) => {
  const { html, provider = 'greenshift', options = {} } = req.body;
  
  if (!html) {
    return res.status(400).json({ 
      success: false, 
      error: 'HTML content is required' 
    });
  }

  try {
    // Initialize converter with the specified provider
    const converter = new HtmlToBlocksConverter(provider);
    
    // Convert HTML to blocks
    const result = await converter.convertHtmlToBlocks(html, options);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Return the converted block markup as plain text (backwards compatibility)
    res.set('Content-Type', 'text/plain');
    res.send(result.markup);
    
  } catch (error) {
    console.error('Conversion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal conversion error'
    });
  }
});

// Convert blocks to HTML
router.post('/blocks-to-html', async (req, res) => {
  const { blockMarkup } = req.body;
  
  if (!blockMarkup) {
    return res.status(400).json({ 
      success: false, 
      error: 'Block markup is required' 
    });
  }

  try {
    // Initialize blocks-to-HTML converter
    const converter = new BlocksToHtmlConverter();
    
    // Convert blocks to HTML
    const result = converter.convertToHtml(blockMarkup);
    
    // Return the converted HTML as plain text
    res.set('Content-Type', 'text/plain');
    res.send(result);
    
  } catch (error) {
    console.error('Blocks-to-HTML conversion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal conversion error'
    });
  }
});

// Convert HTML to blocks with full metadata
router.post('/convert-detailed', async (req, res) => {
  const { html, provider = 'greenshift', options = {} } = req.body;
  
  if (!html) {
    return res.status(400).json({ 
      success: false, 
      error: 'HTML content is required' 
    });
  }

  try {
    // Initialize converter with the specified provider
    const converter = new HtmlToBlocksConverter(provider);
    
    // Convert HTML to blocks
    const result = await converter.convertHtmlToBlocks(html, options);
    
    // Return the full conversion result as JSON
    res.json(result);
    
  } catch (error) {
    console.error('Detailed conversion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal conversion error'
    });
  }
});

// Convert blocks to HTML with analysis
router.post('/blocks-to-html-detailed', async (req, res) => {
  const { blockMarkup } = req.body;
  
  if (!blockMarkup) {
    return res.status(400).json({ 
      success: false, 
      error: 'Block markup is required' 
    });
  }

  try {
    // Initialize blocks-to-HTML converter
    const converter = new BlocksToHtmlConverter();
    
    // Convert blocks to HTML with analysis
    const result = await converter.convertWithAnalysis(blockMarkup);
    
    // Return the full conversion result as JSON
    res.json(result);
    
  } catch (error) {
    console.error('Detailed blocks-to-HTML conversion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal conversion error'
    });
  }
});

// Validate HTML
router.post('/validate', async (req, res) => {
  const { html } = req.body;
  
  if (!html) {
    return res.status(400).json({ 
      success: false, 
      error: 'HTML content is required' 
    });
  }

  try {
    // Use the converter to validate HTML structure
    const converter = new HtmlToBlocksConverter('greenshift');
    const result = await converter.convertHtmlToBlocks(html, { 
      preserveClasses: true,
      preserveIds: true,
      generateUniqueIds: false
    });
    
    if (result.success) {
      res.json({
        isValid: true,
        errors: [],
        warnings: [],
        convertibleElements: result.conversionStats?.elementTypes || [],
        unsupportedElements: [],
        totalElements: result.conversionStats?.totalBlocks || 0,
        analysis: result.conversionStats
      });
    } else {
      res.json({
        isValid: false,
        errors: [result.error],
        warnings: [],
        convertibleElements: [],
        unsupportedElements: []
      });
    }
    
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal validation error'
    });
  }
});

// Get supported elements
router.get('/elements', (req, res) => {
  res.json({
    supportedProviders: ['greenshift', 'gutenberg', 'generateblocks', 'generate-pro'],
    supportedElements: {
      div: 'Container element',
      h1: 'Heading level 1',
      h2: 'Heading level 2', 
      h3: 'Heading level 3',
      p: 'Paragraph',
      span: 'Inline text',
      img: 'Image',
      a: 'Link'
    },
    conversionOptions: {
      preserveClasses: 'Keep CSS classes from original HTML',
      preserveIds: 'Keep element IDs from original HTML',
      generateUniqueIds: 'Generate unique IDs for block elements'
    }
  });
});

// Get Swagger JSON specification
router.get('/swagger', (req, res) => {
  res.json(swaggerDocument);
});

export default router;