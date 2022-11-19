var mongoose = require('mongoose');
var crypto = require('crypto');

mongoose.connect(process.env.MONGODB_URL);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Successfully connected to MongoDB.");
});

exports.mongoose = mongoose;