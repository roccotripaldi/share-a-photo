<?php

$editor_labels = array(
	'title' => 'Describe Your Photo',
);
$editor_labels = apply_filters( 'shaph_editor_labels', $editor_labels );

?>
<script id="shaph-template-image-editor" type="text/template">
	<h3 class="shaph-title"><?php echo esc_attr( $editor_labels['title'] ); ?></h3>

	<div id="shaph-image-editor">
		<div id="shaph-image-preview">
			<img id="shaph-image-placeholder" />
			<p>Uploaded: <b id="shaph-image-percent">0%</b></p>
		</div>

		<div id="shaph-image-attributes">

		</div>
	</div>

</script>
