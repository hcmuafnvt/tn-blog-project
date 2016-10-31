'use strict';
var Post = require('./post.model'),
    crawler = require('./crawler')

function get(req, res) {
    Post.find(function(err, posts) {
        if(err) {
            res.json({err: err});
            return;
        }

        res.json(posts);
    });
}

function crawl(req, res) {
    crawler.start(req.body).then(function(data) {
        res.json(data);
    }).catch(function(err) {
        res.json({error: err});
    });

    // Post.create({
    //     title: 'test 1',
    //     desc: 'des',
    //     markdown: '# markdown',
    //     htmlcontent: '<p>html content</p>',
    //     imageurl: 'image url',
    //     saved_to_theherworld: true
    // }, function(err, post) {
    //     if(err) {
    //        console.log(err);
    //        return;
    //     }

    //     res.json(post);
    // });
}

var instance = {
    get: get,
    crawl: crawl
};

module.exports = instance;
