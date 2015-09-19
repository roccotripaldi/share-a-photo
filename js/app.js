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
	currentExtensionIndex: false,
	uploader: false,
	fileList: [],
	extensionData: {},
	currentImageIndex: false,
	isUploading: false,
	scrollY: 0,

	initialize: function() {
		jQuery( '.shaph-button' ).click( this.open );
		jQuery( '#shaph-cancel' ).click( this.close );
		jQuery( '#shaph-footer-buttons' ).on( 'click', '#shaph-previous-image', this.previousImage );
		jQuery( '#shaph-footer-buttons' ).on( 'click', '#shaph-next', this.nextPage );
		jQuery( '#shaph-footer-buttons' ).on( 'click', '#shaph-finish', this.finish );
		jQuery( '#shaph-footer-buttons' ).on( 'click', '#shaph-next-image', this.nextImage );
		jQuery( '#shaph-footer-buttons' ).on( 'click', '#shaph-shaph-previous', this.previousPage );
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
				shareAPhoto.App.fileList.push( {
					id: file.id,
					percent: file.percent
				} );
			});
			shareAPhoto.App.isUploading = true;
			shareAPhoto.App.renderImage( 0 );
			shareAPhoto.App.uploader.start();
		},

		uploadProgress: function(up, file) {
			_.extend( _.findWhere( shareAPhoto.App.fileList, { id: file.id } ), { percent: file.percent } );
			shareAPhoto.App.renderTemplate( '#shaph-image-preview', 'image-preview' );
		},

		fileUploaded: function( up, file, response ) {
			var responseObj = JSON.parse( response.response );
			_.extend( _.findWhere( shareAPhoto.App.fileList, { id: file.id } ), responseObj );
			shareAPhoto.App.renderTemplate( '#shaph-image-preview', 'image-preview' );
		},

		uploadComplete: function( up, files ) {
			shareAPhoto.App.isUploading = false;
			shareAPhoto.App.renderButtons();
		}
	},

	resetState: function() {
		if ( shareAPhoto.App.uploader ) {
			shareAPhoto.App.uploader.destroy();
		}
		shareAPhoto.App.currentExtensionIndex = false;
		shareAPhoto.App.uploader = false;
		shareAPhoto.App.fileList = [];
		shareAPhoto.App.extensionData = {};
		shareAPhoto.App.currentImageIndex = false;
		shareAPhoto.App.isUploading = false;
		shareAPhoto.App.scrollY = 0;
	},

	setImageAttributes: function() {
		jQuery( '.shaph-image-attribute' ).each( function() {
			shareAPhoto.App.fileList[ shareAPhoto.App.currentImageIndex ][ jQuery( this ).attr( 'name' ) ] = jQuery( this ).val();
		} );
	},

	setExtensionData: function() {
		jQuery( '.shaph-extension-data' ).each( function() {
			shareAPhoto.App.extensionData[ jQuery( this ).attr( 'name' ) ] = jQuery( this ).val();
		} );
	},

	previousPage: function() {
		shareAPhoto.App.setExtensionData();
		if ( shareAPhoto.App.currentExtensionIndex === 0 ) {
			var imageIndex = shareAPhoto.App.fileList.length - 1;
			shareAPhoto.App.currentExtensionIndex = false;
			shareAPhoto.App.renderImage( imageIndex );
		} else {
			shareAPhoto.App.renderExtension( shareAPhoto.App.currentExtensionIndex - 1 );
		}
	},

	previousImage: function() {
		shareAPhoto.App.setImageAttributes();
		shareAPhoto.App.renderImage( shareAPhoto.App.currentImageIndex - 1 );
	},

	nextPage: function() {
		if ( shareAPhoto.App.currentImageIndex ) {
			shareAPhoto.App.setImageAttributes();
			shareAPhoto.App.currentImageIndex = false;
			shareAPhoto.App.renderExtension( 0 );
		} else {
			shareAPhoto.App.setExtensionData();
			shareAPhoto.App.renderExtension( shareAPhoto.App.currentExtensionIndex + 1 );
		}
	},

	nextImage: function() {
		shareAPhoto.App.setImageAttributes();
		shareAPhoto.App.renderImage( shareAPhoto.App.currentImageIndex + 1 );
	},

	finish: function() {
		if ( shareAPhoto.App.currentImageIndex ) {
			shareAPhoto.App.setImageAttributes();
		} else {
			shareAPhoto.App.setExtensionData();
		}
		jQuery( '#shaph-footer-buttons input' ).prop( 'disabled', true );
		shareAPhoto.App.currentExtensionIndex = false;
		shareAPhoto.App.currentImageIndex = false;
		jQuery.post(
			shareAPhoto.processPost,
			{
				files: shareAPhoto.App.fileList,
				nonce: shareAPhoto.nonce
			},
			function( response ) {
				shareAPhoto.App.renderTemplate( '#shaph-page', 'thank-you', response );
				shareAPhoto.App.renderButtons();
				jQuery( '#shaph-cancel' ).attr( 'value', 'Close' );
			},
			'json'
		);
	},

	open: function() {
		shareAPhoto.App.scrollY = jQuery( window ).scrollTop();
		jQuery( '#shaph' ).addClass( 'open' );
		shareAPhoto.App.renderTemplate( '#shaph-page', 'uploader' );
		shareAPhoto.App.renderButtons();
		shareAPhoto.App.initializePluploader();
	},

	renderImage: function( index ) {
		shareAPhoto.App.currentImageIndex = index;
		shareAPhoto.App.renderTemplate( '#shaph-page', 'image-editor' );
		shareAPhoto.App.renderTemplate( '#shaph-image-preview', 'image-preview' );
		shareAPhoto.App.renderTemplate( '#shaph-image-attributes', 'image-attributes' );
		shareAPhoto.App.renderButtons();
	},

	renderExtension: function( index ) {
		shareAPhoto.App.currentExtensionIndex = index;
		shareAPhoto.App.renderTemplate( '#shaph-page', shareAPhoto.extensions[ index ] );
		shareAPhoto.App.renderButtons();
	},

	renderButtons: function() {
		shareAPhoto.App.renderTemplate( '#shaph-footer-buttons', 'footer-buttons' );
	},

	renderTemplate: function( element, templateName, data ) {
		var template = new shareAPhotoTemplate(),
			defaultData = {
				files: shareAPhoto.App.fileList,
				currentImageIndex: shareAPhoto.App.currentImageIndex,
				isUploading: shareAPhoto.App.isUploading,
				numExtensions: shareAPhoto.extensions.length,
				currentExtensionIndex: shareAPhoto.App.currentExtensionIndex,
				placeholderImage : shareAPhoto.placeholderImage
			},
			templateData;
		data = data || {};
		templateData = _.extend( defaultData, data );
		jQuery( element ).html( template.setTemplate( templateName ).render( templateData ).el );
		shareAPhoto.App.setContentHeight();
	},

	setContentHeight: function() {
		var modalHeight = jQuery( '#shaph-modal' ).height() + 200,
			windowHeight = jQuery( window ).height();
		jQuery( shareAPhoto.pageEnclosure ).css( { height: Math.max( modalHeight, windowHeight ), overflow: 'hidden', position: 'fixed' } );
	},

	close: function() {
		jQuery( '#shaph' ).removeClass( 'open' );
		jQuery( shareAPhoto.pageEnclosure ).css( { height: 'auto', overflow: 'auto', position: 'static' } );
		jQuery( 'body, html' ).scrollTop( shareAPhoto.App.scrollY );
		shareAPhoto.App.resetState();
	}

} );

jQuery( function() {
	shareAPhoto.App = new shareAPhotoApp();
} );
