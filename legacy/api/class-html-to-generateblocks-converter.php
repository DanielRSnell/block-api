<?php
/**
 * HTML to GenerateBlocks Converter
 *
 * Converts HTML strings to GenerateBlocks markup with WordPress HTML block fallbacks
 *
 * @package GB_APIs
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

// Include provider files
require_once __DIR__ . '/providers/interface-gb-block-provider.php';
require_once __DIR__ . '/providers/abstract-gb-base-provider.php';
require_once __DIR__ . '/providers/class-gb-provider-manager.php';
require_once __DIR__ . '/providers/class-gb-media-provider.php';
require_once __DIR__ . '/providers/class-gb-shape-provider.php';
require_once __DIR__ . '/providers/class-gb-tabs-provider.php';
require_once __DIR__ . '/providers/class-gb-text-provider.php';
require_once __DIR__ . '/providers/class-gb-element-provider.php';
require_once __DIR__ . '/providers/class-gb-custom-element-provider.php';
require_once __DIR__ . '/providers/class-gb-fallback-provider.php';

/**
 * HTML to GenerateBlocks Converter Class
 */
class GB_APIs_HTML_To_GenerateBlocks_Converter {

    /**
     * Supported HTML elements and their GenerateBlocks equivalents
     * Only includes elements with fixed block types - others use intelligent content analysis
     */
    private $element_mappings = array(
        // Media elements (always media blocks)
        'img'     => 'generateblocks/media',
        
        // Structural elements (always container blocks regardless of content)
        'div'     => 'generateblocks/element',
        'section' => 'generateblocks/element',
        'article' => 'generateblocks/element',
        'aside'   => 'generateblocks/element',
        'header'  => 'generateblocks/element',
        'footer'  => 'generateblocks/element',
        'nav'     => 'generateblocks/element',
        'main'    => 'generateblocks/element',
        'figure'  => 'generateblocks/element',
        
        // List containers (always element blocks)
        'ul'      => 'generateblocks/element',
        'ol'      => 'generateblocks/element',
        'dl'      => 'generateblocks/element',
        
        // Form elements (always element blocks)
        'form'    => 'generateblocks/element',
        'input'   => 'generateblocks/element',
        'textarea' => 'generateblocks/element',
        'select'  => 'generateblocks/element',
        
        // Media/embed elements (always element blocks)
        'iframe'  => 'generateblocks/element',
        'video'   => 'generateblocks/element',
        'audio'   => 'generateblocks/element',
        'canvas'  => 'generateblocks/element',
        'svg'     => 'generateblocks/element',
        'picture' => 'generateblocks/element', // Convert to div with data-tagname
        
        // Links (always element blocks, not text blocks)
        'a'       => 'generateblocks/element',
        
        // Table elements (always element blocks)
        'table'   => 'generateblocks/element',
        'tr'      => 'generateblocks/element',
        'td'      => 'generateblocks/element',
        'th'      => 'generateblocks/element',
        
        // Self-closing elements (always element blocks)
        'hr'      => 'generateblocks/element',
        'br'      => 'generateblocks/element',
        
        // Script/style elements (always element blocks)
        'script'  => 'generateblocks/element',
        'style'   => 'generateblocks/element',
        
        // Note: h1-h6, p, span, button, li, dt, dd, figcaption are now handled by content analysis
        // This allows them to be text blocks when they contain only text, or element blocks when they have children
        // Links (a) are always element blocks regardless of content
    );

    /**
     * Default attributes for GenerateBlocks
     */
    private $default_attributes = array(
        'generateblocks/element' => array(
            'className' => 'gb-element',
        ),
        'generateblocks/text' => array(
            'className' => 'gb-text',
            'content' => '',
        ),
        'generateblocks/media' => array(
            'className' => 'gb-media',
        ),
    );

    /**
     * Provider manager for handling different block types
     */
    private $provider_manager;

    /**
     * Constructor - Initialize provider system
     */
    public function __construct() {
        $this->provider_manager = new GB_Provider_Manager();
        $this->init_providers();
    }

