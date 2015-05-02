<?php

$cancel_button_text = 'X';
$cancel_button_text = apply_filters( 'shaph_cancel_button_text', $cancel_button_text );

?>
<div id="shaph-form">
	<form>

		<ul id="shaph-filelist" class="shaph-box"></ul>

		<fieldset id="shaph-fieldset" class="shaph-box"></fieldset>

		<input type="button" id="shaph-cancel" value="<?php echo $cancel_button_text; ?>" />

	</form>
</div>
