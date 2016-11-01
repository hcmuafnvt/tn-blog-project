var simplecrawler = require("simplecrawler"),
      cheerio = require('cheerio'),
      fs = require('fs'),
      path = require('path'),
      syncrequest = require('sync-request');

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
      console.log('queueItem.depth >', queueItem.depth);
      var self = this;
      var $ = cheerio.load(responseBuffer);

      var d = new Date();
      var month = d.getMonth() + 1;
      var year = d.getFullYear();
      var imagefolderPath = path.resolve(process.cwd()) + '/content/images/' + year + '/' + month + '/';

      if(queueItem.depth === 1) {
         getItemImageOnLandingPage($(options.landingPageItemClass), imagefolderPath);
      }

      //var $title = $('.title-content h1');
      var $title = $(options.titleClass);
      console.log('>', $title.text());

      //var $images = $('.journal-content-article img');
      var $images = $(options.imageClass);

      if (!fs.existsSync(imagefolderPath)){
         fs.mkdirSync(imagefolderPath);
      }
      $images.each(function(index) {
         var url = $(this).attr('src');
         var imgName = url.substring(url.lastIndexOf('/') + 1, url.length);
         var fileName = imagefolderPath + imgName;
         console.log(fileName);

         var res = syncrequest('GET', url);
         fs.writeFileSync(fileName, res.getBody());
      });
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

   console.log(images);
}

function donwloadImage (url, imagefolderPath) {
   var imgName = url.substring(url.lastIndexOf('/') + 1, url.length);
   var fileName = imagefolderPath + imgName;
   var res = syncrequest('GET', url);
   fs.writeFileSync(fileName, res.getBody());
}

function getItemInArray(id, arr) {
   arr.forEach(function(elem) {
      if(elem.link === id) {
         return elem;
      }
   });
}

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
   start: start
};

module.exports = instance;
