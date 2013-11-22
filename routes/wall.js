//Configuration and API Keys
var globals = require('./../globals');

//Actually displays the wall
exports.get = function(req, res){
    res.render( 'notes.html', { WALL_ID : req.query.id, APP_URL : globals.APP_URL })
};