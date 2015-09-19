<?php

global $shareAPhoto;

class Share_A_Photo {

    public $settings;

    function __construct() {
        add_action( 'init', array( $this, 'register_assets' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_stylesheets' ) );
        if ( 'POST' == $_SERVER['REQUEST_METHOD'] && isset( $_GET['share_a_photo_upload'] ) ) {
            add_action( 'init', array( $this, 'process_upload' ) );
        }
        if ( 'POST' == $_SERVER['REQUEST_METHOD'] && isset( $_GET['share_a_photo_finish'] ) ) {
            add_action( 'init', array( $this, 'finish' ) );
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
            'pageEnclosure' => '#page',
            'processUpload' => '/?share_a_photo_upload=true',
            'processPost' => '/?share_a_photo_finish=true',
            'placeholderImage' => SHAPH_PATH . 'images/placeholder.png',
        );

        $extensions = $this->get_extensions();
        $shaph_js_data['extensions'] = array_keys( $extensions );

        $shaph_js_data = apply_filters( 'shaph-js-data', $shaph_js_data );
        wp_localize_script( 'shaph-js', 'shareAPhoto', $shaph_js_data );
    }

    /**
     * @param $settings
     *
     * array(
     *  'button_id' => (string) the html id attribute of the button element
     *  'button_text' => (string) the text of the button element
     * )
     *
     * @return string
     */
    function initialize( $settings = array() ) {
        $this->settings = $settings ? $settings : array();
        add_action( 'wp_footer', array( $this, 'print_javascripts' ) );
        ob_start();
        include SHAPH_DIR . '/inc/template.button.php';
        $button = ob_get_contents();
        ob_end_clean();
        return $button;
    }

    function print_javascripts() {
        wp_print_scripts( 'shaph-js' );
        $this->print_templates();
    }

    function enqueue_stylesheets() {
        wp_enqueue_style( 'shaph-css' );
    }

    function print_templates() {

        // these templates are required for every instance of share-a-photo
        echo $this->print_template( 'modal', SHAPH_DIR . '/inc/template.modal.php' );
        echo $this->print_template( 'uploader', SHAPH_DIR . '/inc/template.uploader.php' );
        echo $this->print_template( 'thank-you', SHAPH_DIR . '/inc/template.thank-you.php' );
        echo $this->print_template( 'image-editor', SHAPH_DIR . '/inc/template.image-editor.php' );
        echo $this->print_template( 'image-attributes', SHAPH_DIR . '/inc/template.image-attributes.php' );
        echo $this->print_template( 'image-preview', SHAPH_DIR . '/inc/template.image-preview.php' );
        echo $this->print_template( 'footer-buttons', SHAPH_DIR . '/inc/template.footer-buttons.php' );

        /**
         * Filter the list of optional templates
         */
        $extensions = $this->get_extensions();

        if ( ! empty( $extensions ) && is_array( $extensions ) ) {
            foreach( $extensions as $name => $extension_file ) {
                echo $this->print_template( $name, $extension_file );
            }
        }

    }

    function get_extensions() {
        return apply_filters( 'shaph-extension-pages', array() );
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
            die( json_encode( 'Unauthorized' ) );
        }

        require_once( ABSPATH . 'wp-admin/includes/file.php' );
        require_once( ABSPATH . 'wp-admin/includes/image.php' );

        $uploadedfile = $_FILES['file'];
        $upload_overrides = array( 'test_form' => false );
        $movefile = wp_handle_upload( $uploadedfile, $upload_overrides );

        $filename = $movefile['file'];
        $filetype = wp_check_filetype( basename( $filename ), null );
        $wp_upload_dir = wp_upload_dir();

        $attachment_options = array(
            'guid'           => $wp_upload_dir['url'] . '/' . basename( $filename ),
            'post_mime_type' => $filetype['type'],
            'post_title'     => preg_replace( '/\.[^.]+$/', '', basename( $filename ) ),
            'post_content'   => '',
            'post_status'    => 'inherit',
        );

        $attach_id = wp_insert_attachment( $attachment_options, $filename );
        $attach_data = wp_generate_attachment_metadata( $attach_id, $filename );
        wp_update_attachment_metadata( $attach_id, $attach_data );
        $attachment_thumb = wp_get_attachment_image_src( $attach_id, 'thumbnail' );

        $response = array(
            'attachment_id' => $attach_id,
            'thumb' => $attachment_thumb[0],
            'nonce' => wp_create_nonce( 'shaph_attachment_' . $attach_id ),
        );

        echo json_encode( $response );
        exit;
    }

    function finish() {
        if ( ! wp_verify_nonce( $_POST['nonce'], 'shaph_upload' ) ) {
            die( json_encode( 'Unauthorized' ) );
        }

        if ( ! is_array( $_POST['files'] ) ) {
            die( json_encode( 'Unauthorized' ) );
        }

        global $current_user;
        $num_photos = 0;

        if ( is_user_logged_in() ) {
            $post_author_id = $current_user->ID;
            $post_author = $current_user;
            $post_status = 'publish';
        } else {
            $post_author_id = get_option( 'shaph_anonymous_user' );
            $post_author = get_user_by( 'id', $post_author_id );
            $post_status = 'pending';
        }

        foreach( $_POST['files'] as $image ) {
            if ( ! isset( $image['attachment_id'] ) ) {
                continue;
            }

            $attachment_id = $image['attachment_id'];

            if ( ! wp_verify_nonce( $image['nonce'], 'shaph_attachment_' . $attachment_id ) ) {
                continue;
            }

            $attachment_large = wp_get_attachment_image_src( $attachment_id, 'large' );
            $attachment_full = wp_get_attachment_image_src( $attachment_id, 'full' );

            $post_title = empty( $image['title'] ) ? 'Photo by ' . $post_author->data->display_name : $image['title'];
            $post_content = '<a href="' . esc_url( $attachment_full[0] ) . '">';
            $post_content .= '<img class="wp-image-' . $attachment_id . ' size-large" src="' . esc_url( $attachment_large[0] ) . '" alt="' . esc_attr( $post_title ) . '" width="' . $attachment_large[1] . '" height="' . $attachment_large[2] . '" /></a>';
            if( ! empty( $image['caption'] ) ) {
                $post_content = '[caption id="attachment_' . $attachment_id . '" align="alignnon" width="' . $attachment_large[1] . '"]' . $post_content . ' ' . $image['caption'] . '[/caption]';
            }

            $post_options = array(
                'post_title' => $post_title,
                'post_status' => $post_status,
                'post_author' => $post_author_id,
                'post_content' => $post_content,
            );

            $post_options = apply_filters( 'shaph_pre_post', $post_options, $image );
            $post_id = wp_insert_post( $post_options );

            $attachment_options = array(
                'ID' => $attachment_id,
                'post_author' => $post_author_id,
                'post_parent' => $post_id
            );

            if( ! empty( $image['caption'] ) ) {
                $attachment_options['post_excerpt'] = $image['caption'];
            }

            wp_update_post( $attachment_options );

            $num_photos++;
        }

        if ( is_user_logged_in() ) {
            $message = sprintf( _n( '%s photo was published!', '%s photos were published', $num_photos ), $num_photos);
        } else {
            $message = sprintf(
                _n(
                    '%s photo is now in our inbox. It will be published pending review.',
                    '%s photos are now in our inbox. They will be published pending review.',
                    $num_photos
                ), $num_photos );
        }

        echo json_encode( array( 'message' => $message ) );
        exit;
    }

}

$shareAPhoto = new Share_A_Photo();
