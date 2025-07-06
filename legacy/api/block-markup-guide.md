# Custom Block Elements Guide

This guide documents the custom HTML elements used by the HTML to GenerateBlocks converter for advanced block structures.

## Query System

The query system allows you to create dynamic content loops with WordPress posts and custom post types. Custom elements are only needed for the structural wrappers - all content inside uses standard HTML.

### Basic Query Structure

```html
<query post-type="post" posts-per-page="6" class="blog-section">
  <looper class="posts-grid">
    <loop-item class="post-card">
      <h2>{{post_title link:post}}</h2>
      <p class="post-date">{{post_date}}</p>
      <p>{{post_excerpt}}</p>
      <a href="{{post_url}}" class="read-more">Read More</a>
    </loop-item>
  </looper>
  <query-page-numbers mid-size="2"></query-page-numbers>
</query>
```

### Query Wrapper Elements (1:1 aligned with GenerateBlocks)

#### Query (`<query>`)

The main container for query blocks. Maps to `generateblocks/query`.

**Attributes:**
- `post-type` - Post type to query (default: "post")
- `posts-per-page` - Number of posts per page (default: 10)
- `meta-query` - JSON string for meta queries
- `tax-query` - JSON string for taxonomy queries
- `order-by` - Order by field (date, title, menu_order, etc.)
- `order` - ASC or DESC
- `inherit-query` - Boolean to inherit main query
- `query-id` - Unique query identifier

#### Looper (`<looper>`)

Container for the post loop. Maps to `generateblocks/looper`.

#### Loop Item (`<loop-item>`)

Individual post template. Maps to `generateblocks/loop-item`.

#### Query Page Numbers (`<query-page-numbers>`)

Pagination controls. Maps to `generateblocks/query-page-numbers`.

**Attributes:**
- `mid-size` - Number of page links to show around current page

#### Query No Results (`<query-no-results>`)

No results fallback content. Maps to `generateblocks/query-no-results`.

### Dynamic Content Variables

Inside query items, use GenerateBlocks dynamic content variables:

```html
<!-- Post Information -->
{{post_title}}                 <!-- Post title -->
{{post_title link:post}}       <!-- Linked post title -->
{{post_excerpt}}               <!-- Post excerpt -->
{{post_content}}               <!-- Full post content -->
{{post_date}}                  <!-- Post date -->
{{post_date format:F j, Y}}    <!-- Formatted post date -->
{{post_url}}                   <!-- Post permalink -->

<!-- Author Information -->
{{author_name}}                <!-- Author display name -->
{{author_url}}                 <!-- Author archive URL -->

<!-- Featured Image -->
{{featured_image}}             <!-- Featured image URL -->
{{featured_image key:alt}}     <!-- Featured image alt text -->

<!-- Custom Fields -->
{{custom_field:field_name}}    <!-- Custom field value -->

<!-- Taxonomy Terms -->
{{terms:category}}             <!-- Post categories -->
{{terms:post_tag}}             <!-- Post tags -->
```

### Complete Query Example

```html
<query 
  post-type="post"
  posts-per-page="6"
  order-by="date"
  order="DESC"
  class="blog-section">
  
  <looper class="posts-grid">
    <loop-item class="post-card">
      
      <!-- Featured Image -->
      <img 
        src="{{featured_image}}" 
        alt="{{featured_image key:alt}}"
        class="post-thumbnail"
        loading="lazy">
      
      <!-- Card Content -->
      <div class="card-content">
        
        <!-- Post Category -->
        <span class="post-category">{{terms:category}}</span>
        
        <!-- Post Title -->
        <h2 class="post-title">{{post_title link:post}}</h2>
        
        <!-- Post Excerpt -->
        <p class="post-excerpt">{{post_excerpt}}</p>
        
        <!-- Post Meta -->
        <div class="post-meta">
          <span class="post-author">{{author_name}}</span>
          <span class="post-date">{{post_date format:F j, Y}}</span>
          <span class="reading-time">{{custom_field:reading_time}} min read</span>
        </div>
        
        <!-- Read More Link -->
        <a href="{{post_url}}" class="read-more-btn">Read More</a>
        
      </div>
      
    </loop-item>
  </looper>
  
  <!-- Pagination -->
  <query-page-numbers mid-size="2" class="blog-pagination"></query-page-numbers>
  
  <!-- No Results Fallback -->
  <query-no-results>
    <div class="no-posts-message">
      <h3>No Posts Found</h3>
      <p>Sorry, we couldn't find any posts matching your criteria.</p>
    </div>
  </query-no-results>
  
</query>
```

### Advanced Query with Filters

