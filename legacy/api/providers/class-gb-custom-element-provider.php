<?php
/**
 * Custom Element Provider
 *
 * Handles conversion of custom elements like query-root, accordion-root, etc.
 * to their corresponding GenerateBlocks structures
 *
 * @package GB_APIs
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Custom Element Provider Class
 */
class GB_Custom_Element_Provider extends GB_Base_Provider {
    
    /**
     * Custom element mappings to GenerateBlocks (1:1 alignment)
     */
    private $custom_element_mappings = array(
        // Query system - aligned with GenerateBlocks block names
        'query' => array(
            'block_type' => 'generateblocks/query',
            'required_children' => array('looper'),
            'optional_children' => array('query-page-numbers', 'query-no-results'),
            'tag_name' => 'section'
        ),
        'looper' => array(
            'block_type' => 'generateblocks/looper',
            'required_children' => array('loop-item'),
            'parent_required' => 'query',
            'tag_name' => 'div'
        ),
        'loop-item' => array(
            'block_type' => 'generateblocks/loop-item',
            'parent_required' => 'looper',
            'tag_name' => 'article'
        ),
        'query-page-numbers' => array(
            'block_type' => 'generateblocks/query-page-numbers',
            'parent_required' => 'query',
            'tag_name' => 'nav'
        ),
        'query-no-results' => array(
            'block_type' => 'generateblocks/query-no-results',
            'parent_required' => 'query',
            'tag_name' => 'div'
        ),
        
        // Accordion system (GenerateBlocks Pro) - 1:1 aligned with GenerateBlocks
        'accordion' => array(
            'block_type' => 'generateblocks-pro/accordion',
            'tag_name' => 'div'
        ),
        
        // Note: Tabs system is handled by dedicated GB_Tabs_Provider
        'accordion-item' => array(
            'block_type' => 'generateblocks-pro/accordion-item',
            'tag_name' => 'div'
        ),
        'accordion-toggle' => array(
            'block_type' => 'generateblocks-pro/accordion-toggle',
            'tag_name' => 'div'
        ),
        'accordion-content' => array(
            'block_type' => 'generateblocks-pro/accordion-content',
            'tag_name' => 'div'
        ),
    );
    
    /**
     * Query attribute mappings
     */
    private $query_attribute_mappings = array(
        'post-type' => 'query.post_type',
        'posts-per-page' => 'query.posts_per_page',
        'meta-query' => 'query.meta_query',
        'tax-query' => 'query.tax_query',
        'order-by' => 'query.orderby',
        'order' => 'query.order',
        'inherit-query' => 'inheritQuery',
        'query-id' => 'queryId'
    );
    
    /**
     * Pagination attribute mappings
     */
    private $pagination_attribute_mappings = array(
        'mid-size' => 'midSize',
        'show-all' => 'showAll'
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
        $can_handle = isset($this->custom_element_mappings[$tag_name]);
        
        // Debug: Log when we check custom elements
        if ($can_handle) {
            error_log('CUSTOM ELEMENT PROVIDER: Found custom element: ' . $tag_name);
        }
        
        return $can_handle;
    }
    
    /**
     * Convert the element to a GenerateBlocks block
     *
     * @param DOMElement $element DOM element to convert
     * @param array $options Conversion options
     * @return array Block data
     */
    public function convert($element, $options) {
        $tag_name = strtolower($element->tagName);
        $mapping = $this->custom_element_mappings[$tag_name];
        $block_type = $mapping['block_type'];
        
        // Handle different block types
        switch ($block_type) {
            case 'generateblocks/query':
                return $this->convert_query($element, $mapping, $options);
                
            case 'generateblocks/looper':
                return $this->convert_looper($element, $mapping, $options);
                
            case 'generateblocks/loop-item':
                return $this->convert_loop_item($element, $mapping, $options);
                
            case 'generateblocks/query-page-numbers':
                return $this->convert_query_page_numbers($element, $mapping, $options);
                
            case 'generateblocks/query-no-results':
                return $this->convert_query_no_results($element, $mapping, $options);
                
            // GenerateBlocks Pro Accordion blocks
            case 'generateblocks-pro/accordion':
                return $this->convert_accordion($element, $mapping, $options);
                
            case 'generateblocks-pro/accordion-item':
                return $this->convert_accordion_item_pro($element, $mapping, $options);
                
            case 'generateblocks-pro/accordion-toggle':
                return $this->convert_accordion_toggle($element, $mapping, $options);
                
            case 'generateblocks-pro/accordion-content':
                return $this->convert_accordion_content_pro($element, $mapping, $options);
                
            default:
                return null;
        }
    }
    
