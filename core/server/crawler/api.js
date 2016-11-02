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
}

function savePostToGhost (req, res) {
   crawler.savePostToGhost(req.body.id).then(function(data) {
      res.json(data);
   }).catch(function(err) {
      console.log(err);
      res.json({err: err});
   });
}

var instance = {
   get: get,
   crawl: crawl,
   savePostToGhost: savePostToGhost
};

module.exports = instance;
