<?php
$uploader_labels = array(
	'title' => 'Share-A-Photo',
	'browse' => 'Select Photo'
);
$uploader_labels = apply_filters( 'shaph_uploader_labels', $uploader_labels );

?>
<script id="shaph-template-uploader" type="text/template">
	<h3 class="shaph-title"><?php echo esc_attr( $uploader_labels['title'] ); ?></h3>
	<input type="button" id="shaph-browse" value="<?php echo esc_attr( $uploader_labels['browse'] ); ?>" />
</script>