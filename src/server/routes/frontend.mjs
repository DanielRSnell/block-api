import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple template engine - manually combine templates for now
async function renderPage(pageFile, data = {}) {
  try {
    const viewsPath = path.join(__dirname, '../views');
    const layoutPath = path.join(viewsPath, 'layouts/base.twig');
    const pagePath = path.join(viewsPath, 'pages', pageFile);
    
    // Read both files
    const [layoutContent, pageContent] = await Promise.all([
      fs.readFile(layoutPath, 'utf8'),
      fs.readFile(pagePath, 'utf8')
    ]);
    
    // Extract content between blocks in page template
    const titleMatch = pageContent.match(/{% block title %}(.+?){% endblock %}/s);
    const contentMatch = pageContent.match(/{% block content %}([\s\S]+?){% endblock %}/s);
    const stylesMatch = pageContent.match(/{% block styles %}([\s\S]+?){% endblock %}/s);
    const scriptsMatch = pageContent.match(/{% block scripts %}([\s\S]+?){% endblock %}/s);
    
    let html = layoutContent;
    
    // Replace blocks in layout
    html = html.replace(/{% block title %}.*?{% endblock %}/s, titleMatch ? titleMatch[1] : 'Block Convert API');
    html = html.replace(/{% block content %}.*?{% endblock %}/s, contentMatch ? contentMatch[1] : '');
    html = html.replace(/{% block styles %}.*?{% endblock %}/s, stylesMatch ? stylesMatch[1] : '');
    html = html.replace(/{% block scripts %}.*?{% endblock %}/s, scriptsMatch ? scriptsMatch[1] : '');
    
    return html;
  } catch (error) {
    console.error('Template render error:', error);
    throw error;
  }
}

// Landing page
router.get('/', async (req, res) => {
  try {
    const html = await renderPage('home.twig');
    res.send(html);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).send('Error rendering page');
  }
});

// Interactive tool page
router.get('/tool', async (req, res) => {
  try {
    const html = await renderPage('tool.twig');
    res.send(html);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).send('Error rendering page');
  }
});

export default router;