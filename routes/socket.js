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
        
        getWall(function(wall){
            socket.emit('wall', wall);
        });
    });
    
    socket.on('additem', function(data){
        getWall(function(wall){
            var newstate = JSON.parse(JSON.stringify(wall.history[wall.history.length - 1])); //Copy the current state
            newstate.push( data ); //Add the new item
            wall.history.push(newstate); //Push the new wall state
            
            //Persist to database
            wall.markModified('history');
            wall.save(function(err) {
                socket.broadcast.to(wallid).emit('additem', data); //Broadcast client
            });
        });
    });
    
    socket.on('dragitem', function(data){
        socket.broadcast.to(wallid).emit('dragitem', data); //Should not be persisted to database
    });
    
    socket.on('updateitem', function(data){
        getWall(function(wall){
            var newstate = JSON.parse(JSON.stringify(wall.history[wall.history.length - 1]));
            
            for(var i = 0; i < newstate.length; ++i) {
                if(newstate[i].id == data.id) {
                    newstate[i] = data;
                    break;
                }
            }
            
            wall.history.push(newstate);
            
            //Persist to database
            wall.markModified('history');
            wall.save(function(err) {
                socket.broadcast.to(wallid).emit('updateitem', data); //Broadcast client
            });
        });
        
    });
    
    socket.on('deleteitem', function(data){
        getWall(function(wall){
            
            var newstate = JSON.parse(JSON.stringify(wall.history[wall.history.length - 1]));
                
            for(var i = 0; i < newstate.length; ++i) {
                if(newstate[i].id == data.id) {
                    newstate.splice(i, 1);
                    break;
                }
            }
            
            wall.history.push(newstate);
            
            //Persist to database
            wall.markModified('history');
            wall.save(function(err) {
                socket.broadcast.to(wallid).emit('deleteitem', data); //Broadcast client
            });
            
        });
    });
}