    /**
     * Extract attributes for custom elements, filtering out custom element specific attributes
     */
    protected function extract_custom_attributes($element, $block_type, $options) {
        $attrs = array();
        
        // 1. uniqueId - Always first
        if ($options['generate_unique_ids']) {
            $attrs['uniqueId'] = $this->generate_unique_id();
        }
        
        // 2. globalClasses - CSS classes from HTML (only class attribute)
        if ($element->hasAttribute('class')) {
            $class_string = $element->getAttribute('class');
            $classes = array_filter(array_map('trim', explode(' ', $class_string)));
            if (!empty($classes)) {
                $attrs['globalClasses'] = $classes;
            }
        }
        
        // 3. htmlAttributes - Only non-custom element attributes
        $html_attrs = array();
        $custom_attrs = array_merge(
            array_keys($this->query_attribute_mappings),
            array_keys($this->pagination_attribute_mappings),
            array('class', 'tag', 'field') // Other special attributes
        );
        
        foreach ($element->attributes as $attr) {
            $name = $attr->name;
            $value = $attr->value;
            
            // Skip custom element attributes
            if (in_array($name, $custom_attrs)) {
                continue;
            }
            
            $html_attrs[$name] = $value;
        }
        
        if (!empty($html_attrs)) {
            $attrs['htmlAttributes'] = $html_attrs;
        }
        
        // 4. blockId - GenerateBlocks block identifier (recovery expects this before metadata)
        $attrs['blockId'] = 'block-' . substr($attrs['uniqueId'], 0, 8) . '-' . substr(md5(time() . rand()), 0, 8);
        
        // 5. metadata - Block identification
        $tag_name = $element->tagName;
        $attrs['metadata'] = array(
            'name' => ucfirst($tag_name) . ' ' . ($block_type === 'generateblocks/text' ? 'Text' : 'Element'),
        );
        
        // 6. className - GenerateBlocks default classes (last to avoid duplication in HTML)
        // Note: loop-item and media blocks should not have className attribute (based on recovery analysis)
        $blocks_without_classname = array('generateblocks/loop-item', 'generateblocks/media');
        if (isset($this->default_attributes[$block_type]['className']) && !in_array($block_type, $blocks_without_classname)) {
            $attrs['className'] = $this->default_attributes[$block_type]['className'];
        }
        
        return $attrs;
    }

