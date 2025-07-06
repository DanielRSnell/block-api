<?php
/**
 * Base Block Provider
 *
 * Abstract base class providing common functionality for all providers
 *
 * @package GB_APIs
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Abstract base provider class
 */
abstract class GB_Base_Provider implements GB_Block_Provider_Interface {
    
    /**
     * Default attributes for different block types
     */
    protected $default_attributes = array(
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
        'generateblocks/query' => array(
            'className' => 'gb-query',
        ),
        'generateblocks/looper' => array(
            'className' => 'gb-looper',
        ),
        'generateblocks/loop-item' => array(
            'className' => 'gb-loop-item',
        ),
        'generateblocks/query-page-numbers' => array(
            'className' => 'gb-query-pagination',
        ),
        'generateblocks/query-no-results' => array(
            'className' => 'gb-query-no-results',
        ),
        'generateblocks-pro/accordion' => array(
            'className' => 'gb-accordion',
        ),
        'generateblocks-pro/accordion-item' => array(
            'className' => 'gb-accordion__item',
        ),
        'generateblocks-pro/accordion-toggle' => array(
            'className' => 'gb-accordion__toggle',
        ),
        'generateblocks-pro/accordion-content' => array(
            'className' => 'gb-accordion__content',
        ),
        'generateblocks-pro/tabs' => array(
            'className' => 'gb-tabs',
        ),
        'generateblocks-pro/tabs-menu' => array(
            'className' => 'gb-tabs__menu',
        ),
        'generateblocks-pro/tab-menu-item' => array(
            'className' => 'gb-tabs__menu-item',
        ),
        'generateblocks-pro/tab-items' => array(
            'className' => 'gb-tabs__items',
        ),
        'generateblocks-pro/tab-item' => array(
            'className' => 'gb-tabs__item',
        ),
    );
    
    /**
     * Extract attributes for block based on element and block type
     *
     * @param DOMElement $element DOM element
     * @param string $block_type Block type
     * @param array $options Conversion options
     * @return array Block attributes
     */
    protected function extract_attributes($element, $block_type, $options) {
        $attrs = array();
        
        // 1. uniqueId - Always first
        if ($options['generate_unique_ids']) {
            $attrs['uniqueId'] = $this->generate_unique_id();
        }
        
        // 2. tagName - HTML element type
        if ($block_type === 'generateblocks/element' || $block_type === 'generateblocks/text' || $block_type === 'generateblocks/media') {
            $attrs['tagName'] = strtolower($element->tagName);
        }
        
        // 3. globalClasses - CSS classes from HTML (before content to avoid duplication)
        $classes = $this->extract_css_classes($element, $options);
        if (!empty($classes)) {
            $attrs['globalClasses'] = $classes;
        }
        
        // 4. content - For text blocks
        if ($block_type === 'generateblocks/text') {
            $attrs['content'] = $this->extract_text_content($element);
        }
        
        // 5. htmlAttributes - Custom HTML attributes
        $html_attrs = $this->extract_html_attributes($element, $options);
        if (!empty($html_attrs)) {
            $attrs['htmlAttributes'] = $html_attrs;
        }
        
        // 6. blockId - GenerateBlocks block identifier (recovery expects this before metadata)
        $attrs['blockId'] = 'block-' . substr($attrs['uniqueId'], 0, 8) . '-' . substr(md5(time() . rand()), 0, 8);
        
        // 7. metadata - Block identification
        $attrs['metadata'] = array(
            'name' => ucfirst($element->tagName) . ' ' . ($block_type === 'generateblocks/text' ? 'Text' : 'Element'),
        );
        
        // 8. className - GenerateBlocks default classes (last to avoid duplication in HTML)
        // Note: Some blocks should not have className attribute (based on recovery analysis)
        $blocks_without_classname = array(
            'generateblocks/loop-item', 
            'generateblocks/media',
            'generateblocks-pro/accordion',
            'generateblocks-pro/accordion-item',
            'generateblocks-pro/accordion-content'
        );
        if (isset($this->default_attributes[$block_type]['className']) && !in_array($block_type, $blocks_without_classname)) {
            $attrs['className'] = $this->default_attributes[$block_type]['className'];
        }
        
        
        return $attrs;
    }
    
    /**
     * Generate unique ID for blocks
     *
     * @return string Unique ID
     */
    protected function generate_unique_id() {
        return wp_generate_uuid4();
    }
    
    
    /**
     * Extract CSS classes from element
     *
     * @param DOMElement $element DOM element
     * @param array $options Conversion options
     * @return array CSS classes
     */
    protected function extract_css_classes($element, $options) {
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
    protected function extract_html_attributes($element, $options) {
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
    protected function extract_text_content($element) {
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
     * Build opening tag for elements
     *
     * @param string $tag_name HTML tag name
     * @param array $attrs Block attributes
     * @return string Opening tag
     */
    protected function build_opening_tag($tag_name, $attrs, $block_type = null) {
        $classes = array();
        
        // Add className FIRST (GenerateBlocks base class comes first in recovery)
        if (isset($attrs['className'])) {
            $classes[] = $attrs['className'];
        } else {
            // If no className in JSON, add the default GB class directly to HTML (recovery pattern)
            $default_class = $this->get_default_class_for_block_type($block_type);
            if ($default_class) {
                $classes[] = $default_class;
            }
        }
        
        // Add globalClasses after (CSS classes from original HTML)
        if (isset($attrs['globalClasses'])) {
            $classes = array_merge($classes, $attrs['globalClasses']);
        }
        
        // For text blocks, add className again to match recovery duplication pattern
        if (isset($attrs['className']) && $attrs['className'] === 'gb-text') {
            $classes[] = $attrs['className'];
        }
        
        // Remove duplicates and filter empty values (but keep the gb-text duplication)
        $filtered_classes = array_filter($classes);
        
        $class_attr = '';
        if (!empty($filtered_classes)) {
            $class_attr = 'class="' . esc_attr(implode(' ', $filtered_classes)) . '"';
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
     * Get default GenerateBlocks class for a block type
     */
    protected function get_default_class_for_block_type($block_type) {
        if (!$block_type || !isset($this->default_attributes[$block_type]['className'])) {
            return null;
        }
        return $this->default_attributes[$block_type]['className'];
    }
    
    /**
     * Analyze element content to determine appropriate block type
     *
     * @param DOMElement $element DOM element
     * @return string Content type (text_only, child_elements, mixed_content, empty)
     */
    protected function analyze_element_content($element) {
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
}