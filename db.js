var mongoose = require('mongoose');

module.exports = new function () {
//  console.log('Try to connect to MongoDB via Mongoose ...');
//  mongoose.connect('mongodb://localhost/27017');
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'Mongoose connection error:'));
  return db;
}
