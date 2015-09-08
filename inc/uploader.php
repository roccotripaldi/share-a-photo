<?php
$uploader_labels = array(
	'title' => 'Share-A-Photo',
	'browse' => 'Browse',
	'upload' => 'Start Upload'
);
$uploader_labels = apply_filters( 'shaph_uploader_labels', $uploader_labels );

?>
<script id="shaph-template-uploader" type="text/template">
	<h3 class="shaph-title"><?php echo esc_attr( $uploader_labels['title'] ); ?></h3>
	<ul id="shaph-filelist"></ul>
	<div class="shaph-footer-buttons">
		<input type="button" id="shaph-browse" value="<?php echo esc_attr( $uploader_labels['browse'] ); ?>" />
		<input type="button" id="shaph-start-upload" value="<?php echo esc_attr( $uploader_labels['upload'] ); ?>" />
	</div>

</script>