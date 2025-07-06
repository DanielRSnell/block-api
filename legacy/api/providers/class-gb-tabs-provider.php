<?php
/**
 * Tabs Provider
 *
 * Handles conversion of tabs elements to GenerateBlocks Pro tabs blocks
 *
 * @package GB_APIs
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Tabs Provider Class
 */
class GB_Tabs_Provider extends GB_Base_Provider {
    
    /**
     * Tabs element mappings to GenerateBlocks Pro (1:1 alignment)
     */
    private $tabs_element_mappings = array(
        'tabs' => array(
            'block_type' => 'generateblocks-pro/tabs',
            'tag_name' => 'div'
        ),
        'tabs-menu' => array(
            'block_type' => 'generateblocks-pro/tabs-menu',
            'tag_name' => 'div'
        ),
        'tab-menu-item' => array(
            'block_type' => 'generateblocks-pro/tab-menu-item',
            'tag_name' => 'div'
        ),
        'tab-items' => array(
            'block_type' => 'generateblocks-pro/tab-items',
            'tag_name' => 'div'
        ),
        'tab-item' => array(
            'block_type' => 'generateblocks-pro/tab-item',
            'tag_name' => 'div'
        ),
    );
    
    /**
     * Determine if this provider can handle the given element
     *
     * @param DOMElement $element DOM element to check
     * @param array $options Conversion options
     * @return bool True if this provider can handle the element
     */
    public function can_handle($element, $options) {
        $tag_name = strtolower($element->tagName);
        return isset($this->tabs_element_mappings[$tag_name]);
    }
    
    /**
     * Convert the element to a GenerateBlocks Pro tabs block
     *
     * @param DOMElement $element DOM element to convert
     * @param array $options Conversion options
     * @return array Block data
     */
    public function convert($element, $options) {
        $tag_name = strtolower($element->tagName);
        $mapping = $this->tabs_element_mappings[$tag_name];
        $block_type = $mapping['block_type'];
        
        // Handle different tab block types
        switch ($block_type) {
            case 'generateblocks-pro/tabs':
                return $this->convert_tabs($element, $mapping, $options);
                
            case 'generateblocks-pro/tabs-menu':
                return $this->convert_tabs_menu($element, $mapping, $options);
                
            case 'generateblocks-pro/tab-menu-item':
                return $this->convert_tab_menu_item($element, $mapping, $options);
                
            case 'generateblocks-pro/tab-items':
                return $this->convert_tab_items($element, $mapping, $options);
                
            case 'generateblocks-pro/tab-item':
                return $this->convert_tab_item($element, $mapping, $options);
                
            default:
                return null;
        }
    }
    
    /**
     * Convert tabs element (main container)
     */
    private function convert_tabs($element, $mapping, $options) {
        $attrs = $this->extract_tabs_attributes($element, $mapping['block_type'], $options);
        
        // Add data-opened-tab attribute for the first tab
        $attrs['htmlAttributes'] = array_merge(
            isset($attrs['htmlAttributes']) ? $attrs['htmlAttributes'] : array(),
            array('data-opened-tab' => '1')
        );
        
        $tag_name = $mapping['tag_name'];
        $opening_tag = $this->build_opening_tag($tag_name, $attrs, $mapping['block_type']);
        $closing_tag = "</{$tag_name}>";
        
        return array(
            'blockName' => $mapping['block_type'],
            'attrs' => $attrs,
            'innerBlocks' => array(),
            'innerHTML' => $opening_tag . $closing_tag,
            'innerContent' => array($opening_tag, null, $closing_tag),
        );
    }
    
