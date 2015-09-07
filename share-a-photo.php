<?php

/*
Plugin Name: Share-A-Photo
Description: Let's anyone share a photo
Author: Rocco Tripaldi
Version: 1.0
*/

define( 'SHAPH_DIR', dirname( __FILE__ ) );
define( 'SHAPH_PATH', plugins_url() . '/share-a-photo/' );

/**
 * On activation, create an anonymous user.
 * Content shared anonymously will be attached to this user.
 */
function shaph_activate() {
	$shaph_anonymous_user = get_option( 'shaph_anonymous_user', false );

	if ( ! $shaph_anonymous_user ) {
		$args = array(
			'user_pass' => wp_generate_password(),
			'user_login' => 'anonymous',
			'display_name' => 'Anonymous Sharer',
		);

		$id = wp_insert_user( $args );

		if ( ! is_wp_error( $id ) ) {
			update_option( 'shaph_anonymous_user', $id );
		}

	}

}
register_activation_hook( __FILE__, 'shaph_activate' );

class Share_A_Photo {

	public $is_displaying_share_button = false;
	public $settings;

	function __construct() {
		add_shortcode( 'share_a_photo', array( $this, 'render_prompt' ) );
		add_action( 'init', array( $this, 'register_assets' ) );
		add_action( 'wp_footer', array( $this, 'print_javascripts' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_stylesheets' ) );
		if ( 'POST' == $_SERVER['REQUEST_METHOD'] && isset( $_GET['share_a_photo'] ) ) {
			add_action( 'init', array( $this, 'process_upload' ) );
		}
	}

	function register_assets() {

		$shaph_js = SHAPH_PATH . 'js/app.js';
		/**
		 * Filter the location of the main javascript file.
		 */
		$shaph_js = apply_filters( 'shaph_js', $shaph_js );
		$shaph_js_dependencies = array( 'jquery', 'underscore', 'backbone', 'plupload' );
		/**
		 * Filter the dependencies of the the main javascript file.
		 */
		$shaph_js_dependencies = apply_filters( 'shaph_js_dependencies', $shaph_js_dependencies );

		$shaph_css = SHAPH_PATH . 'css/main.css';
		/**
		 * Filters the location of the main stylesheet.
		 */
		$shaph_css = apply_filters( 'shaph_css', $shaph_css );

		wp_register_script( 'shaph-js', $shaph_js, $shaph_js_dependencies );
		wp_register_style( 'shaph-css', $shaph_css );

		$shaph_js_data = array(
			'App' => false,
			'nonce' => wp_create_nonce( 'shaph_upload' ),
		);

		$templates = $this->get_templates();
		if ( is_array( $templates ) ) {
			$shaph_js_data['templates'] = array_keys( $templates );
		}

		$shaph_js_data = apply_filters( 'shaph-js-data', $shaph_js_data );
		wp_localize_script( 'shaph-js', 'shareAPhoto', $shaph_js_data );
	}

	/**
	 * @param $settings
	 *
	 * array(
	 *  'id' => (string) the html id attribute of the button element
	 *  'text' => (string) the text of the button element
	 * )
	 *
	 * @return string
	 */
	function render_prompt( $settings ) {
		$this->settings = $settings ? $settings : array();
		$this->is_displaying_share_button = true;
		ob_start();
		include SHAPH_DIR . '/inc/prompt.php';
		$form = ob_get_contents();
		ob_end_clean();
		return $form;
	}

	function print_javascripts() {
		if ( $this->is_displaying_share_button ) {
			wp_print_scripts( 'shaph-js' );
			$this->print_templates();
		}
	}

	function enqueue_stylesheets() {
		wp_enqueue_style( 'shaph-css' );
	}

	function print_templates() {

		// these templates are required for every instance of share-a-photo
		echo $this->print_template( 'form-base', SHAPH_DIR . '/inc/form-base.php' );
		echo $this->print_template( 'uploader', SHAPH_DIR . '/inc/uploader.php' );

		$templates = $this->get_templates();

		if ( ! empty( $templates ) && is_array( $templates ) ) {
			foreach( $templates as $name=>$file ) {
				echo $this->print_template( $name, $file );
			}
		}

	}

	function get_templates() {
		$templates = array(
			'caption' => SHAPH_DIR . '/inc/caption.php',
		);
		/**
		 * Filter the list of optional templates
		 */
		$templates = apply_filters( 'shaph-templates', $templates );
		return $templates;
	}

	/**
	 * @param $name  'form-base' || 'uploader'
	 *
	 * @return mixed|void
	 */
	function print_template( $name, $file ) {
		ob_start();
		include $file;
		$template = ob_get_contents();
		ob_end_clean();
		/**
		 * Filter a template by $name.
		 */
		$filtered = apply_filters( 'shaph_template-' . $name, $template );
		return $filtered;
	}

	function process_upload() {

		if ( ! wp_verify_nonce( $_POST['nonce'], 'shaph_upload' ) ) {
			error_log( 'pooped' );
			die( json_encode( 'Unauthorized' ) );
		}

		if ( ! function_exists( 'wp_handle_upload' ) ) {
			require_once( ABSPATH . 'wp-admin/includes/file.php' );
		}

		$uploadedfile = $_FILES['file'];
		$upload_overrides = array( 'test_form' => false );
		$movefile = wp_handle_upload( $uploadedfile, $upload_overrides );
		echo json_encode( $movefile );
		exit;
	}

}

$shaph = new Share_A_Photo();
