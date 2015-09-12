<?php

add_shortcode( 'share_a_photo', 'share_a_photo_shortcode' );

function share_a_photo_shortcode( $settings ) {
    global $shareAPhoto;
    return $shareAPhoto->initialize( $settings );
}
