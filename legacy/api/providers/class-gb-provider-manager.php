<?php
/**
 * Provider Manager
 *
 * Manages and coordinates all block conversion providers
 *
 * @package GB_APIs
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Provider Manager Class
 */
class GB_Provider_Manager {
    
    /**
     * Registered providers
     */
    private $providers = array();
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->providers = array();
    }
    
    /**
     * Register a provider
     *
     * @param GB_Block_Provider_Interface $provider Provider instance
     */
    public function register_provider($provider) {
        if (!($provider instanceof GB_Block_Provider_Interface)) {
            return;
        }
        
        $this->providers[] = $provider;
        
        // Sort providers by priority (highest first)
        usort($this->providers, function($a, $b) {
            return $b->get_priority() - $a->get_priority();
        });
    }
    
    /**
     * Get the appropriate provider for an element
     *
     * @param DOMElement $element DOM element
     * @param array $options Conversion options
     * @return GB_Block_Provider_Interface|null Provider or null if none found
     */
    public function get_provider_for_element($element, $options) {
        foreach ($this->providers as $provider) {
            if ($provider->can_handle($element, $options)) {
                return $provider;
            }
        }
        
        return null;
    }
    
    /**
     * Convert element using appropriate provider
     *
     * @param DOMElement $element DOM element
     * @param array $options Conversion options
     * @return array|null Block data or null if no provider found
     */
    public function convert_element($element, $options) {
        $provider = $this->get_provider_for_element($element, $options);
        
        if (!$provider) {
            return null;
        }
        
        return $provider->convert($element, $options);
    }
    
    /**
     * Get all registered providers
     *
     * @return array Array of provider instances
     */
    public function get_providers() {
        return $this->providers;
    }
    
    /**
     * Clear all registered providers
     */
    public function clear_providers() {
        $this->providers = array();
    }
}