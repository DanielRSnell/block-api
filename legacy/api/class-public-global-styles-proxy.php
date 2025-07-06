<?php
/**
 * Public proxy for GenerateBlocks Pro Global Styles API
 *
 * @package GB_APIs
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Public Global Styles Proxy Class
 */
class GenerateBlocks_Public_Global_Styles_Proxy {

	/**
	 * Initialize the proxy endpoints
	 */
	public function init() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register the public proxy routes
	 */
	public function register_routes() {
		$namespace = 'generateblocks/v1';

		// Public endpoint to get all global styles
		register_rest_route(
			$namespace,
			'/public/global-styles',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_global_styles' ),
				'permission_callback' => '__return_true', // Public endpoint
			)
		);

		// Public endpoint to get CSS for global styles
		register_rest_route(
			$namespace,
			'/public/global-styles/css',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_global_styles_css' ),
				'permission_callback' => '__return_true', // Public endpoint
			)
		);

		// Public endpoint to get specific style data by class name
		register_rest_route(
			$namespace,
			'/public/global-styles/class/(?P<class_name>[a-zA-Z0-9_-]+)',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_specific_style' ),
				'permission_callback' => '__return_true', // Public endpoint
				'args'                => array(
					'class_name' => array(
						'validate_callback' => function( $param ) {
							return is_string( $param );
						}
					),
				),
			)
		);

		// Public endpoint to get specific style data by ID
		register_rest_route(
			$namespace,
			'/public/global-styles/id/(?P<style_id>[0-9]+)',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_style_by_id' ),
				'permission_callback' => '__return_true', // Public endpoint
				'args'                => array(
					'style_id' => array(
						'validate_callback' => function( $param ) {
							return is_numeric( $param );
						}
					),
				),
			)
		);

		// Public endpoint to check if class name exists
		register_rest_route(
			$namespace,
			'/public/global-styles/check/(?P<class_name>[a-zA-Z0-9_-]+)',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'check_class_name' ),
				'permission_callback' => '__return_true', // Public endpoint
				'args'                => array(
					'class_name' => array(
						'validate_callback' => function( $param ) {
							return is_string( $param );
						}
					),
				),
			)
		);
	}

	/**
	 * Get all global styles (proxy for GenerateBlocks Pro)
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response
	 */
	public function get_global_styles( WP_REST_Request $request ) {
		// Check if GenerateBlocks Pro is active
		if ( ! $this->is_pro_active() ) {
			return $this->error_response( 'GenerateBlocks Pro is not active', 404 );
		}

		$status = $request->get_param( 'status' ) ?? 'publish';
		
		try {
			$custom_args = array(
				'post_status' => $status,
			);

			$styles = GenerateBlocks_Pro_Styles::get_styles( $custom_args );

			$response_data = array(
				'styles' => $styles,
			);

			return $this->success_response( $response_data );

		} catch ( Exception $e ) {
			return $this->error_response( 'Failed to retrieve global styles: ' . $e->getMessage() );
		}
	}

	/**
	 * Get CSS for all global styles
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response
	 */
	public function get_global_styles_css( WP_REST_Request $request ) {
		if ( ! $this->is_pro_active() ) {
			return $this->error_response( 'GenerateBlocks Pro is not active', 404 );
		}

		$class_name = $request->get_param( 'className' );

		try {
			if ( $class_name ) {
				$class = GenerateBlocks_Pro_Styles::get_class_by_name( $class_name );

				if ( ! isset( $class->ID ) ) {
					return $this->error_response( 'No CSS found for the specified class.' );
				}

				$css = get_post_meta( $class->ID, 'gb_style_css', true );
			} else {
				$css = GenerateBlocks_Pro_Styles::get_styles_css();
			}

			return $this->success_response( array( $css ) );

		} catch ( Exception $e ) {
			return $this->error_response( 'Failed to retrieve CSS: ' . $e->getMessage() );
		}
	}

	/**
	 * Get specific style data by class name
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response
	 */
	public function get_specific_style( WP_REST_Request $request ) {
		if ( ! $this->is_pro_active() ) {
			return $this->error_response( 'GenerateBlocks Pro is not active', 404 );
		}

		$class_name = $request['class_name'];

		try {
			$class = GenerateBlocks_Pro_Styles::get_class_by_name( $class_name );

			if ( ! isset( $class ) ) {
				return $this->error_response( 'Style does not exist' );
			}

			$full_style_data = $this->get_full_style_data( $class );

			return $this->success_response( $full_style_data );

		} catch ( Exception $e ) {
			return $this->error_response( 'Failed to retrieve style data: ' . $e->getMessage() );
		}
	}

	/**
	 * Get specific style data by ID
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response
	 */
	public function get_style_by_id( WP_REST_Request $request ) {
		if ( ! $this->is_pro_active() ) {
			return $this->error_response( 'GenerateBlocks Pro is not active', 404 );
		}

		$style_id = intval( $request['style_id'] );

		try {
			$post = get_post( $style_id );

			if ( ! $post || 'gblocks_styles' !== $post->post_type ) {
				return $this->error_response( 'Style not found or invalid ID' );
			}

			$full_style_data = $this->get_full_style_data( $post );

			return $this->success_response( $full_style_data );

		} catch ( Exception $e ) {
			return $this->error_response( 'Failed to retrieve style data: ' . $e->getMessage() );
		}
	}

	/**
	 * Get complete style data for a post object
	 *
	 * @param WP_Post $post The post object.
	 * @return array
	 */
	private function get_full_style_data( WP_Post $post ) {
		$post_id = $post->ID;

		// Get all meta data
		$style_data = get_post_meta( $post_id, 'gb_style_data', true );
		$style_css = get_post_meta( $post_id, 'gb_style_css', true );
		$style_selector = get_post_meta( $post_id, 'gb_style_selector', true );
		$style_version = get_post_meta( $post_id, 'gb_style_version', true );

		// Get all post data
		$post_data = array(
			'ID'           => $post_id,
			'post_title'   => $post->post_title,
			'post_name'    => $post->post_name,
			'post_status'  => $post->post_status,
			'post_date'    => $post->post_date,
			'post_modified' => $post->post_modified,
			'menu_order'   => $post->menu_order,
			'post_author'  => $post->post_author,
		);

		// Get author information
		$author_data = array();
		if ( $post->post_author ) {
			$author = get_userdata( $post->post_author );
			if ( $author ) {
				$author_data = array(
					'id'           => $author->ID,
					'display_name' => $author->display_name,
					'user_login'   => $author->user_login,
				);
			}
		}

		return array(
			'post'         => $post_data,
			'author'       => $author_data,
			'selector'     => $style_selector ?? '',
			'styles'       => $style_data ?? array(),
			'css'          => $style_css ?? '',
			'version'      => $style_version ?? '',
			'meta'         => array(
				'gb_style_data'     => $style_data,
				'gb_style_css'      => $style_css,
				'gb_style_selector' => $style_selector,
				'gb_style_version'  => $style_version,
			),
		);
	}

	/**
	 * Check if class name exists
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response
	 */
	public function check_class_name( WP_REST_Request $request ) {
		if ( ! $this->is_pro_active() ) {
			return $this->error_response( 'GenerateBlocks Pro is not active', 404 );
		}

		$class_name = $request['class_name'];

		if ( empty( $class_name ) ) {
			return $this->error_response( 'Style name cannot be empty' );
		}

		try {
			$existing_class = new WP_Query(
				array(
					'post_type'      => 'gblocks_styles',
					'posts_per_page' => -1,
					'post_status'    => 'any',
					'meta_query'     => array(
						array(
							'key'     => 'gb_style_selector',
							'value'   => $class_name,
							'compare' => '=',
						),
					),
				)
			);

			$exists = ! empty( $existing_class->found_posts );

			return $this->success_response(
				array(
					'exists'    => $exists,
					'className' => $class_name,
					'message'   => $exists ? 'Style name already exists' : 'Style name is available',
				)
			);

		} catch ( Exception $e ) {
			return $this->error_response( 'Failed to check class name: ' . $e->getMessage() );
		}
	}

	/**
	 * Check if GenerateBlocks Pro is active
	 *
	 * @return bool
	 */
	private function is_pro_active() {
		return class_exists( 'GenerateBlocks_Pro_Styles' );
	}

	/**
	 * Return success response in GenerateBlocks Pro format
	 *
	 * @param array $data Response data.
	 * @return WP_REST_Response
	 */
	private function success_response( $data ) {
		return new WP_REST_Response(
			array(
				'success'  => true,
				'response' => array(
					'data' => $data,
				),
			),
			200
		);
	}

	/**
	 * Return error response in GenerateBlocks Pro format
	 *
	 * @param string $message Error message.
	 * @param int    $code    HTTP status code.
	 * @return WP_REST_Response
	 */
	private function error_response( $message, $code = 400 ) {
		return new WP_REST_Response(
			array(
				'success'  => false,
				'response' => $message,
			),
			$code
		);
	}
}

// Initialize the proxy
$generateblocks_global_styles_proxy = new GenerateBlocks_Public_Global_Styles_Proxy();
$generateblocks_global_styles_proxy->init();