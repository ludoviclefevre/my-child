var mongoConnection = require('../../components/mongo/connection');

var getAll = function() {
  return using(mongoConnection.get(), getPostsFromDatabase);
};

var getPostsFromDatabase = function (db) {
  return db.collection('mychild')
    .find({})
    .toArray();
};

exports = module.exports =  {
  getAll: getAll
};
