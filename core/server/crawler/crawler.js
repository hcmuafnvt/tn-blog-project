var simplecrawler = require("simplecrawler"),
cheerio = require('cheerio'),
fs = require('fs'),
path = require('path'),
syncrequest = require('sync-request'),
toMarkdown = require('to-markdown'),
Post = require('./post.model'),
postAPIs = require('../api/posts'),
mkdirp = require('mkdirp'),
slugify = require('slugify');


var images = [];

function start(options) {
   var crawler = new simplecrawler(options.url);

   crawler.on('fetchstart', function(queueItem, resources) {
      console.log('fetchstart %s', queueItem.url);
   });

   crawler.discoverResources = function(buffer, queueItem) {
      console.log('discoverResources');
      var $ = cheerio.load(buffer.toString("utf8"));
      //$('.main-content .assettile a')
      console.log('length', $(options.discoverClass).length);

      return $(options.discoverClass).map(function () {
         return $(this).attr("href");
         console.log('discoverResources', $(this).attr("href"));
         console.log('discoverResources', $(this).text());
      }).get();
   };

   crawler.on('queueadd', function(queueItem) {
      console.log('queueadd %s ', queueItem.url);
   });

   crawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {
      var con = this.wait();
      console.log('queueItem.depth >', queueItem.depth);
      var self = this;
      var $ = cheerio.load(responseBuffer);

      var d = new Date();
      var month = d.getMonth() + 1;
      var year = d.getFullYear();
      var imagefolderPath = path.resolve(process.cwd()) + '/content/images/' + year + '/' + month + '/';
      if (!fs.existsSync(imagefolderPath)){
         mkdirp.sync(imagefolderPath)
         //fs.mkdirSync(imagefolderPath);
      }

      if(queueItem.depth === 1) {
         getItemImageOnLandingPage($(options.landingPageItemClass), imagefolderPath);
      }

      //var $title = $('.title-content h1');
      var $title = $(options.titleClass);

      //var $images = $('.journal-content-article img');
      // var $images = $(options.imageClass);

      // $images.each(function(index) {
      //    var url = $(this).attr('src');
      //    var imgName = url.substring(url.lastIndexOf('/') + 1, url.length);
      //    var fileName = imagefolderPath + imgName;
      //    console.log(fileName);
      //
      //    var res = syncrequest('GET', url);
      //    fs.writeFileSync(fileName, res.getBody());
      // });

      var items = getItemInArray(queueItem.url, images);
      var postData = {
         imageurl: items.length > 0 ? items[0].imageurl : '',
         title: $title.text(),
         slug: slugify($title.text()),
         htmlcontent: $(options.contentClass).html()
      };

      if(postData.title !== '') {
         Post.create(postData, function(err, post) {
            if(err) {
               console.log(err);
               return;
               con();
            }
            con();
         });
      }
   });

   crawler.interval = 10000; // Ten seconds
   crawler.maxConcurrency = 3;
   crawler.maxDepth = options.maxDepth; // First page and discovered links from it are fetched
   crawler.decodeResponses=true;

   crawler.start();

   var promise = new Promise(function(resolve, reject) {
      crawler.on('complete', function() {
         console.log('Crawler completed');
         resolve({msg: 'Crawler completed'});
      });
   })
   return promise;
}

function getItemImageOnLandingPage($items, imagefolderPath) {
   $items.each(function(index) {
      var $ = cheerio.load(this);
      var imageurl = $('img').attr('src');
      donwloadImage(imageurl, imagefolderPath);
      images.push({
         imageurl: imageurl,
         link: $('a').attr('href')
      });
   });
}

function donwloadImage (url, imagefolderPath) {
   var imgName = url.substring(url.lastIndexOf('/') + 1, url.length);
   var fileName = imagefolderPath + imgName;
   var res = syncrequest('GET', url);
   fs.writeFileSync(fileName, res.getBody());
}

function getItemInArray(id, arr) {
   return arr.filter(function(obj) {
      return obj.link == id;
   });
}

function savePostToGhost (id) {
   var promise = new Promise(function(resolve, reject) {
      Post.findById(id, function(err, post) {
         if(err) {
            console.log(err);
            return;
         }

         // var $ = cheerio.load(post.htmlcontent);
         // $('a[href="javascript:void(0)"]').remove();
         var result = toMarkdown(post.htmlcontent, {
            converters: [
               {
                  filter: 'div',
                  replacement: function(content) {
                     return '\n' + content + '\n\n';
                  }
               }
            ]
         });

         var object = {
            posts: [
               {
                  title: post.title,
                  slug: post.title,
                  markdown: result,
                  image: post.imageurl,
                  featured: false,
                  page: false,
                  status: 'draft',
                  language: 'en_US',
                  meta_title: null,
                  meta_description: null,
                  author: '1',
                  publishedBy: null,
                  tags: []
               }
            ]
         };
         var options = { include: 'tags', context: { user: 1, client: null } };
         postAPIs.add(object, options).tap(function onSuccess(response) {
            resolve(response);
         }).then(function then(response) {
            resolve(response);
         }).catch(function onAPIError(error) {
            reject(error);
         });
      });
   });

   return promise;
}

function convertToSlug(text)
{
    return text.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
}

var slug = function(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
  var to   = "aaaaaeeeeeiiiiooooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
};

function getBody(encoding) {
   if (this.statusCode >= 300) {
      var err = new Error('Server responded with status code ' + this.statusCode + ':\n' + this.body.toString(encoding));
      err.statusCode = this.statusCode;
      err.headers = this.headers;
      err.body = this.body;
      throw err;
   }
   return encoding ? this.body.toString(encoding) : this.body;
}

var instance = {
   start: start,
   savePostToGhost: savePostToGhost
};

module.exports = instance;
