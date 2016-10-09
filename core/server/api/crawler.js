// # Crawlers API
// RESTful API for the Crawler resource
var Promise         = require('bluebird'),
    _               = require('lodash'),
    dataProvider    = require('../models'),
    errors          = require('../errors'),
    utils           = require('./utils'),
    pipeline        = require('../utils/pipeline'),
    i18n            = require('../i18n'),
    simplecrawler = require("simplecrawler"),
    cheerio = require('cheerio'),
    fs = require('fs'),
    toMarkdown = require('to-markdown'),

    docName         = 'posts',
    allowedIncludes = [
        'created_by', 'updated_by', 'published_by', 'author', 'tags', 'fields',
        'next', 'previous', 'next.author', 'next.tags', 'previous.author', 'previous.tags'
    ],
    crawlers;

/**
 * ### Posts API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 */

//-----start-------
var crawler = new simplecrawler("http://vnexpress.net/photo/thoi-su/ngay-dau-khao-co-noi-nghi-chon-cat-vua-quang-trung-3480411.html");

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

crawler.on('queueadd', function(queueItem) {
   console.log('queueadd %s ', queueItem.url);
});

crawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {
    var self = this;
    var con = self.wait();
    console.log(responseBuffer);
    var $ = cheerio.load(responseBuffer);
    var $content = $('#article_content');
    $content.find('a[href="javascript:void(0)"]').remove();
    var result = toMarkdown($content.html(), {
      converters: [
        {
          filter: 'div',
          replacement: function(content) {
            return '\n' + content + '\n\n';
          }
        }
      ]
    });
    var object = { posts:
        [ { title: $('.title_news h1').text(),
            slug: $('.title_news h1').text(),
            markdown: result,
            image: 'http://img.f29.vnecdn.net/2016/10/07/cao-toc-9782-1475829984.jpg',
            featured: false,
            page: false,
            status: 'draft',
            language: 'en_US',
            meta_title: null,
            meta_description: null,
            author: '1',
            publishedBy: null,
            tags: [] }
        ]
    };

    var options = { include: 'tags', context: { user: 1, client: null } };

    var tasks;

    /**
     * ### Model Query
     * Make the call to the Model layer
     * @param {Object} options
     * @returns {Object} options
     */
    function modelQuery(options) {
        return dataProvider.Post.add(options.data.posts[0], _.omit(options, ['data']));
    }

    // Push all of our tasks into a `tasks` array in the correct order
    tasks = [
        utils.validate(docName),
        utils.handlePermissions(docName, 'add'),
        utils.convertOptions(allowedIncludes),
        modelQuery
    ];

    // Pipeline calls each task passing the result of one to be the arguments for the next
    pipeline(tasks, object, options).then(function formatResponse(result) {
        self.queueURL("http://vnexpress.net/photo/thoi-su/ngay-dau-khao-co-noi-nghi-chon-cat-vua-quang-trung-3480411.html", queueItem, false);
        con();
    });
});

crawler.interval = 10000; // Ten seconds
crawler.maxConcurrency = 3;
crawler.maxDepth = 1; // First page and discovered links from it are fetched
crawler.decodeResponses=true;

//--------End-----

crawlers = {
    submit: function submit(req, res) {
        crawler.start();
        crawler.on('complete', function() {
           res.json({'status': 'success', 'data': 'Crawler completed'});
        });
    }
};

module.exports = crawlers;