```html
<query 
  post-type="product"
  posts-per-page="12"
  meta-query='[{"key":"featured","value":"true"}]'
  tax-query='[{"taxonomy":"product_category","terms":["electronics"]}]'
  order-by="date"
  order="DESC"
  class="featured-products">
  
  <looper class="products-grid">
    <loop-item class="product-card">
      <img src="{{featured_image}}" alt="{{post_title}}" class="product-image">
      <h3 class="product-title">{{post_title link:post}}</h3>
      <p class="product-price">${{custom_field:price}}</p>
      <div class="product-category">{{terms:product_category}}</div>
    </loop-item>
  </looper>
  
  <query-page-numbers mid-size="3"></query-page-numbers>
  <query-no-results>
    <p>No featured products found.</p>
  </query-no-results>
  
</query>
```

## Accordion System

The accordion system creates collapsible content sections using GenerateBlocks Pro. Custom elements are only needed for the accordion structure - content inside uses standard HTML.

### Basic Accordion Structure (1:1 aligned with GenerateBlocks)

```html
<accordion class="faq-accordion">
  <accordion-item class="faq-item">
    <accordion-toggle class="faq-question">What is your return policy?</accordion-toggle>
    <accordion-content class="faq-answer">
      <p>We offer a 30-day return policy for all unused items in their original packaging.</p>
      <ul>
        <li>Items must be in original condition</li>
        <li>Original packaging required</li>
        <li>Return shipping may apply</li>
      </ul>
    </accordion-content>
  </accordion-item>
  
  <accordion-item class="faq-item">
    <accordion-toggle class="faq-question">How long does shipping take?</accordion-toggle>
    <accordion-content class="faq-answer">
      <p>Shipping times vary based on your location:</p>
      <ul>
        <li>Standard shipping: 3-5 business days</li>
        <li>Express shipping: 1-2 business days</li>
        <li>International: 7-14 business days</li>
      </ul>
    </accordion-content>
  </accordion-item>
</accordion>
```

### Accordion Wrapper Elements (1:1 aligned with GenerateBlocks)

#### Accordion (`<accordion>`)
Maps to `generateblocks-pro/accordion`. Contains all accordion items.

#### Accordion Item (`<accordion-item>`)
Maps to `generateblocks-pro/accordion-item`. Individual collapsible section.

#### Accordion Toggle (`<accordion-toggle>`)
Maps to `generateblocks-pro/accordion-toggle`. The clickable header/trigger.

**Attributes:**
- `tag` - HTML tag to use (default: "div")

#### Accordion Content (`<accordion-content>`)
Maps to `generateblocks-pro/accordion-content`. The collapsible content area.

## Tabs System

The tabs system creates tabbed content sections using GenerateBlocks Pro. Custom elements are only needed for the tabs structure - content inside uses standard HTML.

### Basic Tabs Structure (1:1 aligned with GenerateBlocks)

```html
<tabs class="content-tabs">
  <tabs-menu class="tab-navigation">
    <tab-menu-item class="tab-trigger">Tab 1</tab-menu-item>
    <tab-menu-item class="tab-trigger">Tab 2</tab-menu-item>
    <tab-menu-item class="tab-trigger">Tab 3</tab-menu-item>
  </tabs-menu>
  
  <tab-items class="tab-content-wrapper">
    <tab-item class="tab-panel">
      <h3>Tab 1 Content</h3>
      <p>This is the content for the first tab.</p>
    </tab-item>
    
    <tab-item class="tab-panel">
      <h3>Tab 2 Content</h3>
      <p>This is the content for the second tab.</p>
    </tab-item>
    
    <tab-item class="tab-panel">
      <h3>Tab 3 Content</h3>
      <p>This is the content for the third tab.</p>
    </tab-item>
  </tab-items>
</tabs>
```

### Tabs Wrapper Elements (1:1 aligned with GenerateBlocks)

#### Tabs (`<tabs>`)
Maps to `generateblocks-pro/tabs`. Contains the entire tab system.

#### Tabs Menu (`<tabs-menu>`)
Maps to `generateblocks-pro/tabs-menu`. Container for tab navigation items.

#### Tab Menu Item (`<tab-menu-item>`)
Maps to `generateblocks-pro/tab-menu-item`. Individual tab navigation button.

#### Tab Items (`<tab-items>`)
Maps to `generateblocks-pro/tab-items`. Container for tab content panels.

#### Tab Item (`<tab-item>`)
Maps to `generateblocks-pro/tab-item`. Individual tab content panel.

## Navigation System

The navigation system creates dynamic WordPress menus using GenerateBlocks Pro.

### Basic Navigation Structure

