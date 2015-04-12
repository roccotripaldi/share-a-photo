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
 * creates an anonymous user
 * content shared anonymously will be attached to this user
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
		add_shortcode( 'share_a_photo', array( $this, 'render_share_a_photo_form' ) );
		add_action( 'init', array( $this, 'register_assets' ) );
		add_action( 'wp_footer', array( $this, 'print_javascripts' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_stylesheets' ) );
	}

	function register_assets() {
		wp_register_script( 'shaph-js', SHAPH_PATH . 'js/main.js', array( 'jquery', 'backbone', 'underscore' ) );
		wp_register_style( 'shaph-css', SHAPH_PATH . 'css/main.css' );
	}

	function render_share_a_photo_form( $settings ) {
		$this->settings = $settings ? $settings : array();
		$this->is_displaying_share_button = true;
		ob_start();
		include SHAPH_DIR . '/inc/form.php';
		$form = ob_get_contents();
		ob_end_clean();
		return $form;
	}

	function print_javascripts() {
		if ( $this->is_displaying_share_button ) {
			wp_print_scripts( 'shaph-js' );
		}
	}

	function enqueue_stylesheets() {
		wp_enqueue_style( 'shaph-css' );
	}

}

$shaph = new Share_A_Photo();
