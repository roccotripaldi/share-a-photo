<?php

$defaults = array(
	'open' => 'Share A Photo',
	'id' => 'shaph-form-' . wp_generate_password( 6, false ),
);

$settings = array_merge( $defaults, $this->settings );

?>
<form class="shaph-form" id="<?php echo $settings['id']; ?>">
	<input
		type="button"
		value="<?php echo $settings['open']; ?>"
		class="shaph-button-open"
	    data-id="<?php echo $settings['id']; ?>"
	/>

	<fieldset>
	</fieldset>

</form>