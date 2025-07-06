# GenerateBlocks Custom Element Examples

This folder contains practical examples demonstrating how to use custom elements with the GenerateBlocks converter system.

## Available Examples

### 📋 query-card.html
**Blog Post Cards with Dynamic Content**

A comprehensive example showing how to create dynamic post listings using the query system. Includes:

- **Basic Blog Query**: Standard post cards with title, excerpt, featured image
- **Advanced Filtering**: Featured posts with meta queries and taxonomy filtering  
- **Portfolio Showcase**: Custom post type query for project portfolios
- **Dynamic Content**: All examples use dynamic tags for real WordPress data

**Key Features Demonstrated:**
- `<query-root>` with complex filtering (meta-query, tax-query)
- `<query-content>` and `<query-item>` for post loops
- `<query-image>` with responsive attributes
- `<query-title>`, `<query-excerpt>`, `<query-link>` for content
- `<query-meta field="">` for custom fields
- `<query-pagination>` with customizable settings
- `<query-no-results>` fallback content

## Testing Examples

Each example includes a test PHP script that demonstrates the conversion process:

```bash
# Test the query card example
cd examples/
php test-query-card.php
```

## Custom Element Reference

### Query System Elements

| Element | Purpose | Converts To |
|---------|---------|-------------|
| `<query-root>` | Query container | `generateblocks/query` |
| `<query-content>` | Loop container | `generateblocks/looper` |
| `<query-item>` | Individual post template | `generateblocks/loop-item` |
| `<query-title>` | Post title | `generateblocks/text` |
| `<query-excerpt>` | Post excerpt | `generateblocks/text` |
| `<query-link>` | Post permalink | `generateblocks/text` (anchor) |
| `<query-image>` | Featured image | `generateblocks/media` |
| `<query-meta>` | Custom field data | `generateblocks/text` |
| `<query-pagination>` | Page numbers | `generateblocks/query-page-numbers` |
| `<query-no-results>` | Empty state | `generateblocks/query-no-results` |

### Query Root Attributes

```html
<query-root 
    post-type="post"                    <!-- Post type to query -->
    posts-per-page="6"                  <!-- Number of posts -->
    order-by="date"                     <!-- Sort field -->
    order="DESC"                        <!-- Sort direction -->
    meta-query='[{"key":"featured","value":"true"}]'  <!-- Meta filtering -->
    tax-query='[{"taxonomy":"category","terms":["tech"]}]'  <!-- Taxonomy filtering -->
    class="my-query">                   <!-- CSS classes -->
```

### Dynamic Content Tags

The system automatically maps content to WordPress dynamic tags:

- `<query-title>` → `{{post_title}}`
- `<query-excerpt>` → `{{post_excerpt}}`
- `<query-link>` → `href="{{post_url}}"`
- `<query-image>` → `src="{{featured_image_url}}" alt="{{post_title}}"`
- `<query-meta field="author_name">` → `{{custom_field:author_name}}`

### Customization Options

**Title Tag Override:**
```html
<query-title tag="h3">Title</query-title>  <!-- Uses h3 instead of default h2 -->
```

**Custom Field Mapping:**
```html
<query-meta field="price">$99</query-meta>  <!-- Maps to {{custom_field:price}} -->
```

**Responsive Images:**
```html
<query-image 
    loading="lazy"
    sizes="(max-width: 768px) 100vw, 50vw">
</query-image>
```

## Best Practices

1. **Semantic Structure**: Use appropriate HTML tags (article, section, nav)
2. **CSS Classes**: Add meaningful class names for styling hooks
3. **Performance**: Use `loading="lazy"` on images and appropriate `sizes` attributes
4. **Accessibility**: Include proper heading hierarchy and semantic markup
5. **Fallbacks**: Always include `<query-no-results>` for empty states

## Integration Notes

These examples work with:
- **WordPress Block Editor**: Convert HTML to GenerateBlocks markup
- **Custom Post Types**: Support for any registered post type
- **Custom Fields**: ACF, Meta Box, and native custom fields
- **Taxonomies**: Categories, tags, and custom taxonomies
- **Responsive Design**: Mobile-first approach with breakpoint considerations

## Creating New Examples

When creating new examples:
1. Focus on real-world use cases
2. Include comprehensive commenting
3. Demonstrate multiple features together
4. Provide test scripts for validation
5. Document any special requirements or dependencies