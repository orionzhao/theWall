var db = require('./db');
var async = require('async');

Schema = db.mongoose.Schema;

var wallSchema = new Schema({
    items : [Schema.Types.Mixed],
    canvas : String
});

exports.Wall = db.mongoose.model('Wall', wallSchema);