    /**
     * Convert tabs-menu element
     */
    private function convert_tabs_menu($element, $mapping, $options) {
        $attrs = $this->extract_tabs_attributes($element, $mapping['block_type'], $options);
        
        // Add role="tablist" for accessibility
        $attrs['htmlAttributes'] = array_merge(
            isset($attrs['htmlAttributes']) ? $attrs['htmlAttributes'] : array(),
            array('role' => 'tablist')
        );
        
        $tag_name = $mapping['tag_name'];
        $opening_tag = $this->build_opening_tag($tag_name, $attrs, $mapping['block_type']);
        $closing_tag = "</{$tag_name}>";
        
        return array(
            'blockName' => $mapping['block_type'],
            'attrs' => $attrs,
            'innerBlocks' => array(),
            'innerHTML' => $opening_tag . $closing_tag,
            'innerContent' => array($opening_tag, null, $closing_tag),
        );
    }
    
    /**
     * Convert tab-menu-item element
     */
    private function convert_tab_menu_item($element, $mapping, $options) {
        $attrs = $this->extract_tabs_attributes($element, $mapping['block_type'], $options);
        
        // Generate unique ID for the tab menu item
        $unique_id = isset($attrs['uniqueId']) ? $attrs['uniqueId'] : $this->generate_short_unique_id();
        $tab_id = 'gb-tab-menu-item-' . $unique_id;
        
        // Add accessibility attributes and ID
        $attrs['htmlAttributes'] = array_merge(
            isset($attrs['htmlAttributes']) ? $attrs['htmlAttributes'] : array(),
            array(
                'role' => 'tab',
                'id' => $tab_id
            )
        );
        
        // Check if this is the first/active tab
        $is_first_tab = $this->is_first_tab_menu_item($element);
        if ($is_first_tab) {
            $attrs['tabItemOpen'] = true;
        }
        
        $tag_name = $mapping['tag_name'];
        $opening_tag = $this->build_opening_tag($tag_name, $attrs, $mapping['block_type']);
        $closing_tag = "</{$tag_name}>";
        
        return array(
            'blockName' => $mapping['block_type'],
            'attrs' => $attrs,
            'innerBlocks' => array(),
            'innerHTML' => $opening_tag . $closing_tag,
            'innerContent' => array($opening_tag, null, $closing_tag),
        );
    }
    
    /**
     * Convert tab-items element (content container)
     */
    private function convert_tab_items($element, $mapping, $options) {
        $attrs = $this->extract_tabs_attributes($element, $mapping['block_type'], $options);
        
        // Add role="tabpanel" for accessibility
        $attrs['htmlAttributes'] = array_merge(
            isset($attrs['htmlAttributes']) ? $attrs['htmlAttributes'] : array(),
            array('role' => 'tabpanel')
        );
        
        $tag_name = $mapping['tag_name'];
        $opening_tag = $this->build_opening_tag($tag_name, $attrs, $mapping['block_type']);
        $closing_tag = "</{$tag_name}>";
        
        return array(
            'blockName' => $mapping['block_type'],
            'attrs' => $attrs,
            'innerBlocks' => array(),
            'innerHTML' => $opening_tag . $closing_tag,
            'innerContent' => array($opening_tag, null, $closing_tag),
        );
    }
    
    /**
     * Convert tab-item element (individual tab content)
     */
    private function convert_tab_item($element, $mapping, $options) {
        $attrs = $this->extract_tabs_attributes($element, $mapping['block_type'], $options);
        
        // Generate unique ID for the tab item
        $unique_id = isset($attrs['uniqueId']) ? $attrs['uniqueId'] : $this->generate_short_unique_id();
        $tab_item_id = 'gb-tab-item-' . $unique_id;
        
        // Add ID attribute
        $attrs['htmlAttributes'] = array_merge(
            isset($attrs['htmlAttributes']) ? $attrs['htmlAttributes'] : array(),
            array('id' => $tab_item_id)
        );
        
        // Check if this is the first/active tab content
        $is_first_tab = $this->is_first_tab_item($element);
        if ($is_first_tab) {
            $attrs['tabItemOpen'] = true;
        }
        
        $tag_name = $mapping['tag_name'];
        $opening_tag = $this->build_opening_tag($tag_name, $attrs, $mapping['block_type']);
        $closing_tag = "</{$tag_name}>";
        
        return array(
            'blockName' => $mapping['block_type'],
            'attrs' => $attrs,
            'innerBlocks' => array(),
            'innerHTML' => $opening_tag . $closing_tag,
            'innerContent' => array($opening_tag, null, $closing_tag),
        );
    }
    
