//Configuration and API Keys
var globals = require('./../globals');

var Wall = require('./../models').Wall;

//Actually displays the wall
exports.get = function(req, res){
    Wall.findById(req.query.id, function(err, wall) {
            res.render( 'timeline.html', { WALL : JSON.stringify(wall) });
    });
};