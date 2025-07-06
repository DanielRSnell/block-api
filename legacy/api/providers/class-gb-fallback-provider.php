<?php
/**
 * Fallback Block Provider
 *
 * Handles conversion of unsupported elements to core/html blocks
 *
 * @package GB_APIs
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Fallback Provider Class
 */
class GB_Fallback_Provider extends GB_Base_Provider {
    
    /**
     * Determine if this provider can handle the given element
     *
     * @param DOMElement $element DOM element to check
     * @param array $options Conversion options
     * @return bool True if this provider can handle the element
     */
    public function can_handle($element, $options) {
        // Fallback provider handles everything that other providers don't
        return true;
    }
    
    /**
     * Convert the element to a WordPress HTML block
     *
     * @param DOMElement $element DOM element to convert
     * @param array $options Conversion options
     * @return array Block data
     */
    public function convert($element, $options) {
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
     * Get the priority of this provider (higher = more specific)
     *
     * @return int Priority value
     */
    public function get_priority() {
        return 1; // Lowest priority - absolute fallback
    }
    
    /**
     * Get array of supported element types
     *
     * @return array Supported HTML element names
     */
    public function get_supported_elements() {
        return array('*'); // Supports all elements as fallback
    }
}