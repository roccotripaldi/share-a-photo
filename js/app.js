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
	fileList: [],

	initialize: function() {
		jQuery(".shaph-button").click( this.open );
		jQuery("#shaph-cancel").click( this.close );
	},

	initializePluploader: function() {
		shareAPhoto.App.uploader = new plupload.Uploader({
			browse_button: 'shaph-browse', // this can be an id of a DOM element or the DOM element itself
			url: '/?share_a_photo=true',
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
		shareAPhoto.App.uploader.bind( 'FilesAdded', shareAPhoto.App.filesAdded );
		shareAPhoto.App.uploader.bind( 'UploadProgress', shareAPhoto.App.uploadProgress );
		shareAPhoto.App.uploader.bind( 'FileUploaded', shareAPhoto.App.fileUploaded );
		shareAPhoto.App.uploader.bind( 'UploadComplete', shareAPhoto.App.uploadComplete );
		jQuery( '#shaph-form' ).on( 'click', '#shaph-start-upload', shareAPhoto.App.startUpload );
	},

	startUpload: function() {
		shareAPhoto.App.uploader.start();
	},

	filesAdded: function( up, files ) {
		var html = '';
		plupload.each(files, function(file) {
			html += '<li id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ') <b></b></li>';
		});
		jQuery('#shaph-filelist').html( html );
	},

	uploadProgress: function(up, file) {
		document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
	},

	fileUploaded: function( up, file, response ) {
		shareAPhoto.App.fileList.push( JSON.parse( response.response ) );
		console.log( shareAPhoto.App.fileList );
	},

	uploadComplete: function( up, files ) {
		console.log( 'done' );
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
