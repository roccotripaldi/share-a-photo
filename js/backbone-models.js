var shareAPhotoModel = Backbone.Model.extend( {
	app: false,
	initialize: function() {
		this.app = this;
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