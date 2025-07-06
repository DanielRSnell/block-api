<?php
/**
 * HTML to GenerateBlocks REST API Endpoint
 *
 * Provides REST API endpoints for converting HTML to GenerateBlocks markup
 *
 * @package GB_APIs
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * HTML to GenerateBlocks API Class
 */
class GB_APIs_HTML_To_GenerateBlocks_API {

    /**
     * API namespace
     */
    const API_NAMESPACE = 'gb-styles/v2';

    /**
     * Converter instance
     */
    private $converter;

    /**
     * Constructor
     */
    public function __construct() {
        $this->converter = new GB_APIs_HTML_To_GenerateBlocks_Converter();
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Main conversion endpoint
        register_rest_route(
            self::API_NAMESPACE,
            '/convert/html-to-blocks',
            array(
                'methods' => 'POST',
                'callback' => array($this, 'convert_html_to_blocks'),
                'permission_callback' => array($this, 'check_permissions'),
                'args' => $this->get_conversion_args(),
            )
        );

        // Batch conversion endpoint
        register_rest_route(
            self::API_NAMESPACE,
            '/convert/html-to-blocks/batch',
            array(
                'methods' => 'POST',
                'callback' => array($this, 'batch_convert_html_to_blocks'),
                'permission_callback' => array($this, 'check_permissions'),
                'args' => $this->get_batch_conversion_args(),
            )
        );

        // Validation endpoint
        register_rest_route(
            self::API_NAMESPACE,
            '/convert/validate-html',
            array(
                'methods' => 'POST',
                'callback' => array($this, 'validate_html'),
                'permission_callback' => array($this, 'check_permissions'),
                'args' => array(
                    'html' => array(
                        'required' => true,
                        'type' => 'string',
                        'description' => 'HTML string to validate',
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                ),
            )
        );

        // Get supported elements endpoint
        register_rest_route(
            self::API_NAMESPACE,
            '/convert/supported-elements',
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_supported_elements'),
                'permission_callback' => '__return_true', // Public endpoint
            )
        );

        // Debug endpoint
        register_rest_route(
            self::API_NAMESPACE,
            '/debug',
            array(
                'methods' => 'GET',
                'callback' => array($this, 'debug_endpoint'),
                'permission_callback' => '__return_true', // Public endpoint
            )
        );
    }

    /**
     * Get conversion endpoint arguments
     *
     * @return array Arguments array
     */
    private function get_conversion_args() {
        return array(
            'html' => array(
                'required' => true,
                'type' => 'string',
                'description' => 'HTML string to convert to GenerateBlocks',
                'sanitize_callback' => array($this, 'sanitize_html_input'),
                'validate_callback' => array($this, 'validate_html_input'),
            ),
            'options' => array(
                'required' => false,
                'type' => 'object',
                'description' => 'Conversion options',
                'default' => array(),
                'properties' => array(
                    'preserve_classes' => array(
                        'type' => 'boolean',
                        'description' => 'Whether to preserve CSS classes',
                        'default' => true,
                    ),
                    'preserve_ids' => array(
                        'type' => 'boolean',
                        'description' => 'Whether to preserve element IDs',
                        'default' => true,
                    ),
                    'preserve_styles' => array(
                        'type' => 'boolean',
                        'description' => 'Whether to preserve inline styles',
                        'default' => false,
                    ),
                    'fallback_to_html_block' => array(
                        'type' => 'boolean',
                        'description' => 'Whether to use HTML block fallbacks for unsupported elements',
                        'default' => true,
                    ),
                    'generate_unique_ids' => array(
                        'type' => 'boolean',
                        'description' => 'Whether to generate unique IDs for blocks',
                        'default' => true,
                    ),
                    'semantic_mapping' => array(
                        'type' => 'boolean',
                        'description' => 'Whether to use semantic element mapping',
                        'default' => true,
                    ),
                ),
            ),
            'format' => array(
                'required' => false,
                'type' => 'string',
                'description' => 'Output format (blocks, markup, both)',
                'default' => 'both',
                'enum' => array('blocks', 'markup', 'both'),
            ),
        );
    }

