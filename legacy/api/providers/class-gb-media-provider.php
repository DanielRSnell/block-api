<?php
/**
 * Media Block Provider
 *
 * Handles conversion of image elements to generateblocks/media blocks
 *
 * @package GB_APIs
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Media Provider Class
 */
class GB_Media_Provider extends GB_Base_Provider {
    
    /**
     * Supported HTML elements
     */
    private $supported_elements = array('img');
    
    /**
     * Determine if this provider can handle the given element
     *
     * @param DOMElement $element DOM element to check
     * @param array $options Conversion options
     * @return bool True if this provider can handle the element
     */
    public function can_handle($element, $options) {
        $tag_name = strtolower($element->tagName);
        return in_array($tag_name, $this->supported_elements);
    }
    
    /**
     * Convert the element to a GenerateBlocks media block
     *
     * @param DOMElement $element DOM element to convert
     * @param array $options Conversion options
     * @return array Block data
     */
    public function convert($element, $options) {
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
        
        if ($element->hasAttribute('sizes')) {
            $html_attrs['sizes'] = $element->getAttribute('sizes');
        }
        
        if (!empty($html_attrs)) {
            $attrs['htmlAttributes'] = $html_attrs;
        }
        
        // Build the img tag with proper class ordering (classes first, then other attributes)
        $img_attrs = array();
        
        // Add class attribute first (globalClasses only, no className for media blocks)
        if (isset($attrs['globalClasses']) && !empty($attrs['globalClasses'])) {
            $img_attrs[] = 'class="' . esc_attr(implode(' ', $attrs['globalClasses'])) . '"';
        }
        
        // Add other HTML attributes
        if (isset($attrs['htmlAttributes'])) {
            foreach ($attrs['htmlAttributes'] as $key => $value) {
                $img_attrs[] = esc_attr($key) . '="' . esc_attr($value) . '"';
            }
        }
        
        $img_tag = '<img ' . implode(' ', $img_attrs) . '/>';
        
        return array(
            'blockName' => 'generateblocks/media',
            'attrs' => $attrs,
            'innerBlocks' => array(),
            'innerHTML' => $img_tag,
            'innerContent' => array($img_tag),
        );
    }
    
    /**
     * Get the priority of this provider (higher = more specific)
     *
     * @return int Priority value
     */
    public function get_priority() {
        return 100; // Highest priority - very specific elements
    }
    
    /**
     * Get array of supported element types
     *
     * @return array Supported HTML element names
     */
    public function get_supported_elements() {
        return $this->supported_elements;
    }
}