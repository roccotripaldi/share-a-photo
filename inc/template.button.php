<?php

$defaults = array(
	'button_text' => 'Share A Photo',
	'button_id' => 'shaph-button'
);

$settings = array_merge( $defaults, $this->settings );

?>
<input
	type="button"
	id="<?php echo $settings['button_id']; ?>"
	class="shaph-button"
	value="<?php echo $settings['button_text']; ?>" />