    /**
     * Get batch conversion endpoint arguments
     *
     * @return array Arguments array
     */
    private function get_batch_conversion_args() {
        return array(
            'items' => array(
                'required' => true,
                'type' => 'array',
                'description' => 'Array of HTML strings and options to convert',
                'items' => array(
                    'type' => 'object',
                    'properties' => array(
                        'html' => array(
                            'type' => 'string',
                            'required' => true,
                            'description' => 'HTML string to convert',
                        ),
                        'options' => array(
                            'type' => 'object',
                            'description' => 'Conversion options for this item',
                        ),
                        'id' => array(
                            'type' => 'string',
                            'description' => 'Optional ID for tracking this conversion',
                        ),
                    ),
                ),
            ),
            'global_options' => array(
                'required' => false,
                'type' => 'object',
                'description' => 'Global options applied to all conversions',
                'default' => array(),
            ),
        );
    }

    /**
     * Convert HTML to GenerateBlocks
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response|WP_Error Response object
     */
    public function convert_html_to_blocks($request) {
        $html = $request->get_param('html');
        $options = $request->get_param('options');
        $format = $request->get_param('format');

        // Merge with defaults
        $options = wp_parse_args($options, array(
            'preserve_classes' => true,
            'preserve_ids' => true,
            'preserve_styles' => false,
            'fallback_to_html_block' => true,
            'generate_unique_ids' => true,
            'semantic_mapping' => true,
        ));

        try {
            // Convert HTML to blocks
            $result = $this->converter->convert_html_to_generateblocks($html, $options);

            if (!$result['success']) {
                return new WP_Error(
                    'conversion_failed',
                    $result['error'],
                    array('status' => 400)
                );
            }

            // TEMPORARY FIX: Post-process blocks to ensure attributes are included
            // DISABLED: Our new provider system handles attributes correctly from the start
            // $result = $this->post_process_blocks_for_attributes($result, $html);
        

            // Format response based on requested format
            $response_data = array(
                'success' => true,
                'conversion_stats' => $result['conversion_stats'],
                'original_html' => $result['original_html'],
                'debug_api_loaded' => 'API_FILE_UPDATED_AND_LOADED',
                // Debug info now comes directly from converter
                'debug_provider_system' => 'PROVIDER_SYSTEM_ACTIVE',
            );

            switch ($format) {
                case 'blocks':
                    $response_data['blocks'] = $result['blocks'];
                    break;

                case 'markup':
                    $response_data['markup'] = $result['markup'];
                    break;

                case 'both':
                default:
                    $response_data['blocks'] = $result['blocks'];
                    $response_data['markup'] = $result['markup'];
                    break;
            }

            return rest_ensure_response($response_data);

        } catch (Exception $e) {
            return new WP_Error(
                'conversion_error',
                'An error occurred during conversion: ' . $e->getMessage(),
                array('status' => 500)
            );
        }
    }

    /**
     * Batch convert multiple HTML strings
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response|WP_Error Response object
     */
    public function batch_convert_html_to_blocks($request) {
        $items = $request->get_param('items');
        $global_options = $request->get_param('global_options');

        $results = array();
        $errors = array();

        foreach ($items as $index => $item) {
            if (!isset($item['html'])) {
                $errors[] = array(
                    'index' => $index,
                    'id' => isset($item['id']) ? $item['id'] : null,
                    'error' => 'Missing HTML content',
                );
                continue;
            }

            // Merge options
            $options = wp_parse_args(
                isset($item['options']) ? $item['options'] : array(),
                $global_options
            );

            try {
                $result = $this->converter->convert_html_to_generateblocks($item['html'], $options);

                $results[] = array(
                    'index' => $index,
                    'id' => isset($item['id']) ? $item['id'] : null,
                    'success' => $result['success'],
                    'blocks' => $result['blocks'],
                    'markup' => $result['markup'],
                    'conversion_stats' => $result['conversion_stats'],
                );

            } catch (Exception $e) {
                $errors[] = array(
                    'index' => $index,
                    'id' => isset($item['id']) ? $item['id'] : null,
                    'error' => $e->getMessage(),
                );
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'results' => $results,
            'errors' => $errors,
            'total_items' => count($items),
            'successful_conversions' => count($results),
            'failed_conversions' => count($errors),
        ));
    }