    /**
     * Initialize and register all providers
     */
    private function init_providers() {
        // Register providers in priority order (highest first)
        $this->provider_manager->register_provider(new GB_Media_Provider()); // Priority 100
        $this->provider_manager->register_provider(new GB_Shape_Provider()); // Priority 80
        $this->provider_manager->register_provider(new GB_Tabs_Provider()); // Priority 75
        $this->provider_manager->register_provider(new GB_Custom_Element_Provider()); // Priority 75
        $this->provider_manager->register_provider(new GB_Text_Provider()); // Priority 50
        $this->provider_manager->register_provider(new GB_Element_Provider()); // Priority 25
        $this->provider_manager->register_provider(new GB_Fallback_Provider()); // Priority 1
    }

    /**
     * Convert HTML string to GenerateBlocks markup
     *
     * @param string $html HTML string to convert
     * @param array $options Conversion options
     * @return array Conversion result
     */
    public function convert_html_to_generateblocks($html, $options = array()) {
        $options = wp_parse_args($options, array(
            'preserve_classes' => true,
            'preserve_ids' => true,
            'preserve_styles' => false,
            'fallback_to_html_block' => true,
            'generate_unique_ids' => true,
            'semantic_mapping' => true,
        ));

        try {
            // Debug: Log what HTML we receive
            error_log('CONVERTER RECEIVED HTML: ' . $html);
            
            // Clean and prepare HTML
            $html = $this->clean_html($html);
            
            // Debug: Log cleaned HTML
            error_log('CONVERTER CLEANED HTML: ' . $html);
            
            // Parse HTML into DOM
            $dom = $this->parse_html($html);
            
            if (!$dom) {
                return $this->create_error_response('Failed to parse HTML');
            }

            // Convert DOM to GenerateBlocks
            $blocks = $this->convert_dom_to_blocks($dom, $options);
            
            // Generate block markup
            $block_markup = $this->generate_block_markup($blocks);
            
            return array(
                'success' => true,
                'blocks' => $blocks,
                'markup' => $block_markup,
                'original_html' => $html,
                'conversion_stats' => $this->get_conversion_stats($blocks),
                'debug_file_loaded' => 'CONVERTER_FILE_UPDATED_AND_LOADED',
            );

        } catch (Exception $e) {
            return $this->create_error_response($e->getMessage());
        }
    }

    /**
     * Clean and prepare HTML for parsing
     *
     * @param string $html Raw HTML string
     * @return string Cleaned HTML
     */
    private function clean_html($html) {
        // Remove script and style tags for security
        $html = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi', '', $html);
        $html = preg_replace('/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/mi', '', $html);
        
        // Remove dangerous attributes
        $html = preg_replace('/\s*on\w+\s*=\s*["\'][^"\']*["\']/', '', $html);
        $html = preg_replace('/\s*javascript\s*:/i', '', $html);
        
        // Normalize whitespace
        $html = preg_replace('/\s+/', ' ', $html);
        $html = trim($html);
        
        return $html;
    }

