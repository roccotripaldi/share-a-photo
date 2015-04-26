<?php

$cancel_button_text = 'X';
$cancel_button_text = apply_filters( 'shaph_cancel_button_text', $cancel_button_text );

?>
<div id="shaph-form">
	<form>

		<fieldset>
		</fieldset>

		<input type="button" id="shaph-cancel" value="<?php echo $cancel_button_text; ?>" />

	</form>
</div>