    /**
     * Validate HTML structure
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response Response object
     */
    public function validate_html($request) {
        $html = $request->get_param('html');

        // Basic HTML validation
        $validation_result = array(
            'is_valid' => true,
            'errors' => array(),
            'warnings' => array(),
            'convertible_elements' => array(),
            'unsupported_elements' => array(),
        );

        // Use DOMDocument for validation
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        
        $wrapped_html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' . $html . '</body></html>';
        $success = $dom->loadHTML($wrapped_html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        // Check for parsing errors
        $errors = libxml_get_errors();
        if (!empty($errors)) {
            foreach ($errors as $error) {
                $validation_result['errors'][] = array(
                    'type' => 'parse_error',
                    'message' => trim($error->message),
                    'line' => $error->line,
                    'column' => $error->column,
                );
            }
            $validation_result['is_valid'] = false;
        }

        libxml_clear_errors();

        // Analyze elements for convertibility
        if ($success) {
            $body = $dom->getElementsByTagName('body')->item(0);
            if ($body) {
                $this->analyze_elements_for_conversion($body, $validation_result);
            }
        }

        return rest_ensure_response($validation_result);
    }

    /**
     * Get supported HTML elements
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response Response object
     */
    public function get_supported_elements($request) {
        return rest_ensure_response(array(
            'generateblocks_elements' => array(
                'generateblocks/element' => array(
                    'description' => 'Container elements',
                    'supported_tags' => array('div', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main', 'figure', 'ul', 'ol', 'li', 'dl', 'dt', 'dd'),
                ),
                'generateblocks/text' => array(
                    'description' => 'Text elements',
                    'supported_tags' => array('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'figcaption'),
                ),
                'generateblocks/media' => array(
                    'description' => 'Media elements',
                    'supported_tags' => array('img'),
                ),
            ),
            'html_fallback_elements' => array(
                'core/html' => array(
                    'description' => 'Elements that fallback to HTML blocks',
                    'supported_tags' => array('form', 'input', 'textarea', 'select', 'iframe', 'video', 'audio', 'canvas', 'svg', 'script', 'style', 'table', 'tr', 'td', 'th'),
                ),
            ),
            'conversion_options' => array(
                'preserve_classes' => 'Preserve CSS classes from original HTML',
                'preserve_ids' => 'Preserve element IDs from original HTML',
                'preserve_styles' => 'Preserve inline styles from original HTML',
                'fallback_to_html_block' => 'Use WordPress HTML blocks for unsupported elements',
                'generate_unique_ids' => 'Generate unique IDs for GenerateBlocks elements',
                'semantic_mapping' => 'Use semantic mapping for element conversion',
            ),
        ));
    }

    /**
     * Debug endpoint to test API availability
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response Response object
     */
    public function debug_endpoint($request) {
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'GB Styles v2 API is working!',
            'namespace' => self::API_NAMESPACE,
            'timestamp' => current_time('mysql'),
            'version' => '1.0.0'
        ));
    }

    /**
     * Check permissions for API access
     *
     * @param WP_REST_Request $request Request object
     * @return bool Whether user has permission
     */
    public function check_permissions($request) {
        // Allow for logged-in users with edit capability
        if (is_user_logged_in() && current_user_can('edit_posts')) {
            return true;
        }

        // For now, allow public access for demonstration
        // In production, you might want to add API key authentication
        return true;
    }

    /**
     * Sanitize HTML input
     *
     * @param string $value HTML string
     * @return string Sanitized HTML
     */
    public function sanitize_html_input($value) {
        // NOTE: We bypass wp_kses during the parsing process to allow custom elements
        // The provider system handles security by only converting recognized elements
        // and the converter already strips dangerous content like scripts and events
        
        // Only perform basic security sanitization - remove script/style tags and event handlers
        $value = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi', '', $value);
        $value = preg_replace('/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/mi', '', $value);
        $value = preg_replace('/\s*on\w+\s*=\s*["\'][^"\']*["\']/', '', $value);
        $value = preg_replace('/\s*javascript\s*:/i', '', $value);
        
        return $value;
    }

    /**
     * Validate HTML input
     *
     * @param string $value HTML string
     * @param WP_REST_Request $request Request object
     * @param string $param Parameter name
     * @return bool|WP_Error Validation result
     */
    public function validate_html_input($value, $request, $param) {
        if (empty($value)) {
            return new WP_Error(
                'empty_html',
                'HTML content cannot be empty',
                array('status' => 400)
            );
        }

        if (strlen($value) > 1000000) { // 1MB limit
            return new WP_Error(
                'html_too_large',
                'HTML content is too large (max 1MB)',
                array('status' => 400)
            );
        }

        return true;
    }

    /**
     * Analyze elements for conversion capabilities
     *
     * @param DOMNode $node DOM node to analyze
     * @param array &$result Validation result array (passed by reference)
     */
    private function analyze_elements_for_conversion($node, &$result) {
        foreach ($node->childNodes as $child) {
            if ($child->nodeType === XML_ELEMENT_NODE) {
                $tag_name = strtolower($child->tagName);
                
                // Check if element is convertible to GenerateBlocks
                if ($this->is_generateblocks_convertible($tag_name)) {
                    if (!in_array($tag_name, $result['convertible_elements'])) {
                        $result['convertible_elements'][] = $tag_name;
                    }
                } else {
                    if (!in_array($tag_name, $result['unsupported_elements'])) {
                        $result['unsupported_elements'][] = $tag_name;
                    }
                    
                    // Add warning for unsupported elements
                    $result['warnings'][] = array(
                        'type' => 'unsupported_element',
                        'message' => "Element '{$tag_name}' will fallback to HTML block",
                        'element' => $tag_name,
                    );
                }
                
                // Recursively analyze child elements
                $this->analyze_elements_for_conversion($child, $result);
            }
        }
    }

    /**
     * Check if element is convertible to GenerateBlocks
     *
     * @param string $tag_name HTML tag name
     * @return bool Whether element is convertible
     */
    private function is_generateblocks_convertible($tag_name) {
        $convertible_elements = array(
            'div', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main', 'figure',
            'ul', 'ol', 'li', 'dl', 'dt', 'dd',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'figcaption',
            'img'
        );
        
        return in_array($tag_name, $convertible_elements);
    }

    /**
     * Post-process blocks to ensure HTML attributes are properly extracted and included
     * TEMPORARY FIX for converter file caching issues
     */
    private function post_process_blocks_for_attributes($result, $original_html) {
        $result['debug_post_processing_started'] = true;
        
        // Parse the original HTML to extract element attributes
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->preserveWhiteSpace = false;
        libxml_use_internal_errors(true);
        
        $wrapped_html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' . $original_html . '</body></html>';
        $success = $dom->loadHTML($wrapped_html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        
        if (!$success) {
            $result['debug_error'] = 'HTML parsing failed';
            return $result; // Return unchanged if HTML parsing fails
        }
        
        $body = $dom->getElementsByTagName('body')->item(0);
        if (!$body) {
            $result['debug_error'] = 'Body element not found';
            return $result;
        }
        
        // Collect all elements and their attributes in order
        $elements_with_attributes = array();
        $this->collect_elements_in_order($body, $elements_with_attributes);
        
        $result['debug_collected_elements'] = count($elements_with_attributes);
        $result['debug_elements_sample'] = array_slice($elements_with_attributes, 0, 3); // First 3 for debugging
        
        // Post-process blocks to add missing attributes
        $result['blocks'] = $this->add_attributes_to_blocks_in_order($result['blocks'], $elements_with_attributes);
        
        // Regenerate markup with updated blocks
        $result['markup'] = $this->regenerate_block_markup($result['blocks']);
        
        $result['debug_post_processed'] = 'ATTRIBUTES_POST_PROCESSED';
        
        return $result;
    }
    
    /**
     * Check if an element is a custom element (hyphenated name)
     */
    private function is_custom_element($tag_name) {
        // Custom elements must contain a hyphen and start with lowercase letter
        return preg_match('/^[a-z]+-[a-z-]+$/', $tag_name);
    }
    
    /**
     * Collect elements and their attributes in document order
     */
    private function collect_elements_in_order($node, &$elements_with_attributes) {
        foreach ($node->childNodes as $child) {
            if ($child->nodeType === XML_ELEMENT_NODE) {
                $tag_name = strtolower($child->tagName);
                
                // Skip source elements completely - they should not be in the final output
                if ($tag_name === 'source') {
                    // Still process children in case source has nested content
                    $this->collect_elements_in_order($child, $elements_with_attributes);
                    continue;
                }
                
                // Handle custom elements (query-*, accordion-*, etc.)
                $is_custom_element = $this->is_custom_element($tag_name);
                if ($is_custom_element) {
                    // For custom elements, still process children but don't add the custom element itself
                    // since it will be handled by the provider system
                    $this->collect_elements_in_order($child, $elements_with_attributes);
                    continue;
                }
                
                $attrs = array();
                
                foreach ($child->attributes as $attr) {
                    $name = $attr->name;
                    $value = $attr->value;
                    
                    // Skip class attribute (handled separately) 
                    if ($name === 'class') {
                        continue;
                    }
                    
                    // Include all other attributes
                    $attrs[$name] = $value;
                }
                
                // Always add element info, even if no attributes (for ordering)
                $elements_with_attributes[] = array(
                    'tagName' => $tag_name,
                    'attributes' => $attrs,
                    'hasAttributes' => !empty($attrs)
                );
                
                // Recursively process child elements
                $this->collect_elements_in_order($child, $elements_with_attributes);
            }
        }
    }
    
    /**
     * Add attributes to blocks in the same order as HTML elements
     */
    private function add_attributes_to_blocks_in_order($blocks, &$elements_with_attributes) {
        $processed_blocks = array();
        
        foreach ($blocks as $block) {
            $processed_block = $this->process_single_block($block, $elements_with_attributes);
            $processed_blocks[] = $processed_block;
        }
        
        return $processed_blocks;
    }
    
    /**
     * Process a single block and its inner blocks
     */
    private function process_single_block($block, &$elements_with_attributes) {
        $processed_block = $block;
        
        // Debug tracking for this block
        if (!isset($processed_block['debug_block_processing'])) {
            $processed_block['debug_block_processing'] = array();
        }
        
        // Check if this block corresponds to an HTML element
        if (isset($block['attrs']['tagName'])) {
            $block_tag = $block['attrs']['tagName'];
            $processed_block['debug_block_processing']['looking_for_tag'] = $block_tag;
            $processed_block['debug_block_processing']['available_elements'] = count($elements_with_attributes);
            
            
            // Find the next matching element in order
            for ($i = 0; $i < count($elements_with_attributes); $i++) {
                $element = $elements_with_attributes[$i];
                
                // Check for exact match OR if this is an unsupported element that should be converted
                $unsupported_elements = array('picture', 'source', 'video', 'audio', 'canvas', 'svg', 'object', 'embed', 'iframe', 'script', 'style');
                $is_matching = ($element['tagName'] === $block_tag);
                $is_convertible_unsupported = (in_array($element['tagName'], $unsupported_elements) && $block_tag === 'div');
                
                if ($is_matching || $is_convertible_unsupported) {
                    $processed_block['debug_block_processing']['found_match_at_index'] = $i;
                    $processed_block['debug_block_processing']['element_has_attributes'] = $element['hasAttributes'];
                    $processed_block['debug_block_processing']['element_attributes'] = $element['attributes'];
                    
                    // Handle unsupported element conversion
                    if (in_array($element['tagName'], $unsupported_elements)) {
                        $original_tag = $element['tagName'];
                        
                        // Ensure this becomes a div
                        $processed_block['attrs']['tagName'] = 'div';
                        
                        // Add data-tagname to preserve original element type
                        if (!isset($processed_block['attrs']['htmlAttributes'])) {
                            $processed_block['attrs']['htmlAttributes'] = array();
                        }
                        $processed_block['attrs']['htmlAttributes']['data-tagname'] = $original_tag;
                        
                        // Update metadata to reflect the conversion
                        if (isset($processed_block['attrs']['metadata']['name'])) {
                            $processed_block['attrs']['metadata']['name'] = ucfirst($original_tag) . ' Element (converted to div)';
                        }
                        
                        $processed_block['debug_block_processing']['converted_to_div'] = true;
                        $processed_block['debug_block_processing']['original_tag'] = $original_tag;
                    }
                    
                    // Found a match - use this element's attributes
                    if ($element['hasAttributes'] && !empty($element['attributes'])) {
                        if (!isset($processed_block['attrs']['htmlAttributes'])) {
                            $processed_block['attrs']['htmlAttributes'] = array();
                        }
                        $original_attrs = isset($processed_block['attrs']['htmlAttributes']) ? $processed_block['attrs']['htmlAttributes'] : array();
                        $processed_block['attrs']['htmlAttributes'] = array_merge(
                            $processed_block['attrs']['htmlAttributes'], 
                            $element['attributes']
                        );
                        $processed_block['debug_block_processing']['attributes_added'] = true;
                        $processed_block['debug_block_processing']['original_html_attrs'] = $original_attrs;
                        $processed_block['debug_block_processing']['merged_html_attrs'] = $processed_block['attrs']['htmlAttributes'];
                    } else {
                        $processed_block['debug_block_processing']['attributes_added'] = false;
                        $processed_block['debug_block_processing']['reason'] = 'No attributes to add';
                    }
                    
                    // Remove this element so it's not used again
                    array_splice($elements_with_attributes, $i, 1);
                    break;
                }
            }
            
            if (!isset($processed_block['debug_block_processing']['found_match_at_index'])) {
                $processed_block['debug_block_processing']['found_match'] = false;
                $processed_block['debug_block_processing']['reason'] = 'No matching element found';
            }
        } else {
            $processed_block['debug_block_processing']['has_tag_name'] = false;
            $processed_block['debug_block_processing']['block_type'] = $block['blockName'];
        }
        
        // Process inner blocks recursively
        if (!empty($block['innerBlocks'])) {
            $processed_block['innerBlocks'] = $this->add_attributes_to_blocks_in_order($block['innerBlocks'], $elements_with_attributes);
        }
        
        return $processed_block;
    }
    
    /**
     * Regenerate block markup from updated blocks
     */
    private function regenerate_block_markup($blocks) {
        $markup = '';
        
        foreach ($blocks as $block) {
            $markup .= $this->serialize_block($block);
        }
        
        return $markup;
    }
    
    /**
     * Serialize block to markup format
     */
    private function serialize_block($block) {
        $block_name = $block['blockName'];
        $attrs = $block['attrs'];
        $inner_blocks = $block['innerBlocks'];
        $inner_content = $block['innerContent'];
        
        // Build attribute string
        $attr_string = '';
        if (!empty($attrs)) {
            $attr_string = ' ' . wp_json_encode($attrs, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
        
        // Handle self-closing blocks
        if (empty($inner_blocks) && empty($inner_content)) {
            return "<!-- wp:{$block_name}{$attr_string} /-->";
        }
        
        // Build content
        $content = '';
        $child_index = 0;
        
        foreach ($inner_content as $item) {
            if ($item === null) {
                // This is a placeholder for a child block
                if (isset($inner_blocks[$child_index])) {
                    $child_block = $this->serialize_block($inner_blocks[$child_index]);
                    $content .= $child_block . "\n";
                    $child_index++;
                }
            } else {
                // This is actual HTML content
                if (preg_match('/^<(\w+)[^>]*>$/', $item)) {
                    $content .= $item . "\n";
                } else {
                    $content .= $item;
                }
            }
        }
        
        // Remove trailing newline
        $content = rtrim($content, "\n");
        
        return "<!-- wp:{$block_name}{$attr_string} -->\n{$content}\n<!-- /wp:{$block_name} -->";
    }

    /**
     * Extract and organize debug information from the result
     */
    private function extract_debug_info($result) {
        $debug_info = array(
            'post_processing_started' => isset($result['debug_post_processing_started']),
            'html_parsing' => array(
                'success' => !isset($result['debug_error']),
                'error' => isset($result['debug_error']) ? $result['debug_error'] : null,
            ),
            'element_collection' => array(
                'elements_found' => isset($result['debug_collected_elements']) ? $result['debug_collected_elements'] : 0,
                'sample_elements' => isset($result['debug_elements_sample']) ? $result['debug_elements_sample'] : array(),
            ),
            'block_processing' => array(),
            'attributes_applied' => 0,
            'blocks_with_attributes' => 0,
            'post_processed' => isset($result['debug_post_processed']),
        );

        // Analyze blocks for attribute processing debug info
        if (isset($result['blocks'])) {
            $debug_info['block_processing'] = $this->analyze_blocks_debug($result['blocks'], $debug_info);
        }

        return $debug_info;
    }

    /**
     * Recursively analyze blocks for debug information
     */
    private function analyze_blocks_debug($blocks, &$debug_info) {
        $block_analysis = array();

        foreach ($blocks as $index => $block) {
            $block_debug = array(
                'index' => $index,
                'block_name' => $block['blockName'],
                'has_tag_name' => isset($block['attrs']['tagName']),
                'tag_name' => isset($block['attrs']['tagName']) ? $block['attrs']['tagName'] : null,
                'has_html_attributes' => isset($block['attrs']['htmlAttributes']) && !empty($block['attrs']['htmlAttributes']),
                'html_attributes' => isset($block['attrs']['htmlAttributes']) ? $block['attrs']['htmlAttributes'] : array(),
                'debug_info' => isset($block['debug_block_processing']) ? $block['debug_block_processing'] : null,
            );

            if ($block_debug['has_html_attributes']) {
                $debug_info['blocks_with_attributes']++;
                $debug_info['attributes_applied'] += count($block_debug['html_attributes']);
            }

            $block_analysis[] = $block_debug;

            // Process inner blocks recursively
            if (!empty($block['innerBlocks'])) {
                $inner_analysis = $this->analyze_blocks_debug($block['innerBlocks'], $debug_info);
                $block_debug['inner_blocks'] = $inner_analysis;
            }
        }

        return $block_analysis;
    }
}