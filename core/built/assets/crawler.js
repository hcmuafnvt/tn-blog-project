(function () {
  function bindPosts() {
    $.ajax({
      url: '/ghost/api/v0.1/crawler/getposts',
      method: 'GET',
      success: function (posts) {
        for (var i = 0; i < posts.length; i++) {
          $('#listPosts').append(generatePost(posts[i]));
        }
      }
    });
  }

  function crawl() {
    $('#btnSubmit').click(function (e) {
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
        url: '/ghost/api/v0.1/crawler/submit',
        method: 'POST',
        data: data,
        beforeSend: function () {
          $self.text('Submitting...');
          $self.attr('disabled', 'disabled');
        },
        success: function (res) {
          console.log(res);
          $self.text('Submit');
          $self.removeAttr('disabled');
        },
        fail: function (err) {
          console.log(err);
        }
      });

      return;
    })
  }



  function savePostToGhost() {
    $('#section-crawler').on('click', '.btn-save', function (e) {
      e.preventDefault();
      var $self = $(this);

      var data = {
        id: $self.closest('tr').data('id')
      };

      $.ajax({
        url: '/ghost/api/v0.1/crawler/saveposttoghost',
        method: 'POST',
        data: data,
        beforeSend: function () {
          $self.text('Saving...');
          $self.attr('disabled', 'disabled');
        },
        success: function (res) {
          console.log(res);
          $self.text('Save');
          $self.removeAttr('disabled');
        },
        fail: function (err) {
          console.log(err);
        }
      });
    });
  }

  //private function
  function generatePost(post) {
    return `<tr data-id="${post._id}">
                  <td><div class="product-image" style=""><img src="${post.imageurl}"></div></td>
                  <td>${post.title}</td>
                  <td>
                    <div class="checkbox">
                        <label>
                          <input type="checkbox" checked="${post.saved_to_theherworld}">
                        </label>
                    </div>
                  </td>
                  <td>
                    <button type="button" class="btn btn-link btn-save">Save</button>
                    <button type="button" class="btn btn-link btn-edit">Edit</button>
                    <button type="button" class="btn btn-link btn-delete">Delete</button>
                  </td>
               </tr>`;
  }

  function editPost() {
    $('#section-crawler').on('click', '.btn-edit', function (e) {
      e.preventDefault();
      var $self = $(this);
      $.ajax({
        url: '/ghost/api/v0.1/crawler/getbyid/' + $self.closest('tr').data('id'),
        method: 'GET',
        success: function (post) {
          $('#section-crawler').hide();

          $('#edit-image').attr('src', post.imageurl);
          $('#edit-title').val(post.title);
          $('#edit-slug').val(post.slug);
          tinymce.get('edit-content').setContent(post.htmlcontent);
          //$('#edit-content').html(post.htmlcontent);
          $('#section-edit').show();
        }
      });
    });
  }

  function spintContent() {
    $('#frmEditPost').on('click', '#btn-edit-spin', function() {
      var result = window.spinDataUtil.updateContentWithCurlyBrackets(tinymce.get('edit-content').getContent());
      console.log(result);
      tinymce.get('edit-content').setContent(result);
      //console.log(window.spinDataUtil.updateContentWithCurlyBrackets());
    });
  }

  $(function () {
    tinymce.init({
      selector: 'textarea',
      height: 700,
    });
    bindPosts();
    crawl();
    savePostToGhost();
    editPost();
    spintContent();
  });
})();
