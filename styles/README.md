# Block Convert Styles

This directory contains the Tailwind CSS 4 setup for the Block Convert API frontend.

## Files

- `main.css` - Source Tailwind CSS file with custom components
- `output-main.css` - Generated CSS file served to the browser
- `tailwindcss` (in project root) - Tailwind CLI binary

## Development Workflow

### Building CSS
```bash
# Build once
npm run css:build

# Watch for changes during development  
npm run css:watch

# Development mode (runs server + CSS watch)
npm run dev
```

## Architecture

The styles use Tailwind CSS 4 with:

- **Utility-first approach** for rapid UI development
- **Custom components** for reusable UI patterns
- **Responsive design** with mobile-first breakpoints
- **Modern CSS features** like CSS custom properties and logical properties

## Custom Components

The following components are defined in `main.css`:

- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline` - Button variants
- `.card`, `.card-header`, `.card-content` - Card layouts
- `.form-group`, `.label`, `.input`, `.textarea` - Form elements
- `.code-block` - Code syntax highlighting blocks
- `.hero` - Landing page hero sections

## Tailwind Config

The `tailwind.config.js` file:
- Scans template files in `src/server/views/`
- Defines custom color palette
- Extends default theme with project-specific values

## Production

For production builds, CSS is minified automatically with `npm run css:build`.
The output file is served at `/styles/output-main.css`.