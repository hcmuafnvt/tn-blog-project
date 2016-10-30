var mongoose = require('mongoose');

var config = {
   mongodb: {
      connectionString: 'mongodb://localhost:27017/tn-blog-project-crawler'
   }
};

var mongodb = {
   connect : function() {
      mongoose.connect(config.mongodb.connectionString);
   },
   close : function() {
      mongoose.connection.close(function () {
          console.log('Mongoose disconnected through app termination');
          process.exit(0);
      });
   },
   onError : function() {
      mongoose.connection.on('error', function(err) {
         console.log('Mongoose connection error: ' + err);
      });
   },
   onDisconnected : function() {
      mongoose.connection.on('disconnected', function() {
         console.log('Mongoose disconnected');
      });
   },
   init : function() {
      mongodb.connect();
      mongodb.onError();
      mongodb.onDisconnected();
      process.on('SIGINT', function() {
         mongodb.close();
      });
   }
};

module.exports = mongodb;
