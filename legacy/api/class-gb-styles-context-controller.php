<?php
/**
 * GB Styles Context REST API Controller
 * 
 * Provides contextual information about the current editing environment
 * including current post, site data, user data, and post type schemas.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GB_Styles_Context_Controller extends WP_REST_Controller {
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->namespace = 'gb-styles/v1';
        $this->rest_base = 'context';
    }
    
    /**
     * Register the routes
     */
    public function register_routes() {
        // Main context endpoint
        register_rest_route($this->namespace, '/' . $this->rest_base, array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array($this, 'get_context'),
                'permission_callback' => array($this, 'get_context_permissions_check'),
                'args'                => array(
                    'post_id' => array(
                        'description' => 'Post ID to get context for',
                        'type'        => 'integer',
                        'required'    => false,
                    ),
                ),
            ),
        ));
        
        // Post type schema endpoint
        register_rest_route($this->namespace, '/' . $this->rest_base . '/post_type/(?P<post_type>[a-zA-Z0-9_-]+)', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array($this, 'get_post_type_schema'),
                'permission_callback' => array($this, 'get_context_permissions_check'),
                'args'                => array(
                    'post_type' => array(
                        'description' => 'Post type to get schema for',
                        'type'        => 'string',
                        'required'    => true,
                    ),
                ),
            ),
        ));
    }
    
    /**
     * Check permissions for context endpoints
     */
    public function get_context_permissions_check($request) {
        return current_user_can('edit_posts');
    }
    
    /**
     * Get current context information
     */
    public function get_context($request) {
        $post_id = $request->get_param('post_id');
        
        // If no post_id provided, try to get from referer or global
        if (!$post_id) {
            global $post;
            if ($post && $post->ID) {
                $post_id = $post->ID;
            }
            
            // Try to extract from referer URL
            if (!$post_id) {
                $referer = wp_get_referer();
                if ($referer && preg_match('/post=(\d+)/', $referer, $matches)) {
                    $post_id = intval($matches[1]);
                } elseif ($referer && preg_match('/\/wp-admin\/post\.php\?.*post=(\d+)/', $referer, $matches)) {
                    $post_id = intval($matches[1]);
                }
            }
        }
        
        $context = array(
            'current' => $this->get_current_post_context($post_id),
            'site'    => $this->get_site_context(),
            'user'    => $this->get_user_context(),
            'post_types' => $this->get_post_types_context(),
            'plugins' => $this->get_plugins_context(),
        );
        
        return rest_ensure_response($context);
    }
    
    /**
     * Get current post context
     */
    private function get_current_post_context($post_id) {
        if (!$post_id) {
            return null;
        }
        
        $post = get_post($post_id);
        if (!$post) {
            return null;
        }
        
        $context = array(
            'post_id' => $post->ID,
            'type'    => $post->post_type,
            'title'   => $post->post_title,
            'content' => $post->post_content,
            'status'  => $post->post_status,
            'slug'    => $post->post_name,
            'excerpt' => $post->post_excerpt,
            'author'  => $post->post_author,
            'date'    => $post->post_date,
            'modified' => $post->post_modified,
            'parent'  => $post->post_parent,
            'menu_order' => $post->menu_order,
            'meta'    => array(),
            'acf'     => array(),
            'taxonomies' => array(),
        );
        
        // Get post meta
        $meta = get_post_meta($post_id);
        foreach ($meta as $key => $values) {
            // Skip private meta fields
            if (substr($key, 0, 1) === '_' && !in_array($key, array('_thumbnail_id', '_wp_page_template'))) {
                continue;
            }
            $context['meta'][$key] = count($values) === 1 ? $values[0] : $values;
        }
        
        // Get ACF fields if ACF is active
        if (function_exists('get_fields')) {
            $acf_fields = get_fields($post_id);
            if ($acf_fields) {
                $context['acf'] = $acf_fields;
            }
        }
        
        // Get taxonomy terms
        $taxonomies = get_object_taxonomies($post->post_type, 'objects');
        foreach ($taxonomies as $taxonomy) {
            $terms = get_the_terms($post_id, $taxonomy->name);
            if ($terms && !is_wp_error($terms)) {
                $context['taxonomies'][$taxonomy->name] = array_map(function($term) {
                    return array(
                        'id' => $term->term_id,
                        'name' => $term->name,
                        'slug' => $term->slug,
                        'description' => $term->description,
                    );
                }, $terms);
            }
        }
        
        return $context;
    }
    
    /**
     * Get site context
     */
    private function get_site_context() {
        return array(
            'name' => get_bloginfo('name'),
            'description' => get_bloginfo('description'),
            'url' => get_site_url(),
            'home_url' => get_home_url(),
            'admin_url' => get_admin_url(),
            'domain' => parse_url(get_site_url(), PHP_URL_HOST),
            'rest_endpoint' => get_rest_url(),
            'wp_version' => get_bloginfo('version'),
            'language' => get_locale(),
            'timezone' => get_option('timezone_string'),
            'date_format' => get_option('date_format'),
            'time_format' => get_option('time_format'),
            'start_of_week' => get_option('start_of_week'),
            'theme' => array(
                'name' => get_template(),
                'version' => wp_get_theme()->get('Version'),
                'text_domain' => wp_get_theme()->get('TextDomain'),
            ),
        );
    }
    
    /**
     * Get user context
     */
    private function get_user_context() {
        $user = wp_get_current_user();
        
        if (!$user->ID) {
            return null;
        }
        
        return array(
            'id' => $user->ID,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'role' => !empty($user->roles) ? $user->roles[0] : null,
        );
    }
    
    /**
     * Get post types context
     */
    private function get_post_types_context() {
        $post_types = get_post_types(array('public' => true), 'objects');
        $context = array();
        
        foreach ($post_types as $post_type) {
            $taxonomies = array();
            $taxonomy_objects = get_object_taxonomies($post_type->name, 'objects');
            
            foreach ($taxonomy_objects as $taxonomy) {
                $taxonomies[] = array(
                    'name' => $taxonomy->name,
                    'slug' => $taxonomy->name,
                    'pattern' => $taxonomy->rewrite ? $taxonomy->rewrite['slug'] : $taxonomy->name,
                );
            }
            
            $context[] = array(
                'name' => $post_type->name,
                'slug' => $post_type->name,
                'pattern' => $post_type->rewrite ? $post_type->rewrite['slug'] : $post_type->name,
                'taxonomies' => $taxonomies,
            );
        }
        
        return $context;
    }
    
    /**
     * Get plugins context
     */
    private function get_plugins_context() {
        return array(
            'generateblocks' => is_plugin_active('generateblocks/plugin.php'),
            'generateblocks_pro' => is_plugin_active('generateblocks-pro/generateblocks-pro.php'),
            'windpress' => is_plugin_active('windpress/windpress.php'),
            'acf' => is_plugin_active('advanced-custom-fields/acf.php'),
            'acf_pro' => is_plugin_active('advanced-custom-fields-pro/acf.php'),
        );
    }
    
    /**
     * Get post type schema
     */
    public function get_post_type_schema($request) {
        $post_type = $request->get_param('post_type');
        
        if (!post_type_exists($post_type)) {
            return new WP_Error('invalid_post_type', 'Invalid post type', array('status' => 404));
        }
        
        $post_type_object = get_post_type_object($post_type);
        
        $schema = array(
            'post_type' => $post_type,
            'label' => $post_type_object->label,
            'labels' => $post_type_object->labels,
            'description' => $post_type_object->description,
            'supports' => get_all_post_type_supports($post_type),
            'taxonomies' => $this->get_post_type_taxonomies($post_type),
            'meta_fields' => $this->get_post_type_meta_fields($post_type),
            'acf_fields' => $this->get_post_type_acf_fields($post_type),
            'custom_fields' => $this->get_post_type_custom_fields($post_type),
        );
        
        return rest_ensure_response($schema);
    }
    
    /**
     * Get taxonomies for post type
     */
    private function get_post_type_taxonomies($post_type) {
        $taxonomies = get_object_taxonomies($post_type, 'objects');
        $result = array();
        
        foreach ($taxonomies as $taxonomy) {
            $result[] = array(
                'name' => $taxonomy->name,
                'slug' => $taxonomy->name,
                'pattern' => $taxonomy->rewrite ? $taxonomy->rewrite['slug'] : $taxonomy->name,
            );
        }
        
        return $result;
    }
    
    /**
     * Get meta fields for post type
     */
    private function get_post_type_meta_fields($post_type) {
        global $wpdb;
        
        // Get common meta keys for this post type
        $meta_keys = $wpdb->get_col($wpdb->prepare("
            SELECT DISTINCT meta_key 
            FROM {$wpdb->postmeta} pm 
            INNER JOIN {$wpdb->posts} p ON pm.post_id = p.ID 
            WHERE p.post_type = %s 
            AND meta_key NOT LIKE '\\_%%'
            ORDER BY meta_key
        ", $post_type));
        
        $meta_fields = array();
        foreach ($meta_keys as $meta_key) {
            $meta_fields[$meta_key] = array(
                'key' => $meta_key,
                'type' => 'string', // Default type, could be enhanced
            );
        }
        
        return $meta_fields;
    }
    
    /**
     * Get ACF fields for post type
     */
    private function get_post_type_acf_fields($post_type) {
        if (!function_exists('acf_get_field_groups')) {
            return array();
        }
        
        $field_groups = acf_get_field_groups(array(
            'post_type' => $post_type
        ));
        
        $fields = array();
        foreach ($field_groups as $group) {
            $group_fields = acf_get_fields($group);
            if ($group_fields) {
                foreach ($group_fields as $field) {
                    $fields[$field['name']] = array(
                        'key' => $field['key'],
                        'name' => $field['name'],
                        'label' => $field['label'],
                        'type' => $field['type'],
                        'instructions' => $field['instructions'],
                        'required' => $field['required'],
                        'choices' => isset($field['choices']) ? $field['choices'] : null,
                        'default_value' => isset($field['default_value']) ? $field['default_value'] : null,
                    );
                }
            }
        }
        
        return $fields;
    }
    
    /**
     * Get custom fields for post type
     */
    private function get_post_type_custom_fields($post_type) {
        // This could be extended to include other custom field plugins
        // For now, we'll return an empty array as ACF is handled separately
        return array();
    }
}