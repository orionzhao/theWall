var db = require('./../db');
var async = require('async');

Schema = db.mongoose.Schema;

var wallSchema = new Schema({
});

exports.Wall = db.mongoose.model('Wall', wallSchema);