<?php
/**
 * Main GB APIs plugin class
 *
 * @package GB_APIs
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Main GB APIs Class
 */
class GB_APIs {

	/**
	 * The single instance of the class.
	 *
	 * @var GB_APIs
	 */
	private static $instance = null;

	/**
	 * Get the single instance of the class.
	 *
	 * @return GB_APIs
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Initialize the plugin
	 */
	public function init() {
		// Load API classes
		$this->load_api_classes();
	}

	/**
	 * Load all API classes
	 */
	private function load_api_classes() {
		// Public Global Styles Proxy
		require_once GB_APIS_DIR . 'includes/class-public-global-styles-proxy.php';
		
		// HTML to GenerateBlocks Converter
		require_once GB_APIS_DIR . 'includes/class-html-to-generateblocks-converter.php';
		require_once GB_APIS_DIR . 'includes/class-html-to-generateblocks-api.php';
	}
}