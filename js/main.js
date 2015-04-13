jQuery( function() {

	jQuery(".shaph-button").click( shareAPhoto.open );
	jQuery("#shaph-cancel").click( shareAPhoto.close );

} );

var shareAPhoto = {
	open: function() {
		jQuery("#shaph-form").addClass("open");
	},
	close: function() {
		jQuery("#shaph-form").removeClass("open");
	}
};
