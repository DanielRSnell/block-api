<?php
/**
 * Test Query Card Example Conversion
 * 
 * This script demonstrates how the query-card.html example converts
 * to proper GenerateBlocks markup using the custom element provider.
 */

// Define ABSPATH to prevent exit
define('ABSPATH', true);

// Mock WordPress functions for testing
if (!function_exists('wp_generate_uuid4')) {
    function wp_generate_uuid4() {
        return 'test-uuid-' . uniqid();
    }
}

if (!function_exists('esc_attr')) {
    function esc_attr($text) {
        return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('esc_html')) {
    function esc_html($text) {
        return htmlspecialchars($text, ENT_NOQUOTES, 'UTF-8');
    }
}

if (!function_exists('wp_parse_args')) {
    function wp_parse_args($args, $defaults = array()) {
        if (is_array($args)) {
            return array_merge($defaults, $args);
        }
        return $defaults;
    }
}

if (!function_exists('wp_json_encode')) {
    function wp_json_encode($data, $options = 0) {
        return json_encode($data, $options);
    }
}

// Include the converter
require_once __DIR__ . '/../class-html-to-generateblocks-converter.php';

// Extract just the first query example from the HTML file
$blog_query_html = '<query-root 
    post-type="post"
    posts-per-page="6"
    order-by="date"
    order="DESC"
    class="blog-section">
    
    <query-content class="posts-grid">
        <query-item class="post-card">
            <query-image 
                class="post-thumbnail"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw">
            </query-image>
            
            <div class="card-content">
                <query-meta field="category" class="post-category"></query-meta>
                <query-title tag="h2" class="post-title">Post Title</query-title>
                <query-excerpt class="post-excerpt">Post excerpt will appear here...</query-excerpt>
                
                <div class="post-meta">
                    <query-meta field="author_name" class="post-author">Author Name</query-meta>
                    <query-meta field="date" class="post-date">Date</query-meta>
                    <query-meta field="reading_time" class="reading-time">5 min read</query-meta>
                </div>
                
                <query-link class="read-more-btn">Read More</query-link>
            </div>
        </query-item>
    </query-content>
    
    <query-pagination mid-size="2" class="blog-pagination"></query-pagination>
    
    <query-no-results>
        <div class="no-posts-message">
            <h3>No Posts Found</h3>
            <p>Sorry, we couldn\'t find any posts matching your criteria.</p>
        </div>
    </query-no-results>
</query-root>';

echo "=== Query Card Example Conversion ===\n\n";

// Create converter instance
$converter = new GB_APIs_HTML_To_GenerateBlocks_Converter();

// Run conversion
$result = $converter->convert_html_to_generateblocks($blog_query_html);

// Output results
echo "Conversion successful: " . ($result['success'] ? 'YES' : 'NO') . "\n";
echo "Number of blocks: " . count($result['blocks']) . "\n\n";

if ($result['success']) {
    echo "=== Block Structure ===\n";
    
    function print_detailed_structure($blocks, $indent = 0) {
        foreach ($blocks as $i => $block) {
            $prefix = str_repeat('  ', $indent);
            echo $prefix . "├─ " . $block['blockName'];
            
            // Show key attributes
            $attrs = array();
            if (isset($block['attrs']['tagName'])) {
                $attrs[] = "tag: " . $block['attrs']['tagName'];
            }
            if (isset($block['attrs']['content']) && !empty($block['attrs']['content'])) {
                $content = strlen($block['attrs']['content']) > 30 
                    ? substr($block['attrs']['content'], 0, 30) . "..." 
                    : $block['attrs']['content'];
                $attrs[] = "content: \"$content\"";
            }
            if (isset($block['attrs']['globalClasses']) && !empty($block['attrs']['globalClasses'])) {
                $attrs[] = "classes: " . implode(', ', $block['attrs']['globalClasses']);
            }
            if (isset($block['attrs']['query'])) {
                $attrs[] = "query: " . json_encode($block['attrs']['query']);
            }
            
            if (!empty($attrs)) {
                echo " (" . implode(', ', $attrs) . ")";
            }
            echo "\n";
            
            if (!empty($block['innerBlocks'])) {
                print_detailed_structure($block['innerBlocks'], $indent + 1);
            }
        }
    }
    
    print_detailed_structure($result['blocks']);
    
    echo "\n=== Conversion Statistics ===\n";
    print_r($result['conversion_stats']);
    
    echo "\n=== Generated GenerateBlocks Markup ===\n";
    echo $result['markup'] . "\n";
    
} else {
    echo "Error: " . $result['error'] . "\n";
}

echo "\n=== Test Complete ===\n";
echo "This example demonstrates:\n";
echo "• Complex query configuration (post-type, posts-per-page, ordering)\n";
echo "• Dynamic content mapping ({{post_title}}, {{post_excerpt}}, etc.)\n";
echo "• Custom field meta data (category, author_name, date, reading_time)\n";
echo "• Media elements with responsive attributes\n";
echo "• Semantic HTML structure preservation\n";
echo "• CSS class inheritance and styling hooks\n";
echo "• Pagination and no-results fallback handling\n";