// Mouse Tracker
var Xpos = 0;
var Ypos = 0;
$( "body" ).mousemove(function( event ) {
  Xpos = event.pageX;
  Ypos = event.pageY;
});
var xMax = $(window).width();
var yMax = $(window).height();

// Ready Start
$(document).ready(function() { 
    var socket = io.connect(APP_URL);
    socket.emit('setwall', {wallid : wallid});

    // Create Post Event
  $("canvas").doubletap(function() {
    newpost();
  });  
  
    // Edit Post Event
  $(".drag").tap(function() {
    $(this).children.focus();
  });  

// Focus Out Event
  $(this).focusout(function() {
    $("textarea").scrollTop(0);
  });
  $(".drag").click(function(){alert("yo")})
  
    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < 5; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    
    function getObjectById(id) {
        var state = wall.history[wall.history.length - 1];
        for(var i = 0; i < state.length; ++i) {
            if(state[i].id == id) {
                return state[i];
            }
        }
        return null;
    }

// Key Up Event
    $("#container").keyup(function() {
       $focus = $("*:focus");
       if($focus.is("textarea")) {
           var id = $focus.attr('id');
           var note = getObjectById(id);
           note.text = $focus.val();
           
           socket.emit('updateitem', note);
       }
    });


// Create Post Function
  function newpost () {
        var id = makeid();
      
        createNote(id, Xpos, Ypos);
        $("#post-" + id).children("textarea").focus();
    
        socket.emit('additem', { type : 'note', id : id, text : '', x : Xpos, y : Ypos });
    }
    
    function createNote(id, x, y, text) {
        $("#container").append("<div id='post-" + id + "' class='drag ui-widget-content'><textarea id="+ id +" name='title' type='text' placeholder='Post-It Note'></textarea></div>")
        $("#post-" + id).css({
          left: x,
          top: y
        });
        $(".drag").drags();
        
        if(text)
            $("#post-" + id).children("textarea").val(text);
            
        $("#post-" + id).children("textarea").focus();
        

    }

    socket.on('additem', function (data) {
        if(data.type == 'note') {
            createNote(data.id, data.x, data.y);
        }
    });
    
    socket.on('updateitem', function (data) {
        if(data.type == 'note') {
            var note = getObjectById(data.id);
            $("#" + data.id).val(data.text);
            $("#" + data.id).parent().css("left", data.x).css("top", data.y);
            
            note.text = data.text;
            note.x = data.x;
            note.y = data.y;
        }
    });
  
  socket.on('wall', function (data) {
      wall = data;
      var state = wall.history[wall.history.length - 1];
      
      $.each(state, function(index, item) {
         if(item.type == 'note') {
             createNote(item.id, item.x, item.y, item.text);
         } 
      });
  });

// Drag Function
$.fn.drags = function(opt) {

        opt = $.extend({handle:"",cursor:"move"}, opt);

        if(opt.handle === "") {
            var $el = this;
        } else {
            var $el = this.find(opt.handle);
        }

        return $el.css('cursor', opt.cursor).on("taphold", function(e) {
            if(opt.handle === "") {
                var $drag = $(this).addClass('draggable');
            } else {
                var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1000).parents().on("mousemove", function(e) {
                $('.draggable').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).on("tapend", function() {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                    $(this).focus();
                });
            });
            e.preventDefault(); // disable selection
        }).on("tapend", function() {
            if(opt.handle === "") {
                $(this).removeClass('draggable');
                $(this).children().focus();
                
                
                
                var id = $(this).children("textarea").attr('id');
                var note = getObjectById(id);
                note.x = $(this).css("left");
                note.y = $(this).css("top");
                
                socket.emit('updateitem', note);

            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });

    };


// End
});





