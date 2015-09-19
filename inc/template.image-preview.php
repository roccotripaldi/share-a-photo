<script id="shaph-template-image-preview" type="text/template">
    <% if ( files[ currentImageIndex ].thumb  ) { %>
        <img src="<%- files[ currentImageIndex ].thumb %>" alt="" />
    <% } else { %>
        <img src="<%- placeholderImage %>" alt="" />
    <% } %>
    <p>Uploaded: <b><%= files[ currentImageIndex ].percent %>%</b></p>
</script>