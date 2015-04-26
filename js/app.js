/* global shareAPhoto */
var shareAPhotoApp = Backbone.Model.extend( {
	initialize: function() {
		jQuery(".shaph-button").click( this.open );
		jQuery("#shaph-cancel").click( this.close );
	},

	open: function() {
		jQuery("#shaph-form").addClass("open");
	},
	close: function() {
		jQuery("#shaph-form").removeClass("open");
	}
} );

jQuery( function() {
	shareAPhoto.App = new shareAPhotoApp();
} );
