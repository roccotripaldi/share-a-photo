<script id="shaph-template-image-attributes" type="text/template">
    <label>Title</label>
    <input
        type="text"
        class="shaph-image-attribute text-input"
        name="title"
        <% if ( files[ currentImageIndex ].title ) { %>value="<%- files[ currentImageIndex ].title %>" <% } %>/>

    <label>Caption</label>
    <textarea class="shaph-image-attribute text-input" name="caption"><% if ( files[ currentImageIndex ].caption ) { %><%- files[ currentImageIndex ].caption %><% } %></textarea>
</script>