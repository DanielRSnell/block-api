# Greenshift Provider Concept Documentation

## Overview

The Greenshift provider system converts HTML elements into Greenshift blocks, primarily utilizing the powerful **GreenLight Element** (`greenshift-blocks/element`) as the universal building block that can become any HTML element with advanced capabilities.

## Core Philosophy

### The GreenLight Element Approach

Instead of creating dozens of specialized providers, the Greenshift system leverages the **"One Block to Rule Them All"** philosophy:

- **Single Universal Block**: `greenshift-blocks/element` can become any HTML element
- **Attribute-Driven Configuration**: Element type, styling, and behavior controlled via attributes
- **Minimal Overhead**: One block type means simpler code and consistent behavior
- **Maximum Flexibility**: Users aren't limited to pre-defined block types

## Provider Architecture

### Provider Priority Strategy

```javascript
// Proposed priority levels for Greenshift providers
ElementProvider: 80    // High priority - universal converter
ContainerProvider: 75  // Specialized container handling
ButtonProvider: 70     // Specialized button handling
HeadingProvider: 65    // Specialized heading handling
TextProvider: 60       // Specialized text handling
ImageProvider: 55      // Specialized image handling
```

### Provider Structure

```
src/providers/greenshift/
├── ElementProvider.js      // Universal HTML element converter
├── ContainerProvider.js    // Container-specific optimizations
├── ButtonProvider.js       // Button-specific optimizations
├── HeadingProvider.js      // Heading-specific optimizations
├── TextProvider.js         // Text-specific optimizations
└── ImageProvider.js        // Image-specific optimizations
```

## HTML to Block Conversion Process

### Step 1: Element Analysis

For each HTML element, the system analyzes:

```javascript
const elementData = {
  tagName: 'div',                    // HTML tag name
  attributes: {                      // HTML attributes
    id: 'hero-section',
    class: 'hero bg-primary',
    'data-animation': 'fadeIn'
  },
  textContent: 'Welcome to our site', // Text content
  children: [...],                   // Child elements
  styles: {                          // Inline styles
    backgroundColor: '#ff0000',
    padding: '20px'
  }
};
```

### Step 2: Attribute Mapping

HTML attributes and CSS classes are mapped to Greenshift block attributes:

```javascript
// HTML Input
<div class="hero bg-primary text-center" id="hero-section" data-animation="fadeIn">
  <h1>Welcome</h1>
</div>

// Greenshift Block Output
{
  blockName: 'greenshift-blocks/element',
  attrs: {
    tagName: 'div',                    // Element type
    uniqueId: 'hero-section',          // From HTML id
    globalClasses: 'hero bg-primary text-center', // CSS classes
    customAttributes: {                // Custom attributes
      'data-animation': 'fadeIn'
    },
    // Responsive styling arrays [desktop, tablet, mobile_landscape, mobile_portrait]
    padding: ['20px', '15px', '10px', '10px'],
    textAlign: ['center', 'center', 'center', 'center']
  }
}
```

### Step 3: CSS Class Parsing

CSS classes are analyzed and converted to Greenshift styling attributes:

```javascript
const classMapping = {
  // Layout classes
  'container': { maxWidth: ['1200px', '100%', '100%', '100%'] },
  'text-center': { textAlign: ['center', 'center', 'center', 'center'] },
  'text-left': { textAlign: ['left', 'left', 'left', 'left'] },
  'text-right': { textAlign: ['right', 'right', 'right', 'right'] },
  
  // Spacing classes
  'p-1': { padding: ['0.25rem', '0.25rem', '0.25rem', '0.25rem'] },
  'p-2': { padding: ['0.5rem', '0.5rem', '0.5rem', '0.5rem'] },
  'p-3': { padding: ['1rem', '1rem', '1rem', '1rem'] },
  'p-4': { padding: ['1.5rem', '1.5rem', '1.5rem', '1.5rem'] },
  'p-5': { padding: ['3rem', '3rem', '3rem', '3rem'] },
  
  // Margin classes
  'm-1': { margin: ['0.25rem', '0.25rem', '0.25rem', '0.25rem'] },
  'm-2': { margin: ['0.5rem', '0.5rem', '0.5rem', '0.5rem'] },
  'm-3': { margin: ['1rem', '1rem', '1rem', '1rem'] },
  'm-4': { margin: ['1.5rem', '1.5rem', '1.5rem', '1.5rem'] },
  'm-5': { margin: ['3rem', '3rem', '3rem', '3rem'] },
  
  // Display classes
  'hidden': { display: ['none', 'none', 'none', 'none'] },
  'block': { display: ['block', 'block', 'block', 'block'] },
  'inline': { display: ['inline', 'inline', 'inline', 'inline'] },
  'flex': { display: ['flex', 'flex', 'flex', 'flex'] },
  'grid': { display: ['grid', 'grid', 'grid', 'grid'] },
  
  // Color classes
  'bg-primary': { backgroundColor: ['var(--primary-color)', 'var(--primary-color)', 'var(--primary-color)', 'var(--primary-color)'] },
  'bg-secondary': { backgroundColor: ['var(--secondary-color)', 'var(--secondary-color)', 'var(--secondary-color)', 'var(--secondary-color)'] },
  'text-primary': { color: ['var(--primary-color)', 'var(--primary-color)', 'var(--primary-color)', 'var(--primary-color)'] },
  'text-secondary': { color: ['var(--secondary-color)', 'var(--secondary-color)', 'var(--secondary-color)', 'var(--secondary-color)'] },
  
  // Flexbox classes
  'justify-center': { justifyContent: ['center', 'center', 'center', 'center'] },
  'justify-between': { justifyContent: ['space-between', 'space-between', 'space-between', 'space-between'] },
  'items-center': { alignItems: ['center', 'center', 'center', 'center'] },
  'items-start': { alignItems: ['flex-start', 'flex-start', 'flex-start', 'flex-start'] },
  'items-end': { alignItems: ['flex-end', 'flex-end', 'flex-end', 'flex-end'] },
  
  // Width classes
  'w-full': { width: ['100%', '100%', '100%', '100%'] },
  'w-1/2': { width: ['50%', '50%', '100%', '100%'] },
  'w-1/3': { width: ['33.333%', '33.333%', '100%', '100%'] },
  'w-1/4': { width: ['25%', '25%', '50%', '100%'] },
  
  // Height classes
  'h-full': { height: ['100%', '100%', '100%', '100%'] },
  'h-screen': { height: ['100vh', '100vh', '100vh', '100vh'] },
  
  // Border classes
  'border': { border: ['1px solid #e5e7eb', '1px solid #e5e7eb', '1px solid #e5e7eb', '1px solid #e5e7eb'] },
  'border-2': { border: ['2px solid #e5e7eb', '2px solid #e5e7eb', '2px solid #e5e7eb', '2px solid #e5e7eb'] },
  'rounded': { borderRadius: ['0.25rem', '0.25rem', '0.25rem', '0.25rem'] },
  'rounded-lg': { borderRadius: ['0.5rem', '0.5rem', '0.5rem', '0.5rem'] },
  'rounded-xl': { borderRadius: ['0.75rem', '0.75rem', '0.75rem', '0.75rem'] },
  'rounded-full': { borderRadius: ['9999px', '9999px', '9999px', '9999px'] },
  
  // Shadow classes
  'shadow': { boxShadow: ['0 1px 3px 0 rgb(0 0 0 / 0.1)', '0 1px 3px 0 rgb(0 0 0 / 0.1)', '0 1px 3px 0 rgb(0 0 0 / 0.1)', '0 1px 3px 0 rgb(0 0 0 / 0.1)'] },
  'shadow-md': { boxShadow: ['0 4px 6px -1px rgb(0 0 0 / 0.1)', '0 4px 6px -1px rgb(0 0 0 / 0.1)', '0 4px 6px -1px rgb(0 0 0 / 0.1)', '0 4px 6px -1px rgb(0 0 0 / 0.1)'] },
  'shadow-lg': { boxShadow: ['0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 10px 15px -3px rgb(0 0 0 / 0.1)'] },
  
  // Typography classes
  'text-xs': { fontSize: ['0.75rem', '0.75rem', '0.75rem', '0.75rem'] },
  'text-sm': { fontSize: ['0.875rem', '0.875rem', '0.875rem', '0.875rem'] },
  'text-base': { fontSize: ['1rem', '1rem', '1rem', '1rem'] },
  'text-lg': { fontSize: ['1.125rem', '1.125rem', '1.125rem', '1.125rem'] },
  'text-xl': { fontSize: ['1.25rem', '1.25rem', '1.25rem', '1.25rem'] },
  'text-2xl': { fontSize: ['1.5rem', '1.5rem', '1.5rem', '1.5rem'] },
  'text-3xl': { fontSize: ['1.875rem', '1.875rem', '1.875rem', '1.875rem'] },
  'text-4xl': { fontSize: ['2.25rem', '2.25rem', '2.25rem', '2.25rem'] },
  'text-5xl': { fontSize: ['3rem', '3rem', '3rem', '3rem'] },
  'text-6xl': { fontSize: ['3.75rem', '3.75rem', '3.75rem', '3.75rem'] },
  'font-thin': { fontWeight: ['100', '100', '100', '100'] },
  'font-light': { fontWeight: ['300', '300', '300', '300'] },
  'font-normal': { fontWeight: ['400', '400', '400', '400'] },
  'font-medium': { fontWeight: ['500', '500', '500', '500'] },
  'font-semibold': { fontWeight: ['600', '600', '600', '600'] },
  'font-bold': { fontWeight: ['700', '700', '700', '700'] },
  'font-extrabold': { fontWeight: ['800', '800', '800', '800'] },
  'font-black': { fontWeight: ['900', '900', '900', '900'] },
};
```

