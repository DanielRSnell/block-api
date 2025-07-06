<?php
/**
 * Shape Provider
 *
 * Handles conversion of SVG elements to generateblocks/shape blocks
 *
 * @package GB_APIs
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Shape Provider Class
 */
class GB_Shape_Provider extends GB_Base_Provider {
    
    /**
     * Determine if this provider can handle the given element
     *
     * @param DOMElement $element DOM element to check
     * @param array $options Conversion options
     * @return bool True if this provider can handle the element
     */
    public function can_handle($element, $options) {
        $tag_name = strtolower($element->tagName);
        
        // Handle SVG elements directly
        if ($tag_name === 'svg') {
            return true;
        }
        
        // Handle elements with shape class or data-shape attribute
        if ($element->hasAttribute('class') && strpos($element->getAttribute('class'), 'shape') !== false) {
            return true;
        }
        
        if ($element->hasAttribute('data-shape')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Convert the element to a GenerateBlocks shape block
     *
     * @param DOMElement $element DOM element to convert
     * @param array $options Conversion options
     * @return array Block data
     */
    public function convert($element, $options) {
        $tag_name = strtolower($element->tagName);
        
        // Extract attributes in GenerateBlocks order
        $attrs = array();
        
        // 1. uniqueId - Generate short alphanumeric ID like "3aacd05a"
        $unique_id = $this->generate_short_unique_id();
        $attrs['uniqueId'] = $unique_id;
        
        // 2. styles - CSS-in-JS object for the shape
        $attrs['styles'] = $this->extract_shape_styles($element);
        
        // 3. css - Generated CSS with unique class
        $attrs['css'] = $this->generate_shape_css($unique_id, $attrs['styles']);
        
        // 4. blockId - GenerateBlocks format
        $attrs['blockId'] = 'block-ac' . substr($unique_id, 0, 6) . '-' . substr($unique_id, 0, 4) . '-4917-bf34-be8191ca72dc';
        
        // 5. globalClasses - CSS classes from HTML (optional)
        $classes = $this->extract_css_classes($element, $options);
        if (!empty($classes)) {
            $attrs['globalClasses'] = $classes;
        }
        
        // 6. htmlAttributes - Only non-SVG attributes for the span (optional)
        $html_attrs = $this->extract_span_html_attributes($element, $options);
        if (!empty($html_attrs)) {
            $attrs['htmlAttributes'] = $html_attrs;
        }
        
        // Extract SVG content for innerHTML
        $svg_content = $this->extract_svg_content($element);
        
        // Build HTML - Shape uses span with gb-shape and unique class
        $span_classes = array('gb-shape', 'gb-shape-' . $unique_id);
        
        // Add global classes
        if (!empty($classes)) {
            $span_classes = array_merge($span_classes, $classes);
        }
        
        $span_attrs = array('class' => implode(' ', $span_classes));
        
        // Add only relevant HTML attributes to span (not SVG-specific ones)
        if (!empty($html_attrs)) {
            foreach ($html_attrs as $key => $value) {
                // Skip SVG-specific attributes
                if (!in_array($key, array('xmlns', 'viewBox', 'fill', 'stroke', 'width', 'height'))) {
                    $span_attrs[$key] = $value;
                }
            }
        }
        
        // Build span tag with SVG content
        $span_attr_string = '';
        foreach ($span_attrs as $key => $value) {
            $span_attr_string .= ' ' . esc_attr($key) . '="' . esc_attr($value) . '"';
        }
        
        $opening_tag = "<span{$span_attr_string}>";
        $closing_tag = "</span>";
        $inner_html = $opening_tag . $svg_content . $closing_tag;
        
        return array(
            'blockName' => 'generateblocks/shape',
            'attrs' => $attrs,
            'innerBlocks' => array(),
            'innerHTML' => $inner_html,
            'innerContent' => array($inner_html),
        );
    }
    
    /**
     * Extract SVG content from element
     *
     * @param DOMElement $element DOM element
     * @return string SVG content
     */
    private function extract_svg_content($element) {
        $tag_name = strtolower($element->tagName);
        
        if ($tag_name === 'svg') {
            // For direct SVG elements, get the outer HTML
            $doc = new DOMDocument();
            $doc->appendChild($doc->importNode($element, true));
            $html = $doc->saveHTML();
            
            // Clean up the HTML
            $html = trim($html);
            $html = str_replace('<?xml version="1.0"?>', '', $html);
            $html = trim($html);
            
            return $html;
        }
        
        // For elements containing SVG, extract the inner SVG
        $svgs = $element->getElementsByTagName('svg');
        if ($svgs->length > 0) {
            $svg = $svgs->item(0);
            $doc = new DOMDocument();
            $doc->appendChild($doc->importNode($svg, true));
            $html = $doc->saveHTML();
            
            // Clean up the HTML
            $html = trim($html);
            $html = str_replace('<?xml version="1.0"?>', '', $html);
            $html = trim($html);
            
            return $html;
        }
        
        return '';
    }
    
    /**
     * Extract HTML attributes for the span wrapper (non-SVG attributes)
     *
     * @param DOMElement $element DOM element
     * @param array $options Conversion options
     * @return array HTML attributes
     */
    private function extract_span_html_attributes($element, $options) {
        $attrs = array();
        
        // For direct SVG elements, we want minimal attributes on the span
        if (strtolower($element->tagName) === 'svg') {
            // Only extract ID and style if present
            if ($element->hasAttribute('id')) {
                $attrs['id'] = $element->getAttribute('id');
            }
            
            if ($element->hasAttribute('style') && $options['preserve_styles']) {
                $attrs['style'] = $element->getAttribute('style');
            }
            
            return $attrs;
        }
        
        // For container elements with SVG, extract non-SVG attributes
        foreach ($element->attributes as $attr) {
            $name = $attr->name;
            $value = $attr->value;
            
            // Skip attributes that are handled separately or are SVG-specific
            $skip_attrs = array('class', 'data-shape', 'xmlns', 'viewBox', 'fill', 'stroke', 'width', 'height');
            if (in_array($name, $skip_attrs)) {
                continue;
            }
            
            // Handle style preservation
            if ($name === 'style' && $options['preserve_styles']) {
                $attrs['style'] = $value;
                continue;
            }
            
            // Include ID
            if ($name === 'id') {
                $attrs['id'] = $value;
                continue;
            }
            
            // Preserve other non-SVG attributes
            $attrs[$name] = $value;
        }
        
        return $attrs;
    }
    
    /**
     * Get the priority of this provider (higher = more specific)
     *
     * @return int Priority value
     */
    public function get_priority() {
        return 80; // Higher than custom elements, specific to SVG shapes
    }
    
    /**
     * Generate short unique ID like GenerateBlocks uses
     *
     * @return string Short alphanumeric ID
     */
    private function generate_short_unique_id() {
        return substr(md5(uniqid() . mt_rand()), 0, 8);
    }
    
    /**
     * Extract shape styles from element
     *
     * @param DOMElement $element DOM element
     * @return array Style object
     */
    private function extract_shape_styles($element) {
        $styles = array();
        
        // Default display style
        $styles['display'] = 'inline-flex';
        
        // SVG-specific styles
        $svg_styles = array();
        
        // Extract dimensions from SVG or element
        if ($element->hasAttribute('width')) {
            $svg_styles['width'] = $element->getAttribute('width');
            if (strpos($svg_styles['width'], 'px') === false) {
                $svg_styles['width'] .= 'px';
            }
        } else {
            $svg_styles['width'] = '30px'; // Default
        }
        
        if ($element->hasAttribute('height')) {
            $svg_styles['height'] = $element->getAttribute('height');
            if (strpos($svg_styles['height'], 'px') === false) {
                $svg_styles['height'] .= 'px';
            }
        } else {
            $svg_styles['height'] = '30px'; // Default
        }
        
        // Extract fill from SVG or use default
        if ($element->hasAttribute('fill')) {
            $svg_styles['fill'] = $element->getAttribute('fill');
        } else {
            $svg_styles['fill'] = 'currentColor'; // Default
        }
        
        $styles['svg'] = $svg_styles;
        
        return $styles;
    }
    
    /**
     * Generate CSS for shape block
     *
     * @param string $unique_id Unique ID for the block
     * @param array $styles Style object
     * @return string Generated CSS
     */
    private function generate_shape_css($unique_id, $styles) {
        $css = '';
        
        // Base class styles
        $css .= '.gb-shape-' . $unique_id . '{';
        if (isset($styles['display'])) {
            $css .= 'display:' . $styles['display'] . ';';
        }
        $css .= '}';
        
        // SVG styles
        if (isset($styles['svg']) && is_array($styles['svg'])) {
            $css .= '.gb-shape-' . $unique_id . ' svg{';
            foreach ($styles['svg'] as $property => $value) {
                $css .= $property . ':' . $value . ';';
            }
            $css .= '}';
        }
        
        return $css;
    }
    
    /**
     * Get array of supported element types
     *
     * @return array Supported element names
     */
    public function get_supported_elements() {
        return array('svg');
    }
}