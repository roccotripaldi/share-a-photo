<script id="shaph-template-footer-buttons" type="text/template">
<% if ( currentImageIndex !== false ) { %>
    <% if ( currentImageIndex > 0 ) { %>
        <input type="button" id="shaph-previous-image" value="Previous Image" />
    <% } %>
    <% if ( currentImageIndex === files.length - 1 ) { %>
        <% if ( numExtensions > 0 ) { %>
            <input type="button" id="shaph-next" value="Next" />
        <% } else { %>
            <input type="button" id="shaph-finish" value="Finish" <% if ( isUploading ) { %>disable="disabled"<% } %> />
        <% } %>
    <% } else { %>
        <input type="button" id="shaph-next-image" value="Next Image" />
    <% } %>
<% } else if ( currentExtensionIndex !== false ) { %>
    <input type="button" id="shaph-previous" value="Previous" />
    <% if ( currentExtensionIndex === numExtensions - 1 ) { %>
        <input type="button" id="shaph-finish" value="Finish" <% if ( isUploading ) { %>disable="disabled"<% } %> />
    <% } else { %>
        <input type="button" id="shaph-next" value="Next" />
    <% } %>
<% } %>
</script>