```html
<navigation class="main-navigation">
  <menu-container class="menu-wrapper">
    <classic-menu class="primary-menu">
      <classic-menu-item class="menu-item">
        <a href="/home">Home</a>
      </classic-menu-item>
      <classic-menu-item class="menu-item has-submenu">
        <a href="/about">About</a>
        <classic-sub-menu class="submenu">
          <classic-menu-item class="submenu-item">
            <a href="/about/team">Team</a>
          </classic-menu-item>
          <classic-menu-item class="submenu-item">
            <a href="/about/history">History</a>
          </classic-menu-item>
        </classic-sub-menu>
      </classic-menu-item>
    </classic-menu>
  </menu-container>
  
  <menu-toggle class="mobile-menu-toggle">☰</menu-toggle>
</navigation>
```

### Navigation Wrapper Elements

#### Navigation (`<navigation>`)
Maps to `generateblocks-pro/navigation`. Main navigation container.

#### Menu Container (`<menu-container>`)
Maps to `generateblocks-pro/menu-container`. Wrapper for menu items.

#### Classic Menu (`<classic-menu>`)
Maps to `generateblocks-pro/classic-menu`. WordPress menu container.

#### Classic Menu Item (`<classic-menu-item>`)
Maps to `generateblocks-pro/classic-menu-item`. Individual menu item.

#### Classic Sub Menu (`<classic-sub-menu>`)
Maps to `generateblocks-pro/classic-sub-menu`. Dropdown submenu container.

#### Menu Toggle (`<menu-toggle>`)
Maps to `generateblocks-pro/menu-toggle`. Mobile menu hamburger button.

## Site Header System

The site header system creates header layouts using GenerateBlocks Pro.

### Basic Site Header Structure

```html
<site-header class="main-header">
  <div class="header-content">
    <div class="site-branding">
      <h1>Site Title</h1>
    </div>
    
    <navigation class="header-navigation">
      <!-- Navigation elements here -->
    </navigation>
  </div>
</site-header>
```

### Site Header Wrapper Elements

#### Site Header (`<site-header>`)
Maps to `generateblocks-pro/site-header`. Main header container.

## Shape System

The shape system handles SVG icons, shapes, and graphics using GenerateBlocks shape blocks. No custom elements needed - uses standard SVG tags.

### Basic Shape Structure

```html
<!-- Direct SVG elements -->
<svg class="custom-icon" viewBox="0 0 24 24" width="24" height="24">
  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" fill="currentColor"/>
</svg>

<!-- SVG with custom attributes -->
<svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
  <path d="M8 5v14l11-7z" fill="#007cba"/>
</svg>

<!-- Container with SVG (data-shape attribute for identification) -->
<div class="shape-container" data-shape="star">
  <svg viewBox="0 0 24 24" class="star-shape">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="gold"/>
  </svg>
</div>
```

### Shape Detection

The Shape Provider automatically detects:
1. **Direct SVG elements** - `<svg>` tags are converted to shape blocks
2. **Elements with shape classes** - Elements containing "shape" in their class names
3. **Data-shape attributes** - Elements with `data-shape` attribute for explicit shape marking

### Shape Block Output

Shape blocks convert to:
- **Block Name**: `generateblocks/shape`
- **HTML Structure**: `<span class="gb-shape">` containing the SVG
- **SVG Content**: Stored in the `html` attribute and rendered inside the span
- **Classes**: Original classes preserved as `globalClasses`
- **Attributes**: Other HTML attributes preserved as `htmlAttributes`

## Available GenerateBlocks

### ✅ GenerateBlocks v2 (Free) - Provider Status

| Block Name | Custom Element | Provider Status | Notes |
|------------|----------------|-----------------|-------|
| `generateblocks/text` | No | ✅ Text Provider | Standard text content |
| `generateblocks/element` | No | ✅ Element Provider | Generic containers |
| `generateblocks/media` | No | ✅ Media Provider | Images and media |
| `generateblocks/container` | No | ✅ Element Provider | Layout containers |
| `generateblocks/button` | No | ✅ Text Provider | Buttons |
| `generateblocks/button-container` | No | ✅ Element Provider | Button groups |
| `generateblocks/headline` | No | ✅ Text Provider | Headings |
| `generateblocks/image` | No | ✅ Media Provider | Images |
| `generateblocks/grid` | No | ✅ Element Provider | Grid layouts |
| `generateblocks/shape` | No | ✅ Shape Provider | SVG shapes |
| `generateblocks/query` | `<query>` | ✅ Custom Provider | Query containers |
| `generateblocks/looper` | `<looper>` | ✅ Custom Provider | Loop containers |
| `generateblocks/loop-item` | `<loop-item>` | ✅ Custom Provider | Loop items |
| `generateblocks/query-page-numbers` | `<query-page-numbers>` | ✅ Custom Provider | Pagination |
| `generateblocks/query-no-results` | `<query-no-results>` | ✅ Custom Provider | No results fallback |
| `generateblocks/query-loop` | No | ❌ **NEEDS PROVIDER** | Legacy query system |

