/* global shareAPhoto */

var shaphAPhotoUploader = false;

var shareAPhotoTemplate = Backbone.View.extend( {
	tagName: 'div',
	setTemplate: function( template ) {
		this.template = _.template( jQuery( '#shaph-template-' + template ).html() );
		return this;
	},
	render: function( data ) {
		this.$el.html( this.template( data ) );
		return this;
	}
});

var shareAPhotoApp = Backbone.Model.extend( {
	currentExtensionPage: false,
	uploader: false,
	selectedFiles: [],
	uploadedFiles: [],

	initialize: function() {
		jQuery( '.shaph-button' ).click( this.open );
		jQuery( '#shaph-cancel' ).click( this.close );
		jQuery( '#shaph-modal' ).on( 'click', '#shaph-finish', this.finish );
	},

	initializePluploader: function() {
		shareAPhoto.App.uploader = new plupload.Uploader({
			browse_button: 'shaph-browse', // this can be an id of a DOM element or the DOM element itself
			url: shareAPhoto.processUpload,
			filters: {
				mime_types: [
					{ title: 'Images', extensions: 'jpg,gif,png' }
				]
			},
			multipart_params: {
				nonce: shareAPhoto.nonce
			}
		});
		shareAPhoto.App.uploader.init();
		shareAPhoto.App.uploader.bind( 'FilesAdded', shareAPhoto.App.pluploadHandlers.filesAdded );
		//shareAPhoto.App.uploader.bind( 'UploadProgress', shareAPhoto.App.uploadProgress );
		//shareAPhoto.App.uploader.bind( 'FileUploaded', shareAPhoto.App.fileUploaded );
		//shareAPhoto.App.uploader.bind( 'UploadComplete', shareAPhoto.App.uploadComplete );
		//jQuery( '#shaph-modal' ).on( 'click', '#shaph-start-upload', shareAPhoto.App.startUpload );
	},

	pluploadHandlers: {
		filesAdded: function( up, files ) {
			plupload.each( files, function( file ) {
				shareAPhoto.App.selectedFiles.push( {
					id : file.id,
					name : file.name
				} );
			});
			shareAPhoto.App.renderTemplate( '#shaph-page', 'image-editor' );
			shareAPhoto.App.renderTemplate( '#shaph-image-attributes', 'image-attributes' );
		}
	},

	resetState: function() {
		if ( shareAPhoto.App.uploader ) {
			shareAPhoto.App.uploader.destroy();
		}
		shareAPhoto.App.currentExtensionPage = false;
		shareAPhoto.App.uploader = false;
		shareAPhoto.App.selectedFiles = [];
		shareAPhoto.App.uploadedFiles = [];
	},

	startUpload: function() {
		shareAPhoto.App.disableButtons();
		shareAPhoto.App.uploader.start();
	},

	uploadProgress: function(up, file) {
		document.getElementById(file.id).getElementsByTagName( 'b' )[0].innerHTML = '<span>' + file.percent + "%</span>";
	},

	fileUploaded: function( up, file, response ) {
		shareAPhoto.App.fileList.push( JSON.parse( response.response ) );
	},

	uploadComplete: function( up, files ) {
		var template = new shareAPhotoTemplate();
		shareAPhoto.App.currentTemplate = shareAPhoto.extensions[0];
		jQuery( '#shaph-page' ).html( template.setTemplate( shareAPhoto.App.currentTemplate ).render( { files: shareAPhoto.App.fileList } ).el );
		shareAPhoto.App.setContentHeight();
	},

	finish: function() {
		shareAPhoto.App.disableButtons();
		jQuery( '.shaph-image-title' ).each( function( index, value ) {
			shareAPhoto.App.fileList[ index ].title = jQuery( value ).val();
		} );

		jQuery( '.shaph-image-caption' ).each( function( index, value ) {
			shareAPhoto.App.fileList[ index ].caption = jQuery( value ).val();
		} );

		jQuery.post(
			shareAPhoto.processPost,
			{
				files: shareAPhoto.App.fileList,
				nonce: shareAPhoto.nonce
			},
			function( response) {
				var template = new shareAPhotoTemplate();
				shareAPhoto.App.currentTemplate = false;
				shareAPhoto.App.fileList = [];
				jQuery( '#shaph-page' ).html( template.setTemplate( 'thank-you' ).render( response ).el );
			},
			'json'
		);
	},

	open: function() {
		jQuery( '#shaph' ).addClass( 'open' );
		shareAPhoto.App.renderTemplate( '#shaph-page', 'uploader' );
		shareAPhoto.App.initializePluploader();
	},

	renderTemplate: function( element, templateName ) {
		var template = new shareAPhotoTemplate();
		jQuery( element ).html( template.setTemplate( templateName ).render().el );
		shareAPhoto.App.setContentHeight();
	},

	setContentHeight: function() {
		var h = jQuery( '#shaph-modal' ).height() + 200;
		jQuery( shareAPhoto.pageEnclosure ).css( { height: h, overflow: 'hidden' } );
	},

	close: function() {
		jQuery( '#shaph' ).removeClass( 'open' );
		shareAPhoto.App.resetState();
		jQuery( shareAPhoto.pageEnclosure ).css( { height: 'auto', overflow: 'auto' } );
	},

	disableButtons: function() {
		jQuery( '.shaph-footer-buttons input' ).prop( 'disabled', true );
	}

} );

jQuery( function() {
	shareAPhoto.App = new shareAPhotoApp();
} );