    /**
     * Convert query element
     */
    private function convert_query($element, $mapping, $options) {
        // Build attributes in recovery order: uniqueId, tagName, globalClasses, query, blockId, metadata, className
        $attrs = array();
        
        // 1. uniqueId
        if ($options['generate_unique_ids']) {
            $attrs['uniqueId'] = $this->generate_unique_id();
        }
        
        // 2. tagName
        $attrs['tagName'] = $mapping['tag_name'];
        
        // 3. globalClasses - CSS classes from HTML
        if ($element->hasAttribute('class')) {
            $class_string = $element->getAttribute('class');
            $classes = array_filter(array_map('trim', explode(' ', $class_string)));
            if (!empty($classes)) {
                $attrs['globalClasses'] = $classes;
            }
        }
        
        // 4. query - Extract query attributes in specific order
        $query_attrs = array();
        foreach ($this->query_attribute_mappings as $html_attr => $block_attr) {
            if ($element->hasAttribute($html_attr)) {
                $value = $element->getAttribute($html_attr);
                
                // Handle JSON attributes
                if (in_array($html_attr, array('meta-query', 'tax-query'))) {
                    $decoded = json_decode($value, true);
                    if ($decoded !== null) {
                        $value = $decoded;
                    }
                }
                
                // Handle numeric attributes
                if ($html_attr === 'posts-per-page') {
                    $value = intval($value);
                }
                
                // Handle boolean attributes
                if ($html_attr === 'inherit-query') {
                    $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                }
                
                // Set nested query attribute
                if (strpos($block_attr, 'query.') === 0) {
                    $query_key = str_replace('query.', '', $block_attr);
                    $query_attrs[$query_key] = $value;
                } else {
                    $attrs[$block_attr] = $value;
                }
            }
        }
        
        if (!empty($query_attrs)) {
            $attrs['query'] = $query_attrs;
        }
        
        // 5. blockId
        $attrs['blockId'] = 'block-' . substr($attrs['uniqueId'], 0, 8) . '-' . substr(md5(time() . rand()), 0, 8);
        
        // 6. metadata
        $attrs['metadata'] = array(
            'name' => 'Query Element',
        );
        
        // 7. className
        $attrs['className'] = 'gb-query';
        
        // Build opening/closing tags
        $tag_name = $mapping['tag_name'];
        $opening_tag = $this->build_opening_tag($tag_name, $attrs, $mapping['block_type']);
        $closing_tag = "</{$tag_name}>";
        
        return array(
            'blockName' => $mapping['block_type'],
            'attrs' => $attrs,
            'innerBlocks' => array(), // Will be populated by parent converter
            'innerHTML' => $opening_tag . $closing_tag,
            'innerContent' => array($opening_tag, null, $closing_tag),
        );
    }
    
