'use strict';
var Post = require('./post.model'),
    crawler = require('./crawler')

function get(req, res) {
    crawler.start();

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
    res.json('done');
}

var instance = {
    get: get
};

module.exports = instance;