### ✅ GenerateBlocks Pro - Provider Status

| Block Name | Custom Element | Provider Status | Notes |
|------------|----------------|-----------------|-------|
| `generateblocks-pro/accordion` | `<accordion>` | ✅ Custom Provider | Accordion container |
| `generateblocks-pro/accordion-item` | `<accordion-item>` | ✅ Custom Provider | Accordion item |
| `generateblocks-pro/accordion-toggle` | `<accordion-toggle>` | ✅ Custom Provider | Accordion trigger |
| `generateblocks-pro/accordion-content` | `<accordion-content>` | ✅ Custom Provider | Accordion content |
| `generateblocks-pro/accordion-toggle-icon` | No | ❌ **NEEDS PROVIDER** | Accordion icons |
| `generateblocks-pro/tabs` | `<tabs>` | ✅ Tabs Provider | Tab container |
| `generateblocks-pro/tabs-menu` | `<tabs-menu>` | ✅ Tabs Provider | Tab navigation |
| `generateblocks-pro/tab-menu-item` | `<tab-menu-item>` | ✅ Tabs Provider | Tab trigger |
| `generateblocks-pro/tab-items` | `<tab-items>` | ✅ Tabs Provider | Tab content wrapper |
| `generateblocks-pro/tab-item` | `<tab-item>` | ✅ Tabs Provider | Tab content panel |
| `generateblocks-pro/navigation` | `<navigation>` | ❌ **NEEDS PROVIDER** | Navigation container |
| `generateblocks-pro/menu-container` | `<menu-container>` | ❌ **NEEDS PROVIDER** | Menu wrapper |
| `generateblocks-pro/classic-menu` | `<classic-menu>` | ❌ **NEEDS PROVIDER** | WordPress menu |
| `generateblocks-pro/classic-menu-item` | `<classic-menu-item>` | ❌ **NEEDS PROVIDER** | Menu item |
| `generateblocks-pro/classic-sub-menu` | `<classic-sub-menu>` | ❌ **NEEDS PROVIDER** | Submenu |
| `generateblocks-pro/menu-toggle` | `<menu-toggle>` | ❌ **NEEDS PROVIDER** | Mobile menu toggle |
| `generateblocks-pro/site-header` | `<site-header>` | ❌ **NEEDS PROVIDER** | Site header |

## Missing Providers Summary

### ❌ Blocks that need providers (9 total):

**GenerateBlocks v2 (1 block):**
1. `generateblocks/query-loop` - Legacy query system (may not need custom element)

**GenerateBlocks Pro (8 blocks):**
1. `generateblocks-pro/accordion-toggle-icon` - Accordion expand/collapse icons
2. `generateblocks-pro/navigation` - Main navigation container
3. `generateblocks-pro/menu-container` - Menu wrapper
4. `generateblocks-pro/classic-menu` - WordPress menu
5. `generateblocks-pro/classic-menu-item` - Menu item
6. `generateblocks-pro/classic-sub-menu` - Dropdown submenu
7. `generateblocks-pro/menu-toggle` - Mobile hamburger menu
8. `generateblocks-pro/site-header` - Site header container

## General Guidelines

### When to Use Custom Elements

Custom elements should only be used for:
1. **Query wrappers** - `query`, `looper`, `loop-item`, `query-page-numbers`, `query-no-results`
2. **Accordion wrappers** - `accordion`, `accordion-item`, `accordion-toggle`, `accordion-content`
3. **Tabs wrappers** - `tabs`, `tabs-menu`, `tab-menu-item`, `tab-items`, `tab-item`
4. **Navigation wrappers** - `navigation`, `menu-container`, `classic-menu`, `classic-menu-item`, `classic-sub-menu`, `menu-toggle`
5. **Site structure** - `site-header`

Note: SVG shapes use standard `<svg>` elements, no custom elements needed.

### When to Use Standard HTML

Use standard HTML elements for all content:
- Headings (`<h1>`, `<h2>`, etc.)
- Paragraphs (`<p>`)
- Images (`<img>`)
- Links (`<a>`)
- Lists (`<ul>`, `<ol>`, `<li>`)
- Divs and spans for layout
- Any semantic HTML elements

### Dynamic Content

For queries, use GenerateBlocks dynamic content variables directly in HTML attributes and content:
- `{{post_title}}` for post titles
- `{{featured_image}}` for image sources
- `{{post_url}}` for links
- `{{custom_field:field_name}}` for custom fields
- No special attributes needed

### Class Preservation

All `class` attributes are preserved and converted to `globalClasses` in the GenerateBlocks format.