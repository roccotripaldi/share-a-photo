<script id="shaph-template-caption" type="text/template">
	<h3 class="shaph-title">
		<% if ( files.length > 1 ) { %>
		Tell us about your photos
		<% } else { %>
		Tell us about your photo
		<% } %>
	</h3>
	<form id="shaph-image-attributes-form">
		<% for( var file in files ) { %>
		<div class="shaph-uploaded-image">
			<img src="<%= files[file].url %>" width="80" />
			<div class="shaph-image-attributes">
				<label>Title</label>
				<input class="shaph-image-title" type="text" name="fileMeta[]" />
				<label>Caption</label>
				<textarea class="shaph-image-caption" name="fileMeta[]]"></textarea>
			</div>
		</div>
		<% } %>
	</form>

	<div class="shaph-footer-buttons">
		<input type="button" id="shaph-finish" value="finish" />
	</div>
</script>