    /**
     * Convert looper element
     */
    private function convert_looper($element, $mapping, $options) {
        // Build attributes in recovery order: uniqueId, tagName, globalClasses, blockId, metadata, className
        $attrs = array();
        
        // 1. uniqueId
        if ($options['generate_unique_ids']) {
            $attrs['uniqueId'] = $this->generate_unique_id();
        }
        
        // 2. tagName
        $attrs['tagName'] = $mapping['tag_name'];
        
        // 3. globalClasses
        if ($element->hasAttribute('class')) {
            $class_string = $element->getAttribute('class');
            $classes = array_filter(array_map('trim', explode(' ', $class_string)));
            if (!empty($classes)) {
                $attrs['globalClasses'] = $classes;
            }
        }
        
        // 4. blockId
        $attrs['blockId'] = 'block-' . substr($attrs['uniqueId'], 0, 8) . '-' . substr(md5(time() . rand()), 0, 8);
        
        // 5. metadata
        $attrs['metadata'] = array(
            'name' => 'Looper Element',
        );
        
        // 6. className
        $attrs['className'] = 'gb-looper';
        
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
     * Convert loop-item element
     */
    private function convert_loop_item($element, $mapping, $options) {
        // Build attributes in recovery order: uniqueId, tagName, globalClasses, blockId, metadata (NO className)
        $attrs = array();
        
        // 1. uniqueId
        if ($options['generate_unique_ids']) {
            $attrs['uniqueId'] = $this->generate_unique_id();
        }
        
        // 2. tagName
        $attrs['tagName'] = $mapping['tag_name'];
        
        // 3. globalClasses
        if ($element->hasAttribute('class')) {
            $class_string = $element->getAttribute('class');
            $classes = array_filter(array_map('trim', explode(' ', $class_string)));
            if (!empty($classes)) {
                $attrs['globalClasses'] = $classes;
            }
        }
        
        // 4. blockId
        $attrs['blockId'] = 'block-' . substr($attrs['uniqueId'], 0, 8) . '-' . substr(md5(time() . rand()), 0, 8);
        
        // 5. metadata
        $attrs['metadata'] = array(
            'name' => 'Loop-item Element',
        );
        
        // Note: NO className for loop-item (recovery analysis)
        
        $tag_name = $mapping['tag_name'];
        
        // Special handling for loop-item: always include gb-loop-item in HTML but not in attributes
        $opening_tag = $this->build_loop_item_opening_tag($tag_name, $attrs);
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
     * Convert query-page-numbers element
     */
    private function convert_query_page_numbers($element, $mapping, $options) {
        // Build attributes in recovery order: uniqueId, tagName, globalClasses, midSize, blockId, metadata, className
        $attrs = array();
        
        // 1. uniqueId
        if ($options['generate_unique_ids']) {
            $attrs['uniqueId'] = $this->generate_unique_id();
        }
        
        // 2. tagName
        $attrs['tagName'] = $mapping['tag_name'];
        
        // 3. globalClasses
        if ($element->hasAttribute('class')) {
            $class_string = $element->getAttribute('class');
            $classes = array_filter(array_map('trim', explode(' ', $class_string)));
            if (!empty($classes)) {
                $attrs['globalClasses'] = $classes;
            }
        }
        
        // 4. pagination attributes (like midSize)
        foreach ($this->pagination_attribute_mappings as $html_attr => $block_attr) {
            if ($element->hasAttribute($html_attr)) {
                $value = $element->getAttribute($html_attr);
                
                // Handle numeric attributes
                if ($html_attr === 'mid-size') {
                    $value = intval($value);
                }
                
                // Handle boolean attributes
                if ($html_attr === 'show-all') {
                    $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                }
                
                $attrs[$block_attr] = $value;
            }
        }
        
        // 5. blockId
        $attrs['blockId'] = 'block-' . substr($attrs['uniqueId'], 0, 8) . '-' . substr(md5(time() . rand()), 0, 8);
        
        // 6. metadata
        $attrs['metadata'] = array(
            'name' => 'Query-page-numbers Element',
        );
        
        // 7. className
        $attrs['className'] = 'gb-query-pagination';
        
        $tag_name = $mapping['tag_name'];
        $opening_tag = $this->build_opening_tag($tag_name, $attrs, $mapping['block_type']);
        $closing_tag = "</{$tag_name}>";
        
        return array(
            'blockName' => $mapping['block_type'],
            'attrs' => $attrs,
            'innerBlocks' => array(),
            'innerHTML' => $opening_tag . $closing_tag,
            'innerContent' => array($opening_tag . $closing_tag),
        );
    }
    
    /**
     * Convert query-no-results element
     */
    private function convert_query_no_results($element, $mapping, $options) {
        $attrs = $this->extract_custom_attributes($element, $mapping['block_type'], $options);
        
        // No special attributes for no-results block
        return array(
            'blockName' => $mapping['block_type'],
            'attrs' => $attrs,
            'innerBlocks' => array(),
            'innerHTML' => '',
            'innerContent' => array(null),
        );
    }
    
    
    /**
     * Get the priority of this provider (higher = more specific)
     *
     * @return int Priority value
     */
    public function get_priority() {
        return 75; // Higher than text/element providers, lower than media
    }
    
    /**
     * Build opening tag for loop-item with gb-loop-item class in HTML but not in attributes
     */
    private function build_loop_item_opening_tag($tag_name, $attrs) {
        $classes = array();
        
        // Add gb-loop-item class first for loop-item HTML
        $classes[] = 'gb-loop-item';
        
        // Add globalClasses after default class
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
     * Convert accordion to GenerateBlocks Pro accordion
     */
    private function convert_accordion($element, $mapping, $options) {
        // Build attributes in recovery order: uniqueId, tagName, globalClasses, blockId, metadata (NO className)
        $attrs = array();
        
        // 1. uniqueId
        if ($options['generate_unique_ids']) {
            $attrs['uniqueId'] = $this->generate_unique_id();
        }
        
        // 2. tagName (recovery puts this second)
        $attrs['tagName'] = $mapping['tag_name'];
        
        // 3. globalClasses
        if ($element->hasAttribute('class')) {
            $class_string = $element->getAttribute('class');
            $classes = array_filter(array_map('trim', explode(' ', $class_string)));
            if (!empty($classes)) {
                $attrs['globalClasses'] = $classes;
            }
        }
        
        // 4. blockId
        $attrs['blockId'] = 'block-' . substr($attrs['uniqueId'], 0, 8) . '-' . substr(md5(time() . rand()), 0, 8);
        
        // 5. metadata
        $attrs['metadata'] = array(
            'name' => 'Accordion Element',
        );
        
        // Note: Recovery removes className for accordion root
        
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
     * Convert accordion-item to GenerateBlocks Pro accordion-item
     */
    private function convert_accordion_item_pro($element, $mapping, $options) {
        // Build attributes in recovery order: uniqueId, tagName, globalClasses, blockId, metadata (NO className)
        $attrs = array();
        
        // 1. uniqueId
        if ($options['generate_unique_ids']) {
            $attrs['uniqueId'] = $this->generate_unique_id();
        }
        
        // 2. tagName (recovery puts this second)
        $attrs['tagName'] = $mapping['tag_name'];
        
        // 3. globalClasses
        if ($element->hasAttribute('class')) {
            $class_string = $element->getAttribute('class');
            $classes = array_filter(array_map('trim', explode(' ', $class_string)));
            if (!empty($classes)) {
                $attrs['globalClasses'] = $classes;
            }
        }
        
        // 4. blockId
        $attrs['blockId'] = 'block-' . substr($attrs['uniqueId'], 0, 8) . '-' . substr(md5(time() . rand()), 0, 8);
        
        // 5. metadata
        $attrs['metadata'] = array(
            'name' => 'Accordion-item Element',
        );
        
        // Note: Recovery removes className for accordion-item
        
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
     * Convert accordion-toggle to GenerateBlocks Pro accordion-toggle
     */
    private function convert_accordion_toggle($element, $mapping, $options) {
        // Build attributes in recovery order: uniqueId, tagName, globalClasses, htmlAttributes, blockId, metadata, className
        $attrs = array();
        
        // 1. uniqueId
        if ($options['generate_unique_ids']) {
            $attrs['uniqueId'] = $this->generate_unique_id();
        }
        
        // 2. tagName (recovery puts this second)
        $attrs['tagName'] = $mapping['tag_name'];
        
        // 3. globalClasses
        if ($element->hasAttribute('class')) {
            $class_string = $element->getAttribute('class');
            $classes = array_filter(array_map('trim', explode(' ', $class_string)));
            if (!empty($classes)) {
                $attrs['globalClasses'] = $classes;
            }
        }
        
        // 4. htmlAttributes - Generate ID using FULL uniqueId (not truncated)
        $toggle_id = 'gb-accordion-toggle-' . $attrs['uniqueId'];
        $attrs['htmlAttributes'] = array('id' => $toggle_id);
        
        // 5. blockId
        $attrs['blockId'] = 'block-' . substr($attrs['uniqueId'], 0, 8) . '-' . substr(md5(time() . rand()), 0, 8);
        
        // 6. metadata
        $attrs['metadata'] = array(
            'name' => 'Accordion-toggle Element',
        );
        
        // 7. className (recovery KEEPS this for accordion-toggle)
        $attrs['className'] = 'gb-accordion__toggle';
        
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
     * Convert accordion-content to GenerateBlocks Pro accordion-content
     */
    private function convert_accordion_content_pro($element, $mapping, $options) {
        // Build attributes in recovery order: uniqueId, tagName, globalClasses, htmlAttributes, blockId, metadata (NO className)
        $attrs = array();
        
        // 1. uniqueId
        if ($options['generate_unique_ids']) {
            $attrs['uniqueId'] = $this->generate_unique_id();
        }
        
        // 2. tagName (recovery puts this second)
        $attrs['tagName'] = $mapping['tag_name'];
        
        // 3. globalClasses
        if ($element->hasAttribute('class')) {
            $class_string = $element->getAttribute('class');
            $classes = array_filter(array_map('trim', explode(' ', $class_string)));
            if (!empty($classes)) {
                $attrs['globalClasses'] = $classes;
            }
        }
        
        // 4. htmlAttributes - Generate ID using FULL uniqueId (not truncated)
        $content_id = 'gb-accordion-content-' . $attrs['uniqueId'];
        $attrs['htmlAttributes'] = array('id' => $content_id);
        
        // 5. blockId
        $attrs['blockId'] = 'block-' . substr($attrs['uniqueId'], 0, 8) . '-' . substr(md5(time() . rand()), 0, 8);
        
        // 6. metadata
        $attrs['metadata'] = array(
            'name' => 'Accordion-content Element',
        );
        
        // Note: Recovery removes className for accordion-content
        
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
     * Get array of supported element types
     *
     * @return array Supported custom element names
     */
    public function get_supported_elements() {
        return array_keys($this->custom_element_mappings);
    }
}