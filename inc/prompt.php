<?php

$defaults = array(
	'text' => 'Share A Photo',
	'id' => 'shaph-button'
);

$settings = array_merge( $defaults, $this->settings );

?>
<input
	type="button"
	id="<?php echo $settings['id']; ?>"
	class="shaph-button"
	value="<?php echo $settings['text']; ?>" />