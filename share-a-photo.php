<?php

/*
Plugin Name: Share-A-Photo
Description: Let's anyone share a photo
Author: Rocco Tripaldi
Version: 1.0
*/

define( 'SHAPH_DIR', dirname( __FILE__ ) );
define( 'SHAPH_PATH', plugins_url() . '/share-a-photo/' );

require_once( SHAPH_DIR . '/class.share-a-photo.php' );
require_once( SHAPH_DIR . '/shortcode.php' );

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