    /**
     * Extract attributes for tabs elements
     */
    private function extract_tabs_attributes($element, $block_type, $options) {
        $attrs = array();
        
        // 1. uniqueId - Generate short alphanumeric ID
        $unique_id = $this->generate_short_unique_id();
        $attrs['uniqueId'] = $unique_id;
        
        // 2. tagName - Use proper HTML tag for the block type
        $tag_map = array(
            'tabs' => 'div',
            'tabs-menu' => 'div', 
            'tab-menu-item' => 'div',
            'tab-items' => 'div',
            'tab-item' => 'div'
        );
        $element_name = strtolower($element->tagName);
        $attrs['tagName'] = isset($tag_map[$element_name]) ? $tag_map[$element_name] : 'div';
        
        // 3. globalClasses - CSS classes from HTML
        if ($element->hasAttribute('class')) {
            $class_string = $element->getAttribute('class');
            $classes = array_filter(array_map('trim', explode(' ', $class_string)));
            if (!empty($classes)) {
                $attrs['globalClasses'] = $classes;
            }
        }
        
        // 4. htmlAttributes - Custom HTML attributes (excluding certain ones)
        $html_attrs = array();
        foreach ($element->attributes as $attr) {
            $name = $attr->name;
            $value = $attr->value;
            
            // Skip attributes that are handled separately
            if (in_array($name, array('class'))) {
                continue;
            }
            
            $html_attrs[$name] = $value;
        }
        
        if (!empty($html_attrs)) {
            $attrs['htmlAttributes'] = $html_attrs;
        }
        
        // 5. blockId - GenerateBlocks format
        $attrs['blockId'] = 'block-' . substr($unique_id, 0, 8) . '-' . substr($unique_id, 0, 4) . '-4' . substr($unique_id, 4, 3) . '-' . substr($unique_id, 0, 4) . '-' . substr(md5($unique_id), 0, 12);
        
        // 6. metadata - Block identification
        $block_name = str_replace('generateblocks-pro/', '', $block_type);
        $attrs['metadata'] = array(
            'name' => ucfirst(str_replace('-', ' ', $block_name)) . ' Element',
        );
        
        return $attrs;
    }
    
    /**
     * Generate short unique ID like GenerateBlocks uses
     */
    private function generate_short_unique_id() {
        return substr(md5(uniqid() . mt_rand()), 0, 8);
    }
    
    /**
     * Check if this is the first tab menu item (should be active)
     */
    private function is_first_tab_menu_item($element) {
        $parent = $element->parentNode;
        if (!$parent) {
            return false;
        }
        
        // Find the first tab-menu-item in the parent
        foreach ($parent->childNodes as $child) {
            if ($child->nodeType === XML_ELEMENT_NODE && strtolower($child->tagName) === 'tab-menu-item') {
                return $child === $element;
            }
        }
        
        return false;
    }
    
    /**
     * Check if this is the first tab item (should be active)
     */
    private function is_first_tab_item($element) {
        $parent = $element->parentNode;
        if (!$parent) {
            return false;
        }
        
        // Find the first tab-item in the parent
        foreach ($parent->childNodes as $child) {
            if ($child->nodeType === XML_ELEMENT_NODE && strtolower($child->tagName) === 'tab-item') {
                return $child === $element;
            }
        }
        
        return false;
    }
    
    /**
     * Get the priority of this provider (higher = more specific)
     *
     * @return int Priority value
     */
    public function get_priority() {
        return 75; // Same as custom element provider
    }
    
    /**
     * Get array of supported element types
     *
     * @return array Supported element names
     */
    public function get_supported_elements() {
        return array_keys($this->tabs_element_mappings);
    }
}