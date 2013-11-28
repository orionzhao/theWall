var db = require('./../db');

var Wall = require('./../models').Wall;

exports.connect = function(socket) {
	
    console.log('A socket has connected.');
    
    var wallid;
    
    function getWall(callback) {
        Wall.findById(wallid, function(err, wall) {
            if(wall)
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
            wall.items.push( data ); //Push into the wall state
            
            //Persist to database
            wall.markModified('items');
            wall.save(function(err) {
                socket.broadcast.to(wallid).emit('additem', data); //Broadcast client
            });
        });
    });
    
    socket.on('draw', function(data){
        socket.broadcast.to(wallid).emit('draw', data); //Should not be persisted to database
    });
    
    socket.on('updateitem', function(data){
        getWall(function(wall){
            //Canvases store an index of a unique imageview
            if(data.type == 'canvas') {
                wall.canvas = data.image;
            }
            else {
	            var changed = false;
	            for(var i = 0; i < wall.items.length; ++i) {
	                if(wall.items[i].id == data.id) {
	                    wall.items[i] = data;
	                    changed = true;
	                    break;
	                }
	            }
	            if(!changed) {
	                wall.items.push( data ); //Add the new item
	            }
	        }
	        
            //Persist to database
            wall.markModified('items');
            wall.save(function(err) {
                socket.broadcast.to(wallid).emit('updateitem', data); //Broadcast client
            });
        });
        
    });
    
    socket.on('deleteitem', function(data){
        getWall(function(wall){
             
            for(var i = 0; i < wall.items.length; ++i) {
                if(wall.items[i].id == data.id) {
                    wall.items.splice(i, 1);
                    break;
                }
            }
            
            //Persist to database
            wall.markModified('items');
            wall.save(function(err) {
                socket.broadcast.to(wallid).emit('deleteitem', data); //Broadcast client
            });
            
        });
    });
}