### Step 4: Inline Style Parsing

Inline CSS styles are converted to Greenshift responsive arrays:

```javascript
// HTML Input
<div style="background-color: #ff0000; padding: 20px; font-size: 16px;">

// Greenshift Output
{
  backgroundColor: ['#ff0000', '#ff0000', '#ff0000', '#ff0000'],
  padding: ['20px', '20px', '20px', '20px'],
  fontSize: ['16px', '16px', '16px', '16px']
}
```

### Step 5: Special Attribute Handling

Certain HTML attributes receive special treatment:

```javascript
const attributeMapping = {
  // ID becomes uniqueId
  'id': 'uniqueId',
  
  // Class becomes globalClasses
  'class': 'globalClasses',
  
  // Data attributes preserved
  'data-*': 'customAttributes',
  
  // ARIA attributes preserved
  'aria-*': 'customAttributes',
  
  // Special button attributes
  'href': 'url',          // For links
  'target': 'linkTarget', // For links
  'rel': 'relNofollow',   // For links
  
  // Special image attributes
  'src': 'url',           // For images
  'alt': 'alt',           // For images
  'width': 'width',       // For images
  'height': 'height',     // For images
  
  // Special form attributes
  'type': 'inputType',    // For inputs
  'name': 'inputName',    // For inputs
  'value': 'inputValue',  // For inputs
  'placeholder': 'placeholder', // For inputs
};
```

## Advanced Features Integration

### Animation and Interaction

Data attributes are analyzed for animation and interaction capabilities:

```javascript
// HTML Input
<div data-animation="fadeIn" data-trigger="scroll" data-delay="0.5s">

// Greenshift Output
{
  animation: {
    type: 'fadeIn',
    trigger: 'scroll',
    delay: '0.5s'
  }
}
```

### Dynamic Content

Special attributes indicate dynamic content requirements:

```javascript
// HTML Input
<div data-api-url="/api/posts" data-template="post-card">

// Greenshift Output
{
  type: 'repeater',
  apiUrl: '/api/posts',
  template: 'post-card',
  dynamicSource: 'api'
}
```

### Responsive Handling

CSS classes with responsive prefixes are converted to responsive arrays:

```javascript
// HTML Input
<div class="p-4 md:p-6 lg:p-8">

// Greenshift Output
{
  padding: ['1.5rem', '1.5rem', '2rem', '2rem'] // lg:p-8, md:p-6, p-4, p-4
}
```

## Provider Implementation Strategy

### Primary ElementProvider

The main `ElementProvider` handles 90% of conversions:

```javascript
class ElementProvider extends BaseProvider {
  canHandle(element, options) {
    return true; // Universal handler
  }

  async convert(element, options) {
    const attrs = this.parseElement(element);
    
    return {
      blockName: 'greenshift-blocks/element',
      attrs: {
        tagName: element.tagName.toLowerCase(),
        uniqueId: this.generateUniqueId(),
        ...attrs
      },
      innerBlocks: await this.processChildren(element, options),
      innerHTML: this.generateInnerHTML(element, attrs),
      innerContent: this.generateInnerContent(element, attrs)
    };
  }

  getPriority() {
    return 80; // High priority
  }
}
```

### Specialized Providers

Specialized providers handle specific optimizations:

