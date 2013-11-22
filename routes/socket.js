var db = require('./../db');

var Wall = require('./../models').Wall;

exports.connect = function(socket)
{
    console.log('A socket has connected.');
    
    var wallid;
    
    function getWall(callback) {
        Wall.findById(wallid, function(err, wall) {
            callback(wall);
        });
    }
    
    socket.on('setwall', function(data){
        wallid = data.wallid;
        socket.join(wallid);
        
        getGame(function(wall){
            socket.emit('wall', wall);
        });
    });
    
    socket.on('additem', function(data){
        socket.broadcast.to(wallid).emit('additem', data);
        
        //Persist to database
    });
    
    socket.on('dragitem', function(data){
        socket.broadcast.to(wallid).emit('dragitem', data); //Should not be persisted to database
    });
    
    socket.on('moveitem', function(data){
        socket.broadcast.to(wallid).emit('moveitem', data);
        
        //Persist to database
    });
    
    socket.on('deleteitem', function(data){
        socket.broadcast.to(wallid).emit('deleteitem', data);
        
        //Persist to database
    });
}