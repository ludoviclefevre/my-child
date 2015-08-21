var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var Promise = require('bluebird');
var connectAsync = Promise.promisify(MongoClient.connect);

var localEnv = require('../../config/local.env.js');

exports = module.exports = {
  get: function () {
    return connectAsync(localEnv.mongoConnString)
      .disposer(function (db) {
        db.close();
      });
  }
};
