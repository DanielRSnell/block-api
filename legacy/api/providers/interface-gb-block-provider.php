<?php
/**
 * Block Provider Interface
 *
 * Defines the contract for all block conversion providers
 *
 * @package GB_APIs
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Interface for block conversion providers
 */
interface GB_Block_Provider_Interface {
    
    /**
     * Determine if this provider can handle the given element
     *
     * @param DOMElement $element DOM element to check
     * @param array $options Conversion options
     * @return bool True if this provider can handle the element
     */
    public function can_handle($element, $options);
    
    /**
     * Convert the element to a GenerateBlocks block
     *
     * @param DOMElement $element DOM element to convert
     * @param array $options Conversion options
     * @return array|null Block data or null if conversion fails
     */
    public function convert($element, $options);
    
    /**
     * Get the priority of this provider (higher = more specific)
     *
     * @return int Priority value
     */
    public function get_priority();
    
    /**
     * Get array of supported element types
     *
     * @return array Supported HTML element names
     */
    public function get_supported_elements();
}