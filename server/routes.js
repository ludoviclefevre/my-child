/**
 * Main application routes
 */

'use strict';

var passport = require('passport')
var errors = require('./components/errors');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var localEnv = require('./config/local.env.js');
var crypto = require('crypto');

var ObjectId = require('mongodb').ObjectID;

var AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: localEnv.AwsAccessKeyId,
  secretAccessKey: localEnv.AwsSecretKey
});

var BucketName = 'mychildfr2';

module.exports = function(app) {

  // Insert routes below
  app.use('/api/things', ensureAuthenticated, require('./api/thing'));
  app.use('/api/tools', ensureAuthenticated, require('./api/tools'));

  //----------------------------------------------------------------------

  app.post('/api/getTempUrlRead', function(req, res, next) {
    var s3 = new AWS.S3();
    var filename = req.body._id + "/" + req.body.file;
    var params = {
      Bucket: BucketName,
      Key: filename
    };
    s3.getSignedUrl('getObject', params, function(err, url) {
      if (err) {
        return next(err);
      }
      res.send(url);
    });
  });

  //----------------------------------------------------------------------


  app.post('/api/getTempUrlWrite', function(req, res) { // TODO : ajouter ensureAuthenticated

    var s3 = new AWS.S3();

    var filename = req.body.name;
    var ext = "";
    if (filename.indexOf(".") > -1) {
      ext = "." + filename.split('.').pop();
    }

    var fileId = crypto.randomBytes(20).toString('hex') + ext;
    var params = {
      Bucket: BucketName,
      Key: req.body.postId + "/" + fileId,
      ContentType: req.body.type
    };
    s3.getSignedUrl('putObject', params, function(err, url) {
      if (err) {
        return next(err);
      }
      res.json({
        url: url,
        fileId: fileId
      });
    });
  });
  //----------------------------------------------------------------------
  app.post('/api/getTempUrlWriteOptim', function(req, res) { // TODO : ajouter ensureAuthenticated
    var s3 = new AWS.S3();

    var filenameArr = req.body.filenameArr;

    var ret = [];

    filenameArr.forEach(function(filename) {
      var ext = "";
      if (filename.indexOf(".") > -1) {
        ext = "." + filename.split('.').pop();
      }

      var fileId = crypto.randomBytes(20).toString('hex') + ext;
      var params = {
        Bucket: BucketName,
        Key: req.body.postId + "/" + fileId,
        ContentType: req.body.type
      };
      var url = s3.getSignedUrl('putObject', params);
      ret.push({
        url: url,
        fileId: fileId,
        filename: filename
      });
    });
    res.send(ret);

  });

  //----------------------------------------------------------------------
  app.delete('/api/posts/:id', function(req, res, next) {
    MongoClient.connect(localEnv.mongoConnString, function(err, db) {
      if (err) {
        console.log('mongo conn err');
        return next(err);
      }
      console.log("Connected correctly to server");

      var collection = db.collection('mychild');
      var id = req.params.id

      console.log('id:', id)

      collection.remove({
        _id: new ObjectId(id)
      }, function(err, result) {
        db.close();
        if (err) {
          console.log('error delete:', err)
          return next(err);
        }
        res.send('ok');
      });
    });
  });

  //----------------------------------------------------------------------
  app.put('/api/posts', function(req, res, next) { // TODO : ajouter ensureAuthenticated
    console.log('new post:', req.body.title);

    MongoClient.connect(localEnv.mongoConnString, function(err, db) {
      if (err) {
        console.log('mongo conn err');
        return next(err);
      }
      console.log("Connected correctly to server");

      var collection = db.collection('mychild');
      console.log('id:', req.body._id)
      var id = req.body._id

      delete req.body._id;
      collection.update({
        _id: new ObjectId(id)
      }, req.body, function(err, result) {
        db.close();
        if (err) {
          console.log('error update:', err)
          return next(err);
        }
        console.log(req.body)
        res.send('ok');
      });


    });

  });

  //----------------------------------------------------------------------
  app.get('/api/posts', function(req, res, next) { // TODO : ajouter ensureAuthenticated
    var db;
    // test promise avec le mongclient
    // N'hésite pas à rollbacker si ca pose problème
    MongoClient.connect(localEnv.mongoConnString)
      .then(function(connection) {
        db = connection;
        return db;
      })
      .then(getPosts)
      .then(function(docs) {
        db.close()
        return res.send(docs);
      })
      .catch(next)
      .then(function() {
        if (db) db.close();
      })
  });

  var getPosts = function(db) {
    var collection = db.collection('mychild');
    return collection.find({}).toArray();
  };

  //----------------------------------------------------------------------
  app.post('/api/posts', function(req, res, next) { // TODO : ajouter ensureAuthenticated
    console.log('new post:', req.body.title);

    MongoClient.connect(localEnv.mongoConnString, function(err, db) {
      if (err) {
        console.log('mongo conn err');
        return next(err);
      }
      console.log("Connected correctly to server");

      var collection = db.collection('mychild');

      // Insert some documents
      collection.insertOne([
        req.body
      ], function(err, result) {
        db.close();
        if (err) {
          return next(err);
        }
        res.send(result);
      });


    });


  });

  // GET /auth/google
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Google authentication will involve
  //   redirecting the user to google.com.  After authorization, Google
  //   will redirect the user back to this application at /auth/google/callback
  app.get('/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    }),
    function(req, res) {
      // The request will be redirected to Google for authentication, so this
      // function will not be called.
    });

  // GET /auth/google/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login'
    }),
    function(req, res) {
      console.log("logged");
      req.session.user = {};
      res.redirect('/#posts');
    });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });

  // Simple route middleware to ensure user is authenticated.
  // Use this route middleware on any resource that needs to be protected.  If
  // the request is authenticated (typically via a persistent login session),
  // the request will proceed.  Otherwise, the user will be redirected to the
  // login page.
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/#main');
  }
};