    /**
     * Parse HTML string into DOMDocument
     *
     * @param string $html HTML string
     * @return DOMDocument|false Parsed DOM or false on failure
     */
    private function parse_html($html) {
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = false;
        
        // Suppress errors for malformed HTML
        libxml_use_internal_errors(true);
        
        // Wrap in UTF-8 meta tag to handle encoding
        $wrapped_html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' . $html . '</body></html>';
        
        $success = $dom->loadHTML($wrapped_html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        
        if (!$success) {
            return false;
        }
        
        // Get the body element which contains our content
        $body = $dom->getElementsByTagName('body')->item(0);
        
        return $body ? $body : false;
    }

    /**
     * Convert DOM elements to GenerateBlocks structure
     *
     * @param DOMNode $dom DOM node to convert
     * @param array $options Conversion options
     * @return array Array of block data
     */
    private function convert_dom_to_blocks($dom, $options) {
        $blocks = array();
        
        foreach ($dom->childNodes as $node) {
            if ($node->nodeType === XML_ELEMENT_NODE) {
                $block = $this->convert_element_to_block($node, $options);
                if ($block) {
                    $blocks[] = $block;
                }
            } elseif ($node->nodeType === XML_TEXT_NODE) {
                $text = trim($node->textContent);
                if (!empty($text)) {
                    $blocks[] = $this->create_text_block($text, $options);
                }
            }
        }
        
        return $blocks;
    }

    /**
     * Convert single DOM element to GenerateBlocks block
     *
     * @param DOMElement $element DOM element
     * @param array $options Conversion options
     * @return array|null Block data or null if not convertible
     */
    private function convert_element_to_block($element, $options) {
        $tag_name = strtolower($element->tagName);
        
        // Handle special filtered elements (like source)
        if ($tag_name === 'source') {
            return $this->process_filtered_element_children($element, $options);
        }
        
        // Use provider system to convert element
        $block = $this->provider_manager->convert_element($element, $options);
        
        // If no provider could handle it, return null
        if (!$block) {
            return null;
        }
        
        // For blocks that need child processing, process children recursively
        $blocks_with_children = array(
            'generateblocks/element',
            'generateblocks/query',
            'generateblocks/looper',
            'generateblocks/loop-item',
            'generateblocks/query-no-results',
            'generateblocks-pro/accordion',
            'generateblocks-pro/accordion-item',
            'generateblocks-pro/accordion-toggle',
            'generateblocks-pro/accordion-content',
            'generateblocks-pro/tabs',
            'generateblocks-pro/tabs-menu',
            'generateblocks-pro/tab-menu-item',
            'generateblocks-pro/tab-items',
            'generateblocks-pro/tab-item'
        );
        
        if (in_array($block['blockName'], $blocks_with_children)) {
            $block = $this->process_element_children($element, $block, $options);
        }
        
        return $block;
    }

    /**
     * Process children of element blocks
     *
     * @param DOMElement $element Parent DOM element
     * @param array $block Block data
     * @param array $options Conversion options
     * @return array Updated block data with processed children
     */
    private function process_element_children($element, $block, $options) {
        $inner_blocks = array();
        $inner_content = $block['innerContent'];
        $child_index = 0;
        
        foreach ($element->childNodes as $child) {
            if ($child->nodeType === XML_ELEMENT_NODE) {
                $child_block = $this->convert_element_to_block($child, $options);
                if ($child_block) {
                    $inner_blocks[] = $child_block;
                    // Update the placeholder in inner_content
                    if (isset($inner_content[$child_index + 1])) {
                        $inner_content[$child_index + 1] = null;
                    }
                    $child_index++;
                }
            } elseif ($child->nodeType === XML_TEXT_NODE) {
                $text = trim($child->textContent);
                if (!empty($text)) {
                    // Create a text block for orphaned text
                    $text_block = $this->create_orphaned_text_block($text, $options);
                    $inner_blocks[] = $text_block;
                    // Update the placeholder in inner_content
                    if (isset($inner_content[$child_index + 1])) {
                        $inner_content[$child_index + 1] = null;
                    }
                    $child_index++;
                }
            }
        }
        
        $block['innerBlocks'] = $inner_blocks;
        $block['innerContent'] = $inner_content;
        
        return $block;
    }

    /**
     * Determine appropriate block type for HTML element
     *
     * @param string $tag_name HTML tag name
     * @param DOMElement $element DOM element
     * @param array $options Conversion options
     * @return string|null Block type or null
     */
    private function get_block_type_for_element($tag_name, $element, $options) {
        // Special handling for elements that should be filtered out
        if ($tag_name === 'source') {
            return null; // Filter out source elements completely
        }
        
        // Special handling for text-based elements - always text blocks
        if ($tag_name === 'span' || $tag_name === 'p') {
            return 'generateblocks/text';
        }
        
        // Check direct mapping first
        if (isset($this->element_mappings[$tag_name])) {
            return $this->element_mappings[$tag_name];
        }
        
        // Use intelligent content-based mapping
        if ($options['semantic_mapping']) {
            // Image elements always use media
            if ($tag_name === 'img') {
                return 'generateblocks/media';
            }
            
            // Analyze element content to determine best block type
            $content_type = $this->analyze_element_content($element);
            
            switch ($content_type) {
                case 'text_only':
                    // Element contains only text content - use text block
                    return 'generateblocks/text';
                    
                case 'mixed_content':
                    // Element has both text and child elements - use element block
                    return 'generateblocks/element';
                    
                case 'child_elements':
                    // Element contains only child elements - use element block
                    return 'generateblocks/element';
                    
                case 'empty':
                    // Element is empty or whitespace only - use element block
                    return 'generateblocks/element';
                    
                default:
                    return 'generateblocks/element';
            }
        }
        
        // Fallback to generateblocks/element for unknown elements
        return 'generateblocks/element';
    }

    /**
     * Analyze element content to determine appropriate block type
     *
     * @param DOMElement $element DOM element
     * @return string Content type (text_only, child_elements, mixed_content, empty)
     */
    private function analyze_element_content($element) {
        $has_text = false;
        $has_elements = false;
        $non_whitespace_text = '';
        
        foreach ($element->childNodes as $child) {
            if ($child->nodeType === XML_TEXT_NODE) {
                $text_content = trim($child->textContent);
                if (!empty($text_content)) {
                    $has_text = true;
                    $non_whitespace_text .= $text_content;
                }
            } elseif ($child->nodeType === XML_ELEMENT_NODE) {
                $has_elements = true;
            }
        }
        
        // Determine content type based on what we found
        if (!$has_text && !$has_elements) {
            return 'empty';
        } elseif ($has_text && !$has_elements) {
            return 'text_only';
        } elseif (!$has_text && $has_elements) {
            return 'child_elements';
        } else {
            // Has both text and elements
            // Check if text is substantial or just whitespace/formatting
            $text_length = strlen($non_whitespace_text);
            
            // If text is very short (< 5 chars), likely formatting - treat as element
            if ($text_length < 5) {
                return 'child_elements';
            }
            
            return 'mixed_content';
        }
    }

    /**
     * Create GenerateBlocks element block
     *
     * @param DOMElement $element DOM element
     * @param array $options Conversion options
     * @return array Block data
     */
    private function create_element_block($element, $options) {
        $tag_name = strtolower($element->tagName);
        $attrs = $this->extract_attributes($element, 'generateblocks/element', $options);
        
        // Special handling for picture elements - convert to div with data-tagname
        if ($tag_name === 'picture') {
            // Change the tagName to div in the block attributes
            $attrs['tagName'] = 'div';
            
            // Add data-tagname="picture" to preserve original element type
            if (!isset($attrs['htmlAttributes'])) {
                $attrs['htmlAttributes'] = array();
            }
            $attrs['htmlAttributes']['data-tagname'] = 'picture';
            
            // Update tag_name for HTML generation
            $tag_name = 'div';
        }
        
        // Convert child elements
        $inner_blocks = array();
        $inner_content = array();
        
        // Build opening tag
        $opening_tag = $this->build_opening_tag($tag_name, $attrs);
        $closing_tag = "</{$tag_name}>";
        
        // Add opening tag to inner content
        $inner_content[] = $opening_tag;
        
        foreach ($element->childNodes as $child) {
            if ($child->nodeType === XML_ELEMENT_NODE) {
                $child_block = $this->convert_element_to_block($child, $options);
                if ($child_block) {
                    $inner_blocks[] = $child_block;
                    $inner_content[] = null; // Placeholder for child block
                }
            } elseif ($child->nodeType === XML_TEXT_NODE) {
                $text = trim($child->textContent);
                if (!empty($text)) {
                    // Create a text block for orphaned text instead of raw text
                    $text_block = $this->create_orphaned_text_block($text, $options);
                    $inner_blocks[] = $text_block;
                    $inner_content[] = null; // Placeholder for text block
                }
            }
        }
        
        // Add closing tag to inner content
        $inner_content[] = $closing_tag;
        
        // Build full innerHTML
        $innerHTML = $opening_tag;
        foreach ($inner_content as $item) {
            if ($item !== null && $item !== $opening_tag && $item !== $closing_tag) {
                $innerHTML .= $item;
            }
        }
        $innerHTML .= $closing_tag;
        
        return array(
            'blockName' => 'generateblocks/element',
            'attrs' => $attrs,
            'innerBlocks' => $inner_blocks,
            'innerHTML' => $innerHTML,
            'innerContent' => $inner_content,
        );
    }

    /**
     * Create GenerateBlocks text block from element
     *
     * @param DOMElement $element DOM element
     * @param array $options Conversion options
     * @return array Block data
     */
    private function create_text_block_from_element($element, $options) {
        $tag_name = strtolower($element->tagName);
        $attrs = $this->extract_attributes($element, 'generateblocks/text', $options);
        $content = $attrs['content'];
        
        // Build innerHTML using the same logic as build_inner_html
        $classes = array();
        
        // Add className first (GenerateBlocks base class)
        if (isset($attrs['className'])) {
            $classes[] = $attrs['className'];
        }
        
        // Add globalClasses (CSS classes from original HTML)
        if (isset($attrs['globalClasses'])) {
            $classes = array_merge($classes, $attrs['globalClasses']);
        }
        
        // Remove duplicates and filter empty values
        $classes = array_unique(array_filter($classes));
        
        $class_attr = '';
        if (!empty($classes)) {
            $class_attr = 'class="' . esc_attr(implode(' ', $classes)) . '"';
        }
        
        // Add HTML attributes
        $html_attrs = '';
        if (!empty($attrs['htmlAttributes'])) {
            foreach ($attrs['htmlAttributes'] as $key => $value) {
                $html_attrs .= ' ' . esc_attr($key) . '="' . esc_attr($value) . '"';
            }
        }
        
        $innerHTML = "<{$tag_name} {$class_attr}{$html_attrs}>{$content}</{$tag_name}>";
        
        return array(
            'blockName' => 'generateblocks/text',
            'attrs' => $attrs,
            'innerBlocks' => array(),
            'innerHTML' => $innerHTML,
            'innerContent' => array($innerHTML),
        );
    }

    /**
     * Create text block from string content
     *
     * @param string $content Text content
     * @param array $options Conversion options
     * @return array Block data
     */
    private function create_text_block($content, $options) {
        // Create a fake element for attribute extraction
        $dom = new DOMDocument();
        $element = $dom->createElement('p');
        $element->textContent = $content;
        
        $attrs = $this->extract_attributes($element, 'generateblocks/text', $options);
        $attrs['content'] = esc_html($content);
        
        $innerHTML = '<p class="gb-text">' . esc_html($content) . '</p>';
        
        return array(
            'blockName' => 'generateblocks/text',
            'attrs' => $attrs,
            'innerBlocks' => array(),
            'innerHTML' => $innerHTML,
            'innerContent' => array($innerHTML),
        );
    }

    /**
     * Create text block for orphaned text within element blocks
     *
     * @param string $content Text content
     * @param array $options Conversion options
     * @return array Block data
     */
    private function create_orphaned_text_block($content, $options) {
        // Create a fake span element for attribute extraction
        $dom = new DOMDocument();
        $element = $dom->createElement('span');
        $element->textContent = $content;
        
        $attrs = $this->extract_attributes($element, 'generateblocks/text', $options);
        $attrs['content'] = esc_html($content);
        $attrs['tagName'] = 'span'; // Force span tag for orphaned text
        
        $innerHTML = '<span class="gb-text">' . esc_html($content) . '</span>';
        
        return array(
            'blockName' => 'generateblocks/text',
            'attrs' => $attrs,
            'innerBlocks' => array(),
            'innerHTML' => $innerHTML,
            'innerContent' => array($innerHTML),
        );
    }

    /**
     * Process children of filtered elements (like source tags)
     * Returns the first valid child block found
     *
     * @param DOMElement $element DOM element being filtered
     * @param array $options Conversion options
     * @return array|null Block data or null if no valid children
     */
    private function process_filtered_element_children($element, $options) {
        foreach ($element->childNodes as $child) {
            if ($child->nodeType === XML_ELEMENT_NODE) {
                $child_block = $this->convert_element_to_block($child, $options);
                if ($child_block) {
                    return $child_block; // Return first valid child
                }
            }
        }
        return null;
    }

    /**
     * Create GenerateBlocks media block
     *
     * @param DOMElement $element DOM element (img)
     * @param array $options Conversion options
     * @return array Block data
     */
    private function create_media_block($element, $options) {
        $attrs = $this->extract_attributes($element, 'generateblocks/media', $options);
        
        // Override htmlAttributes with image-specific attributes
        $html_attrs = array();
        
        if ($element->hasAttribute('src')) {
            $html_attrs['src'] = $element->getAttribute('src');
        }
        
        if ($element->hasAttribute('alt')) {
            $html_attrs['alt'] = $element->getAttribute('alt');
        }
        
        if ($element->hasAttribute('width')) {
            $html_attrs['width'] = $element->getAttribute('width');
        }
        
        if ($element->hasAttribute('height')) {
            $html_attrs['height'] = $element->getAttribute('height');
        }
        
        if ($element->hasAttribute('loading')) {
            $html_attrs['loading'] = $element->getAttribute('loading');
        }
        
        if ($element->hasAttribute('srcset')) {
            $html_attrs['srcset'] = $element->getAttribute('srcset');
        }
        
        if (!empty($html_attrs)) {
            $attrs['htmlAttributes'] = $html_attrs;
        }
        
        return array(
            'blockName' => 'generateblocks/media',
            'attrs' => $attrs,
            'innerBlocks' => array(),
            'innerHTML' => '',
            'innerContent' => array(),
        );
    }

    /**
     * Create WordPress HTML block fallback
     *
     * @param DOMElement $element DOM element
     * @param array $options Conversion options
     * @return array Block data
     */
    private function create_html_fallback_block($element, $options) {
        $html = $element->ownerDocument->saveHTML($element);
        
        return array(
            'blockName' => 'core/html',
            'attrs' => array(),
            'innerBlocks' => array(),
            'innerHTML' => $html,
            'innerContent' => array($html),
        );
    }

    /**
     * Extract attributes for block based on element and block type
     * Following proper GenerateBlocks attribute ordering
     *
     * @param DOMElement $element DOM element
     * @param string $block_type Block type
     * @param array $options Conversion options
     * @return array Block attributes
     */
    private function extract_attributes($element, $block_type, $options) {
        $attrs = array();
        
        // 1. uniqueId - Always first
        if ($options['generate_unique_ids']) {
            $attrs['uniqueId'] = $this->generate_unique_id();
        }
        
        // 2. tagName - HTML element type
        if ($block_type === 'generateblocks/element' || $block_type === 'generateblocks/text') {
            $attrs['tagName'] = strtolower($element->tagName);
        }
        
        // 3. content - For text blocks
        if ($block_type === 'generateblocks/text') {
            $attrs['content'] = $this->extract_text_content($element);
        }
        
        // 4. className - GenerateBlocks default classes
        if (isset($this->default_attributes[$block_type]['className'])) {
            $attrs['className'] = $this->default_attributes[$block_type]['className'];
        }
        
        // 5. globalClasses - CSS classes from HTML
        $classes = $this->extract_css_classes($element, $options);
        if (!empty($classes)) {
            $attrs['globalClasses'] = $classes;
        }
        
        // 6. htmlAttributes - Custom HTML attributes
        $html_attrs = $this->extract_html_attributes($element, $options);
        if (!empty($html_attrs)) {
            $attrs['htmlAttributes'] = $html_attrs;
        }
        
        // 7. metadata - Block identification (last)
        $attrs['metadata'] = array(
            'name' => ucfirst($element->tagName) . ' ' . ($block_type === 'generateblocks/text' ? 'Text' : 'Element'),
        );
        
        return $attrs;
    }

    /**
     * Extract CSS classes from element
     *
     * @param DOMElement $element DOM element
     * @param array $options Conversion options
     * @return array CSS classes
     */
    private function extract_css_classes($element, $options) {
        if (!$options['preserve_classes'] || !$element->hasAttribute('class')) {
            return array();
        }
        
        $class_string = $element->getAttribute('class');
        $classes = array_filter(array_map('trim', explode(' ', $class_string)));
        
        return $classes;
    }

    /**
     * Extract HTML attributes from element
     *
     * @param DOMElement $element DOM element
     * @param array $options Conversion options
     * @return array HTML attributes
     */
    private function extract_html_attributes($element, $options) {
        $attrs = array();
        
        // Always check for ID first - direct method
        if ($element->hasAttribute('id')) {
            $attrs['id'] = $element->getAttribute('id');
        }
        
        foreach ($element->attributes as $attr) {
            $name = $attr->name;
            $value = $attr->value;
            
            // Skip class attribute (handled separately)
            if ($name === 'class') {
                continue;
            }
            
            // Skip ID if already handled above
            if ($name === 'id') {
                continue;
            }
            
            // Handle style preservation
            if ($name === 'style' && $options['preserve_styles']) {
                $attrs['style'] = $value;
                continue;
            }
            
            // Preserve ALL attributes for testing (previously only safe ones)
            $attrs[$name] = $value;
        }
        
        return $attrs;
    }

    /**
     * Extract text content from element
     *
     * @param DOMElement $element DOM element
     * @return string Text content
     */
    private function extract_text_content($element) {
        // For simple text elements, get the text content
        if (in_array(strtolower($element->tagName), array('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button'))) {
            return trim($element->textContent);
        }
        
        // For links, preserve the text but note the href
        if (strtolower($element->tagName) === 'a') {
            return trim($element->textContent);
        }
        
        return trim($element->textContent);
    }

    /**
     * Generate unique ID for blocks
     *
     * @return string Unique ID
     */
    private function generate_unique_id() {
        return wp_generate_uuid4();
    }

    /**
     * Build opening tag for elements
     *
     * @param string $tag_name HTML tag name
     * @param array $attrs Block attributes
     * @return string Opening tag
     */
    private function build_opening_tag($tag_name, $attrs) {
        $classes = array();
        
        // Add className first (GenerateBlocks base class)
        if (isset($attrs['className'])) {
            $classes[] = $attrs['className'];
        }
        
        // Add globalClasses (CSS classes from original HTML)
        if (isset($attrs['globalClasses'])) {
            $classes = array_merge($classes, $attrs['globalClasses']);
        }
        
        // Remove duplicates and filter empty values
        $classes = array_unique(array_filter($classes));
        
        $class_attr = '';
        if (!empty($classes)) {
            $class_attr = 'class="' . esc_attr(implode(' ', $classes)) . '"';
        }
        
        $html_attrs = '';
        if (isset($attrs['htmlAttributes'])) {
            foreach ($attrs['htmlAttributes'] as $key => $value) {
                $html_attrs .= ' ' . esc_attr($key) . '="' . esc_attr($value) . '"';
            }
        }
        
        return "<{$tag_name} {$class_attr}{$html_attrs}>";
    }

    /**
     * Build inner HTML for element blocks
     *
     * @param string $tag_name HTML tag name
     * @param array $attrs Block attributes
     * @param array $inner_content Inner content array
     * @return string Inner HTML
     */
    private function build_inner_html($tag_name, $attrs, $inner_content) {
        $classes = array();
        
        // Add className first (GenerateBlocks base class)
        if (isset($attrs['className'])) {
            $classes[] = $attrs['className'];
        }
        
        // Add globalClasses (CSS classes from original HTML)
        if (isset($attrs['globalClasses'])) {
            $classes = array_merge($classes, $attrs['globalClasses']);
        }
        
        // Remove duplicates and filter empty values
        $classes = array_unique(array_filter($classes));
        
        $class_attr = '';
        if (!empty($classes)) {
            $class_attr = 'class="' . esc_attr(implode(' ', $classes)) . '"';
        }
        
        $html_attrs = '';
        if (isset($attrs['htmlAttributes'])) {
            foreach ($attrs['htmlAttributes'] as $key => $value) {
                $html_attrs .= ' ' . esc_attr($key) . '="' . esc_attr($value) . '"';
            }
        }
        
        $content = '';
        if (is_array($inner_content)) {
            foreach ($inner_content as $item) {
                if ($item !== null) {
                    $content .= $item;
                }
            }
        }
        
        return "<{$tag_name} {$class_attr}{$html_attrs}>{$content}</{$tag_name}>";
    }

    /**
     * Generate block markup from block data (minified)
     *
     * @param array $blocks Array of block data
     * @return string Block markup
     */
    private function generate_block_markup($blocks) {
        $markup = '';
        
        foreach ($blocks as $block) {
            $markup .= $this->serialize_block($block);
        }
        
        return $markup;
    }

    /**
     * Serialize block to markup format with proper spacing
     *
     * @param array $block Block data
     * @return string Block markup
     */
    private function serialize_block($block) {
        $block_name = $block['blockName'];
        $attrs = $block['attrs'];
        $inner_blocks = $block['innerBlocks'];
        $inner_content = $block['innerContent'];
        
        // Build attribute string
        $attr_string = '';
        if (!empty($attrs)) {
            $attr_string = ' ' . wp_json_encode($attrs, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
        
        // Handle self-closing blocks (media, shape blocks)
        if (empty($inner_blocks) && empty($inner_content)) {
            return "<!-- wp:{$block_name}{$attr_string} /-->";
        }
        
        // Build content using innerContent array like in correct.html
        $content = '';
        $child_index = 0;
        
        foreach ($inner_content as $item) {
            if ($item === null) {
                // This is a placeholder for a child block
                if (isset($inner_blocks[$child_index])) {
                    $child_block = $this->serialize_block($inner_blocks[$child_index]);
                    $content .= $child_block . "\n";
                    $child_index++;
                }
            } else {
                // This is actual HTML content - add line break after opening tags
                if (preg_match('/^<(\w+)[^>]*>$/', $item)) {
                    $content .= $item . "\n";
                } else {
                    $content .= $item;
                }
            }
        }
        
        // Remove trailing newline before closing comment
        $content = rtrim($content, "\n");
        
        return "<!-- wp:{$block_name}{$attr_string} -->\n{$content}\n<!-- /wp:{$block_name} -->";
    }

    /**
     * Get conversion statistics
     *
     * @param array $blocks Array of block data
     * @return array Conversion statistics
     */
    private function get_conversion_stats($blocks) {
        $stats = array(
            'total_blocks' => 0,
            'generateblocks_blocks' => 0,
            'html_fallback_blocks' => 0,
            'block_types' => array(),
        );
        
        $this->count_blocks_recursive($blocks, $stats);
        
        return $stats;
    }

    /**
     * Count blocks recursively for statistics
     *
     * @param array $blocks Array of block data
     * @param array &$stats Statistics array (passed by reference)
     */
    private function count_blocks_recursive($blocks, &$stats) {
        foreach ($blocks as $block) {
            $stats['total_blocks']++;
            
            $block_name = $block['blockName'];
            
            if (strpos($block_name, 'generateblocks/') === 0) {
                $stats['generateblocks_blocks']++;
            } elseif ($block_name === 'core/html') {
                $stats['html_fallback_blocks']++;
            }
            
            if (!isset($stats['block_types'][$block_name])) {
                $stats['block_types'][$block_name] = 0;
            }
            $stats['block_types'][$block_name]++;
            
            if (!empty($block['innerBlocks'])) {
                $this->count_blocks_recursive($block['innerBlocks'], $stats);
            }
        }
    }

    /**
     * Create error response
     *
     * @param string $message Error message
     * @return array Error response
     */
    private function create_error_response($message) {
        return array(
            'success' => false,
            'error' => $message,
            'blocks' => array(),
            'markup' => '',
        );
    }
}