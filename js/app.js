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
	fileList: [],
	currentImageIndex: false,
	isUploading: false,
	scrollY: 0,

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
				shareAPhoto.App.fileList.push( {
					id: file.id,
					percent: file.percent
				} );
			});
			shareAPhoto.App.renderTemplate( '#shaph-page', 'image-editor' );
			shareAPhoto.App.renderTemplate( '#shaph-image-attributes', 'image-attributes' );
			shareAPhoto.App.isUploading = true;
			shareAPhoto.App.currentImageIndex = 0;
			shareAPhoto.App.setPreviewImage( shareAPhoto.placeholderImage );
			shareAPhoto.App.setActionButton();
			shareAPhoto.App.uploader.start();
		},

		uploadProgress: function(up, file) {
			if ( file.id === shareAPhoto.App.fileList[ shareAPhoto.App.currentImageIndex ].id ) {
				jQuery( '#shaph-image-percent' ).text( file.percent + '%' );
			}
		},

		fileUploaded: function( up, file, response ) {
			var responseObj = JSON.parse( response.response );
			_.extend( _.findWhere( shareAPhoto.App.fileList, { id: file.id } ), responseObj );
			if ( file.id === shareAPhoto.App.fileList[ shareAPhoto.App.currentImageIndex ].id ) {
				shareAPhoto.App.setPreviewImage( responseObj.thumb );
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
		shareAPhoto.App.fileList = [];
		shareAPhoto.App.currentImageIndex = false;
		shareAPhoto.App.isUploading = false;
		shareAPhoto.App.scrollY = 0;
	},

	imageAction: function() {
		jQuery( '.shaph-image-attribute' ).each( function() {
			shareAPhoto.App.fileList[ shareAPhoto.App.currentImageIndex ][ jQuery( this ).attr( 'name' ) ] = jQuery( this ).val();
		} );

		if ( shareAPhoto.App.currentImageIndex + 1 < shareAPhoto.App.fileList.length ) {
			shareAPhoto.App.renderTemplate( '#shaph-image-attributes', 'image-attributes' );
			shareAPhoto.App.currentImageIndex++;
			if ( shareAPhoto.App.fileList[ shareAPhoto.App.currentImageIndex ].thumb ) {
				shareAPhoto.App.setPreviewImage( shareAPhoto.App.fileList[ shareAPhoto.App.currentImageIndex ].thumb );
			} else {
				shareAPhoto.App.setPreviewImage( shareAPhoto.placeholderImage );
			}
			shareAPhoto.App.setActionButton();
		} else if ( shareAPhoto.extensions.length ) {
			shareAPhoto.App.renderTemplate( '#shaph-page', shareAPhoto.App.extensions[0].name );
		} else {
			shareAPhoto.App.finish();
		}
	},

	finish: function() {
		jQuery( '.shaph-footer-buttons input' ).prop( 'disabled', true );
		jQuery.post(
			shareAPhoto.processPost,
			{
				files: shareAPhoto.App.fileList,
				nonce: shareAPhoto.nonce
			},
			function( response ) {
				shareAPhoto.App.renderTemplate( '#shaph-page', 'thank-you', response );
				jQuery( '#shaph-cancel' ).attr( 'value', 'Close' );
			},
			'json'
		);
	},

	open: function() {
		shareAPhoto.App.scrollY = jQuery( window ).scrollTop();
		jQuery( '#shaph' ).addClass( 'open' );
		shareAPhoto.App.renderTemplate( '#shaph-page', 'uploader' );
		shareAPhoto.App.initializePluploader();
	},

	renderTemplate: function( element, templateName, data ) {
		var template = new shareAPhotoTemplate();
		jQuery( element ).html( template.setTemplate( templateName ).render( data ).el );
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

		if ( shareAPhoto.App.currentImageIndex + 1 < shareAPhoto.App.fileList.length ) {
			jQuery( '#shaph-image-action' ).attr( 'value', 'Next Photo' ).prop( 'disabled', false );
		} else if ( shareAPhoto.extensions.length ) {
			jQuery( '#shaph-image-action' ).attr( 'value', 'Next' );
		} else {
			jQuery( '#shaph-image-action' ).attr( 'value', 'Finish' );
		}
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
