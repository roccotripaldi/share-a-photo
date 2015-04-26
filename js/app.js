/* global shareAPhoto */

var shareAPhotoFieldset = Backbone.View.extend( {
	tagName: 'div',
	setTemplate: function( template ) {
		this.template = _.template( jQuery('#shaph-template-' + template).html() );
		return this;
	},
	render: function() {
		this.$el.html( this.template() );
		return this;
	}
});

var shareAPhotoApp = Backbone.Model.extend( {
	currentTemplate: null,
	uploader: null,

	initialize: function() {
		jQuery(".shaph-button").click( this.open );
		jQuery("#shaph-cancel").click( this.close );
		this.uploader = new plupload.Uploader({
			browse_button: 'browse', // this can be an id of a DOM element or the DOM element itself
			url: 'upload.php'
		});
	},

	open: function() {
		var fieldset = new shareAPhotoFieldset(),
			template = 'uploader';
		jQuery("#shaph-form").addClass("open");
		if ( shareAPhoto.App.currentTemplate && _.indexOf( shareAPhoto.templates, shareAPhoto.App.currentTemplate ) >= 0 ) {
			template = shareAPhoto.App.currentTemplate;
		}
		jQuery("#shaph-fieldset").html( fieldset.setTemplate(template).render().el );
	},
	close: function() {
		jQuery("#shaph-form").removeClass("open");
	}
} );

jQuery( function() {
	shareAPhoto.App = new shareAPhotoApp();
} );