```javascript
class ButtonProvider extends BaseProvider {
  canHandle(element, options) {
    return element.tagName === 'BUTTON' || 
           (element.tagName === 'A' && this.looksLikeButton(element));
  }

  async convert(element, options) {
    // Specialized button conversion with optimized attributes
    return {
      blockName: 'greenshift-blocks/element',
      attrs: {
        tagName: element.tagName.toLowerCase(),
        isButton: true,
        buttonStyle: this.extractButtonStyle(element),
        // ... button-specific optimizations
      }
    };
  }

  getPriority() {
    return 70; // Higher than general ElementProvider
  }
}
```

## CLI Integration

### New --greenshift Flag

Add support for the new provider mode:

```javascript
// In cli.js
.option('--greenshift', 'Use Greenshift blocks (GreenLight Element)')

// In HtmlToBlocksConverter.js
if (options.greenshift) {
  providerMode = 'greenshift';
}
```

### Provider Loading

```javascript
loadGreenshiftProviders() {
  return [
    new ElementProvider(),
    new ContainerProvider(),
    new ButtonProvider(),
    new HeadingProvider(),
    new TextProvider(),
    new ImageProvider(),
    // Add Gutenberg providers as fallbacks
    ...this.loadGutenbergProviders()
  ];
}
```

## Benefits of This Approach

1. **Simplicity**: One primary block type reduces complexity
2. **Flexibility**: Can handle any HTML element without limitations
3. **Consistency**: All blocks share the same attribute structure
4. **Performance**: Fewer specialized providers means faster processing
5. **Maintainability**: Centralized logic in ElementProvider
6. **Extensibility**: Easy to add new features to the universal block

## Example Conversion

### Input HTML
```html
<div class="hero bg-primary text-center p-5 rounded-lg shadow-lg" id="hero-section" data-animation="fadeIn">
  <h1 class="text-4xl font-bold mb-4">Welcome to Our Site</h1>
  <p class="text-lg text-gray-600 mb-6">Discover amazing content and features</p>
  <a href="/learn-more" class="btn btn-primary px-6 py-3 rounded-full">Learn More</a>
</div>
```

### Output Greenshift Block
```javascript
{
  blockName: 'greenshift-blocks/element',
  attrs: {
    tagName: 'div',
    uniqueId: 'hero-section',
    globalClasses: 'hero',
    backgroundColor: ['var(--primary-color)', 'var(--primary-color)', 'var(--primary-color)', 'var(--primary-color)'],
    textAlign: ['center', 'center', 'center', 'center'],
    padding: ['3rem', '3rem', '3rem', '3rem'],
    borderRadius: ['0.5rem', '0.5rem', '0.5rem', '0.5rem'],
    boxShadow: ['0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 10px 15px -3px rgb(0 0 0 / 0.1)'],
    animation: {
      type: 'fadeIn',
      trigger: 'viewport'
    }
  },
  innerBlocks: [
    {
      blockName: 'greenshift-blocks/element',
      attrs: {
        tagName: 'h1',
        globalClasses: 'mb-4',
        fontSize: ['2.25rem', '2.25rem', '2.25rem', '2.25rem'],
        fontWeight: ['700', '700', '700', '700'],
        marginBottom: ['1.5rem', '1.5rem', '1.5rem', '1.5rem']
      },
      innerHTML: 'Welcome to Our Site'
    },
    {
      blockName: 'greenshift-blocks/element',
      attrs: {
        tagName: 'p',
        globalClasses: 'mb-6',
        fontSize: ['1.125rem', '1.125rem', '1.125rem', '1.125rem'],
        color: ['var(--gray-600)', 'var(--gray-600)', 'var(--gray-600)', 'var(--gray-600)'],
        marginBottom: ['1.5rem', '1.5rem', '1.5rem', '1.5rem']
      },
      innerHTML: 'Discover amazing content and features'
    },
    {
      blockName: 'greenshift-blocks/element',
      attrs: {
        tagName: 'a',
        url: '/learn-more',
        globalClasses: 'btn btn-primary',
        isButton: true,
        paddingLeft: ['1.5rem', '1.5rem', '1.5rem', '1.5rem'],
        paddingRight: ['1.5rem', '1.5rem', '1.5rem', '1.5rem'],
        paddingTop: ['0.75rem', '0.75rem', '0.75rem', '0.75rem'],
        paddingBottom: ['0.75rem', '0.75rem', '0.75rem', '0.75rem'],
        borderRadius: ['9999px', '9999px', '9999px', '9999px']
      },
      innerHTML: 'Learn More'
    }
  ]
}
```

This approach provides a comprehensive, flexible, and maintainable solution for converting HTML to Greenshift blocks while leveraging the powerful GreenLight Element as the universal building block.