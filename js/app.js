/* global shareAPhoto */

var shaphAPhotoUploader = false;

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
	currentTemplate: false,
	uploader: false,

	initialize: function() {
		jQuery(".shaph-button").click( this.open );
		jQuery("#shaph-cancel").click( this.close );
	},

	initializePluploader: function() {
		shareAPhoto.App.uploader = new plupload.Uploader({
			browse_button: 'browse', // this can be an id of a DOM element or the DOM element itself
			url: '/?share_a_photo=true',
			multipart_params: {
				nonce: shareAPhoto.nonce
			}
		});
		shareAPhoto.App.uploader.init();
		jQuery( '#shaph-form' ).on( 'click', '#start-upload', shareAPhoto.App.startUpload );
	},

	startUpload: function() {
		shareAPhoto.App.uploader.start();
	},

	open: function() {
		var fieldset = new shareAPhotoFieldset(),
			template = 'uploader';
		jQuery("#shaph-form").addClass("open");

		if ( shareAPhoto.App.currentTemplate && _.indexOf( shareAPhoto.templates, shareAPhoto.App.currentTemplate ) >= 0 ) {
			template = shareAPhoto.App.currentTemplate;
		}

		jQuery("#shaph-fieldset").html( fieldset.setTemplate(template).render().el );

		if ( ! shareAPhoto.App.uploader && ! shareAPhoto.App.currentTemplate ) {
			shareAPhoto.App.initializePluploader();
		}
	},
	close: function() {
		jQuery("#shaph-form").removeClass("open");
		if ( shareAPhoto.App.uploader ) {
			shareAPhoto.App.uploader.destroy();
			shareAPhoto.App.uploader = false;
		}
	}
} );

jQuery( function() {
	shareAPhoto.App = new shareAPhotoApp();
} );
