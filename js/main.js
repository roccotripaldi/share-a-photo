jQuery( function() {

	jQuery(".shaph-button-open").click( function() {
		var id = jQuery(this).data("id");
		jQuery("#" + id).addClass("open");
		console.log('click');
	});

} );
