(function() {
   function bindPosts() {
      $.ajax({
         url: '/ghost/api/v0.1/crawler',
         method: 'GET',
         success: function(posts) {
            for(var i=0; i < posts.length; i++) {
               $('#listPosts').append(generatePost(posts[i]));
            }

            //$('#listPosts').append(tr);
            console.log(posts);
         }
      });
   }

   function crawl() {
      $('#btnSubmit').click(function(e) {
         e.preventDefault();
         var $self = $(this);

         var data = {
            url: $('#txtUrl').val(),
            landingPageItemClass: $('#txtLandingPageItemClass').val(),
            discoverClass: $('#txtDiscoverClass').val(),
            imageClass: $('#txtImageClass').val(),
            titleClass: $('#txtTitle').val(),
            contentClass: $('#txtContent').val(),
            maxDepth: $('#ddlMaxDepth').val()
         }

         $.ajax({
            url: '/ghost/api/v0.1/crawler',
            method: 'POST',
            data: data,
            beforeSend: function() {
               $self.text('Submitting...')
               $self.attr('disabled', 'disabled');
            },
            success: function(res) {
               console.log(res);
               $self.text('Submit')
               $self.removeAttr('disabled');
            },
            fail: function(err) {
               console.log(err);
            }
         });

         return;
      })
   }

   //private function
   function generatePost(post) {
      return `<tr>
                  <td><img src="${post.imageurl}"></td>
                  <td>${post.title}</td>
                  <td>
                    <div class="checkbox">
                        <label>
                          <input type="checkbox" checked="${post.saved_to_theherworld}">
                        </label>
                    </div>
                  </td>
                  <td>
                    <button type="button" class="btn btn-link">Save</button>
                    <button type="button" class="btn btn-link">Delete</button>
                  </td>
               </tr>`;
   }

   $(function() {
      bindPosts();
      crawl();
   });
})();
