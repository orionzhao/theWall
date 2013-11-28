

var db = require('./../db');
var Wall = require('./../models').Wall;

//Create wall item and redirect user to it
exports.get = function(req, res){
    var wall = new Wall( { items : [] , canvas : null } );
    wall.save(function(err, wall) {
        res.redirect('/wall?id=' + wall.id);
    });
};