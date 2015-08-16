/**
 * Express configuration
 */

'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var session = require('express-session')
var path = require('path');
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var localEnv = require('./local.env');

var config = require('./environment');

module.exports = function (app) {
  var env = app.get('env');

  app.set('views', config.root + '/server/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(session({secret: 'my_precious'}));
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport session setup.
  // To support persistent login sessions, Passport needs to be able to
  // serialize users into and deserialize users out of the session.  Typically,
  // this will be as simple as storing the user ID when serializing, and finding
  // the user by ID when deserializing.  However, since this example does not
  // have a database of user records, the complete Google profile is
  // serialized and deserialized.
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });

  passport.use(new GoogleStrategy({
      clientID: localEnv.authentication.google.clientId,
      clientSecret: localEnv.authentication.google.clientSecret,
      callbackURL: "http://localhost:9000/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  ));

  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', path.join(config.root, 'public'));
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', path.join(config.root, 'client'));
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
  }
};
