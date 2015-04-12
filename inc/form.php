<?php

$defaults = array(
	'open' => 'Share A Photo',
);

$settings = array_merge( $defaults, $this->settings );

?>
<form id="shaph-form">
	<input type="button" value="<?php echo $settings['open']; ?>" />
</form>