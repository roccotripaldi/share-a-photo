<?php

$cancel_button_text = 'Cancel';
$cancel_button_text = apply_filters( 'shaph_cancel_button_text', $cancel_button_text );

?>
<div id="shaph-bg">
	<div id="shaph-modal">

		<div id="shaph-page"></div>

		<input type="button" id="shaph-cancel" value="<?php echo $cancel_button_text; ?>" />

	</div>
</div>
