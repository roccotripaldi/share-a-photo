<?php

$editor_labels = array(
	'title' => 'Describe Your Photo',
	'placeholder_image' => SHAPH_PATH . 'images/placeholder.png',
);
$editor_labels = apply_filters( 'shaph_editor_labels', $editor_labels );

?>
<script id="shaph-template-image-editor" type="text/template">
	<h3 class="shaph-title"><?php echo esc_attr( $editor_labels['title'] ); ?></h3>

	<div id="shaph-image-editor">
		<div id="shaph-image-preview">
			<img id="shaph-image-placeholder" src="<?php echo esc_url( $editor_labels['placeholder_image'] ); ?>" />
			<p>Uploaded: <b id="shaph-image-percent">0%</b></p>
		</div>

		<div id="shaph-image-attributes">

		</div>
	</div>

	<div class="shaph-footer-buttons">
		<input type="button" id="shaph-next-image" value="Next Image" />
		<input type="button" id="shaph-finish" value="Finish" />
	</div>
</script>
