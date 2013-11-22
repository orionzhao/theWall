// Mouse Tracker
var Xpos = 0;
var Ypos = 0;
$( "body" ).mousemove(function( event ) {
  Xpos = event.pageX;
  Ypos = event.pageY;
});


// Ready Start
$(document).ready(function() { 
    var socket = io.connect(APP_URL);
    socket.emit('setwall', {wallid : wallid});

    // Create Post Event
    $("#background").doubletap(function() {
       newpost();
    });  

// Edit Post Event
  $(".panel").doubletap(function() {
    $this.siblings("textarea").focus();
  });

// Focus Out Event
  $(this).focusout(function() {
    $("textarea").scrollTop(0);
  });
  
    function makeid()
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < 5; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }


// Create Post Function
  function newpost () {
        var id = makeid();
      
        createNote(id, Xpos, Ypos);
        $("#post-" + id).children("textarea").focus();
    
        socket.emit('additem', { type : 'note', id : id, text : '', x : Xpos, y : Ypos });
    }
    
    function createNote(id, x, y) {
        $("#container").append("<div id='post-" + id + "' class='drag ui-widget-content'><textarea id="+ id +" name='title' type='text' placeholder='Post-It Note'></textarea></div>")
        $("#post-" + id).append("<a class='panel'></a>");
        $("#post-" + id).css({
          left: x,
          top: y
        });
    }

// Edit Post Function
  function editpost() {

  }
  
    socket.on('additem', function (data) {
        if(data.type == 'note') {
            createNote(data.id, data.x, data.y);
        }
    });
  
  socket.on('wall', function (data) {
      wall = data;
  });

// End
});





