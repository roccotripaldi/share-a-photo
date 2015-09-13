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
	uploadedFiles: {},
	currentImageId: false,
	currentImageIndex: false,
	isUploading: false,

	initialize: function() {
		jQuery( '.shaph-button' ).click( this.open );
		jQuery( '#shaph-cancel' ).click( this.close );
		jQuery( '#shaph-modal' ).on( 'click', '#shaph-image-action', this.imageAction );
	},

	initializePluploader: function() {
		shareAPhoto.App.uploader = new plupload.Uploader({
			browse_button: 'shaph-browse',
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
		shareAPhoto.App.uploader.bind( 'UploadProgress', shareAPhoto.App.pluploadHandlers.uploadProgress );
		shareAPhoto.App.uploader.bind( 'FileUploaded', shareAPhoto.App.pluploadHandlers.fileUploaded );
		shareAPhoto.App.uploader.bind( 'UploadComplete', shareAPhoto.App.pluploadHandlers.uploadComplete );

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
			shareAPhoto.App.isUploading = true;
			shareAPhoto.App.currentImageId = shareAPhoto.App.selectedFiles[0].id;
			shareAPhoto.App.currentImageIndex = 0;
			shareAPhoto.App.setPreviewImage( shareAPhoto.placeholderImage );
			shareAPhoto.App.setActionButton();
			shareAPhoto.App.uploader.start();
		},

		uploadProgress: function(up, file) {
			if ( file.id === shareAPhoto.App.currentImageId ) {
				jQuery( '#shaph-image-percent' ).text( file.percent + '%' );
			}
		},

		fileUploaded: function( up, file, response ) {
			var responseObj = JSON.parse( response.response );
			shareAPhoto.App.uploadedFiles[ file.id ] = responseObj;
			console.log(shareAPhoto.App.uploadedFiles);
			if ( file.id === shareAPhoto.App.currentImageId ) {
				shareAPhoto.App.setPreviewImage( responseObj.url );
			}
		},

		uploadComplete: function( up, files ) {
			shareAPhoto.App.isUploading = false;
			shareAPhoto.App.setActionButton();
		}
	},

	resetState: function() {
		if ( shareAPhoto.App.uploader ) {
			shareAPhoto.App.uploader.destroy();
		}
		shareAPhoto.App.currentExtensionPage = false;
		shareAPhoto.App.uploader = false;
		shareAPhoto.App.selectedFiles = [];
		shareAPhoto.App.uploadedFiles = {};
		shareAPhoto.App.currentImageId = false;
		shareAPhoto.App.currentImageIndex = false;
		shareAPhoto.App.isUploading = false;
	},

	imageAction: function() {
		jQuery( '.shaph-image-attribute' ).each( function() {
			shareAPhoto.App.uploadedFiles[ shareAPhoto.App.currentImageId ][ jQuery( this ).attr( 'name' ) ] = jQuery( this ).val();
		} );
		console.log( shareAPhoto.App.uploadedFiles );
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

	setPreviewImage: function( src ) {
		jQuery( "#shaph-image-placeholder" ).attr( 'src', src );
		shareAPhoto.App.setContentHeight();
	},

	setActionButton: function() {
		
		if ( shareAPhoto.App.isUploading ) {
			jQuery( '#shaph-image-action' ).prop( 'disabled', true );
		} else {
			jQuery( '#shaph-image-action' ).prop( 'disabled', false );
		}

		if ( shareAPhoto.App.currentImageIndex + 1 < shareAPhoto.App.selectedFiles.length ) {
			jQuery( '#shaph-image-action' ).attr( 'value', 'Next Photo' ).prop( 'disabled', false );
		} else if ( shareAPhoto.extensions.length ) {
			jQuery( '#shaph-image-action' ).attr( 'value', 'Next' );
		} else {
			jQuery( '#shaph-image-action' ).attr( 'value', 'Finish' );
		}
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
