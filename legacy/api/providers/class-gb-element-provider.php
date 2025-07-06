<?php
/**
 * Element Block Provider
 *
 * Handles conversion of container elements to generateblocks/element blocks
 *
 * @package GB_APIs
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Element Provider Class
 */
class GB_Element_Provider extends GB_Base_Provider {
    
    /**
     * Elements that are always element blocks
     */
    private $always_element_elements = array(
        // Structural elements (always container blocks regardless of content)
        'div', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main', 'figure',
        
        // List containers (always element blocks)
        'ul', 'ol', 'dl',
        
        // Form elements (always element blocks)
        'form', 'input', 'textarea', 'select',
        
        // Media/embed elements (always element blocks)
        'iframe', 'video', 'audio', 'canvas', 'svg', 'picture',
        
        
        // Table elements (always element blocks)
        'table', 'tr', 'td', 'th',
        
        // Self-closing elements (always element blocks)
        'hr', 'br',
        
        // Script/style elements (always element blocks)
        'script', 'style'
    );
    
    /**
     * Elements that can be element blocks based on content analysis
     */
    private $conditional_element_elements = array('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'dt', 'dd', 'figcaption');
    
    /**
     * Determine if this provider can handle the given element
     *
     * @param DOMElement $element DOM element to check
     * @param array $options Conversion options
     * @return bool True if this provider can handle the element
     */
    public function can_handle($element, $options) {
        $tag_name = strtolower($element->tagName);
        
        // Always handle certain elements as element blocks
        if (in_array($tag_name, $this->always_element_elements)) {
            return true;
        }
        
        // For other elements, check if they have child elements or mixed content
        if ($options['semantic_mapping'] && in_array($tag_name, $this->conditional_element_elements)) {
            $content_type = $this->analyze_element_content($element);
            return in_array($content_type, array('child_elements', 'mixed_content', 'empty'));
        }
        
        // Fallback - handle any element not handled by other providers
        return true;
    }
    
    /**
     * Convert the element to a GenerateBlocks element block
     *
     * @param DOMElement $element DOM element to convert
     * @param array $options Conversion options
     * @return array Block data
     */
    public function convert($element, $options) {
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
        $opening_tag = $this->build_opening_tag($tag_name, $attrs, 'generateblocks/element');
        $closing_tag = "</{$tag_name}>";
        
        // Add opening tag to inner content
        $inner_content[] = $opening_tag;
        
        foreach ($element->childNodes as $child) {
            if ($child->nodeType === XML_ELEMENT_NODE) {
                // Child element blocks will be handled by the parent converter
                // We'll add a placeholder for now
                $inner_content[] = null; // Placeholder for child block
            } elseif ($child->nodeType === XML_TEXT_NODE) {
                $text = trim($child->textContent);
                if (!empty($text)) {
                    // Create a text block for orphaned text instead of raw text
                    // This will be handled by the parent converter
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
            'innerBlocks' => $inner_blocks, // Will be populated by parent converter
            'innerHTML' => $innerHTML,
            'innerContent' => $inner_content,
        );
    }
    
    /**
     * Get the priority of this provider (higher = more specific)
     *
     * @return int Priority value
     */
    public function get_priority() {
        return 25; // Low priority - general fallback for containers
    }
    
    /**
     * Get array of supported element types
     *
     * @return array Supported HTML element names
     */
    public function get_supported_elements() {
        return array_merge($this->always_element_elements, $this->conditional_element_elements);
    }
}