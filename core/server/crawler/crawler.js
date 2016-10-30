// # Crawlers API
// RESTful API for the Crawler resource

var simplecrawler = require("simplecrawler"),
    cheerio = require('cheerio'),
    fs = require('fs'),
    path = require('path'),
    syncrequest = require('sync-request');

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

/**
 * ### Posts API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 */

//-----start-------
var crawler = new simplecrawler("http://suckhoe.vn/lam-dep/tang-can-giam-can");

crawler.on('fetchstart', function(queueItem, resources) {
   console.log('fetchstart %s', queueItem.url);
});

// crawler.on('fetchcomplete', function(queueItem, responseBody, responseObject) {
//    if(queueItem.stateData.contentType === 'image/jpeg') {
//       var url = queueItem.url;
//       var fileName = 'images/' + url.substring(url.lastIndexOf('/') + 1, url.length);
//       fs.writeFile(fileName, responseBody, function(err){
//            if (err) throw err
//            console.log('File saved.')
//        })
//    }
// });

// crawler.discoverResources = function(buffer, queueItem) {
//     var $ = cheerio.load(buffer.toString("utf8"));

//     return $("img").map(function () {
//          return $(this).attr("src");
//     }).get();
// };

crawler.discoverResources = function(buffer, queueItem) {
   console.log('discoverResources');
    var $ = cheerio.load(buffer.toString("utf8"));
    console.log('length', $('.main-content').find('.assettile a').length);

    return $('.main-content').find('.assettile a').map(function () {
         return $(this).attr("href");
         console.log('discoverResources', $(this).attr("href"));
         console.log('discoverResources', $(this).text());
    }).get();
};

crawler.on('queueadd', function(queueItem) {
   console.log('queueadd %s ', queueItem.url);
});

crawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {
    var self = this;
    var $ = cheerio.load(responseBuffer);
    var $title = $('.title-content h1');
    console.log('>', $title.text());

    var $images = $('.journal-content-article img');
    var d = new Date();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var imagefolderPath = path.resolve(process.cwd()) + '/content/images/' + year + '/' + 11 + '/';
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
crawler.maxDepth = 2; // First page and discovered links from it are fetched
crawler.decodeResponses=true;

//--------End-----

// var instance = {
//     submit: function submit(req, res) {
//         crawler.start();
//         crawler.on('complete', function() {
//            res.json({'status': 'success', 'data': 'Crawler completed'});
//         });
//     }
// };

// module.exports = instance;


//--------End-----

var instance = {
    start: function() {
        crawler.start();
        crawler.on('complete', function() {
           console.log('Crawler completed');
        });
    }
};

module.exports = instance;
