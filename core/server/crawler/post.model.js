'use strict';

var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
   title: {
      type: String
   },
   slug: {
      type: String
   },
   tags: {
      type: String
   },
   desc: {
      type: String
   },
   markdown: {
      type: String
   },
   htmlcontent: {
      type: String
   },
   imageurl: {
      type: String
   },
   saved_to_theherworld: {
      type: Boolean
   }
});


module.exports = mongoose.model('Post', PostSchema);
