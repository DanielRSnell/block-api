<?php
/**
 * Text Block Provider
 *
 * Handles conversion of text elements to generateblocks/text blocks
 *
 * @package GB_APIs
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Text Provider Class
 */
class GB_Text_Provider extends GB_Base_Provider {
    
    /**
     * Elements that are always text blocks
     */
    private $always_text_elements = array('span', 'p', 'button', 'a', 'strong', 'em');
    
    /**
     * Elements that can be text blocks based on content analysis
     */
    private $conditional_text_elements = array('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'dt', 'dd', 'figcaption', 'div', 'header', 'footer', 'section', 'article', 'aside');
    
    /**
     * Determine if this provider can handle the given element
     *
     * @param DOMElement $element DOM element to check
     * @param array $options Conversion options
     * @return bool True if this provider can handle the element
     */
    public function can_handle($element, $options) {
        $tag_name = strtolower($element->tagName);
        
        // Always handle span and p elements as text blocks
        if (in_array($tag_name, $this->always_text_elements)) {
            return true;
        }
        
        // For other elements, check if semantic mapping is enabled and content is text-only
        if ($options['semantic_mapping'] && in_array($tag_name, $this->conditional_text_elements)) {
            $content_type = $this->analyze_element_content($element);
            return $content_type === 'text_only';
        }
        
        return false;
    }
    
    /**
     * Convert the element to a GenerateBlocks text block
     *
     * @param DOMElement $element DOM element to convert
     * @param array $options Conversion options
     * @return array Block data
     */
    public function convert($element, $options) {
        $tag_name = strtolower($element->tagName);
        $attrs = $this->extract_text_attributes($element, $options);
        $content = $this->extract_text_content($element);
        
        // Special handling for strong and em elements
        if ($tag_name === 'strong') {
            // Override tagName to span
            $attrs['tagName'] = 'span';
            $tag_name = 'span';
            
            // Add font-bold class to globalClasses
            if (!isset($attrs['globalClasses'])) {
                $attrs['globalClasses'] = array();
            }
            if (!in_array('font-bold', $attrs['globalClasses'])) {
                $attrs['globalClasses'][] = 'font-bold';
            }
        } elseif ($tag_name === 'em') {
            // Override tagName to span
            $attrs['tagName'] = 'span';
            $tag_name = 'span';
            
            // Add italic class to globalClasses
            if (!isset($attrs['globalClasses'])) {
                $attrs['globalClasses'] = array();
            }
            if (!in_array('italic', $attrs['globalClasses'])) {
                $attrs['globalClasses'][] = 'italic';
            }
        }
        
        // Build innerHTML using the same logic as build_opening_tag
        $classes = array();
        
        // Add globalClasses first (CSS classes from original HTML)
        if (isset($attrs['globalClasses'])) {
            $classes = array_merge($classes, $attrs['globalClasses']);
        }
        
        // Add className last (GenerateBlocks base class)
        if (isset($attrs['className'])) {
            $classes[] = $attrs['className'];
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
     * Extract attributes for text blocks (recovery-compatible format)
     */
    private function extract_text_attributes($element, $options) {
        $attrs = array();
        
        // 1. uniqueId
        if ($options['generate_unique_ids']) {
            $attrs['uniqueId'] = $this->generate_unique_id();
        }
        
        // 2. tagName
        $attrs['tagName'] = strtolower($element->tagName);
        
        // 3. globalClasses - CSS classes from HTML
        $classes = $this->extract_css_classes($element, $options);
        if (!empty($classes)) {
            $attrs['globalClasses'] = $classes;
        }
        
        // 4. htmlAttributes - Custom HTML attributes 
        $html_attrs = $this->extract_html_attributes($element, $options);
        if (!empty($html_attrs)) {
            $attrs['htmlAttributes'] = $html_attrs;
        }
        
        // 5. blockId
        $attrs['blockId'] = 'block-' . substr($attrs['uniqueId'], 0, 8) . '-' . substr(md5(time() . rand()), 0, 8);
        
        // 6. metadata
        $attrs['metadata'] = array(
            'name' => ucfirst($element->tagName) . ' Text',
        );
        
        // 7. className - GenerateBlocks default class
        $attrs['className'] = 'gb-text';
        
        // NOTE: Recovery expects NO 'content' attribute in JSON for text blocks
        // Content is embedded directly in innerHTML instead
        
        return $attrs;
    }
    
    /**
     * Get the priority of this provider (higher = more specific)
     *
     * @return int Priority value
     */
    public function get_priority() {
        return 50; // Medium priority - content analysis required
    }
    
    /**
     * Get array of supported element types
     *
     * @return array Supported HTML element names
     */
    public function get_supported_elements() {
        return array_merge($this->always_text_elements, $this->conditional_text_elements);
    }
}