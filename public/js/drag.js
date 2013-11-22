// Mouse Tracker
var Xpos = 0;
var Ypos = 0;
$( "body" ).mousemove(function( event ) {
  Xpos = event.pageX;
  Ypos = event.pageY;
});
var xMax = $(window).width();
var yMax = $(window).height();
function update_embeds() {
    $('.preview').remove();
    
    $('.drag').each( function(index) {
        var note = $(this);
        var url = note.children("textarea").val();
        
        $.embedly.oembed(url, {query:{maxwidth: 200}, key:'f8a599790a4844fa85df5beb197c09b1' })
        .progress(function(obj){
          if (obj.type === 'photo'){
            note.append('<div class="preview"><div style="background-image: url(' + obj.url + ')"></div>');
          } else if (obj.type === 'rich' || obj.type === 'video'){
            note.append('<div class="preview">' + obj.html + '</div>');
          }
        });
    });
}
var activepad;
// Ready Start
$(document).ready(function() { 
    var socket = io.connect(APP_URL);
    socket.emit('setwall', {wallid : wallid});

    // Create Post Event
  $("canvas").doubletap(function() {
    newpost();
  });  
  

  
    // Edit Post Event
//   $(".drag").tap(function() {
//     $(this).children.focus();
//     activepad = $(this).attr('id');
//   });  

// Focus Out Event
  $(this).focusout(function() {
    $("textarea").scrollTop(0);
  });

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
           
           socket.emit('updateitem', { type : 'note', id : id, text : $focus.val(), x : $focus.parent().css("left"), y : $focus.parent().css("top") });
           update_embeds();
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
        $("#container").append("<div id='post-" + id + "' class='drag yellow'><textarea id="+ id +" name='title' type='text' placeholder='Post-It Note'></textarea></div>")
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
            
            //note.text = data.text;
            //note.x = data.x;
            //note.y = data.y;
        }
        
        update_embeds();
    });
  
  socket.on('wall', function (data) {
      wall = data;
      var state = wall.history[wall.history.length - 1];
      
      $.each(state, function(index, item) {
         if(item.type == 'note') {
             createNote(item.id, item.x, item.y, item.text);
         } 
         if(item.type == 'canvas') {
             var image = new Image();
             image.src = wall.canvases[ item.image ];
             context.drawImage(image, 0, 0);
         }
      });
     
     update_embeds();
  });
  
//Canvas Drawing
var canvas = document.querySelector('#sketch');
var context = canvas.getContext('2d');

var lastMouse = {
    x: 0,
    y: 0
};

canvas.width = $(window).width();
canvas.height = $(window).height();

// brush settings
context.lineWidth = 2;
context.lineJoin = 'round';
context.lineCap = 'round';


window.mycolor = '#000';

// attach the mousedown, mousemove, mouseup event listeners.
canvas.addEventListener('mousedown', function (e) {
    lastMouse = {
        x: e.pageX - this.offsetLeft,
        y: e.pageY - this.offsetTop
    };
    canvas.addEventListener('mousemove', move, false);
}, false);

canvas.addEventListener('mouseup', function () {
    canvas.removeEventListener('mousemove', move, false);
    
    socket.emit("updateitem", { type : 'canvas', id : 'canvas', image : canvas.toDataURL("image/jpg", 0.1) });
}, false);

function move(e) {
    var mouse = {
        x: e.pageX - this.offsetLeft,
        y: e.pageY - this.offsetTop
    };
    draw(lastMouse, mouse, mycolor);
    socket.emit("draw", {start : lastMouse, end : mouse, color : mycolor});
    lastMouse = mouse;
}

function draw(start, end, color) {
    context.strokeStyle = color;
    
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.closePath();
    context.stroke();
}

socket.on('draw', function (data) {
    draw(data.start, data.end, data.color);
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
                activepad = $(this).attr("id");
                console.log(activepad);
                
                var id = $(this).children("textarea").attr('id');
                //var note = getObjectById(id);
                //note.x = $(this).css("left");
                //note.y = $(this).css("top");
                
                socket.emit('updateitem', { type : 'note', id : id, text : $(this).children("textarea").val(), x : $(this).css("left"), y : $(this).css("top") });

            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });

    };

// // Zoom
// var zoom = 1;
// $("#zoomout").tap(function() {
//   zoom++;
//   Zoom();
// });
// $("#zoomin").tap(function() {
//   zoom--;
//   Zoom();
// });
// function Zoom() {
// switch (zoom) {
//     case -1:
//         zoom++;
//     case 0:
//         window.parent.document.body.style.zoom = 1.5;
//         break;
//     case 1:
//         window.parent.document.body.style.zoom = 1;
//         break;
//     case 2:
//         window.parent.document.body.style.zoom = 0.5;
//         $(".navbar").css("font-size", "2em");
//         break;
//     case 3:
//         window.parent.document.body.style.zoom = 0.25;
//         $(".navbar").css("font-size", "4em");
//         break;
//     case 4:
//         zoom--;
    
// }



//};

$("#cog").mouseover(
    function() {
    $(".subbar").removeClass("subbar-hide");
    });
$("#color-bg").mouseover(
    function() {
    $(".subbar-bg").removeClass("subbar-hide");
    });
$("#color-stroke").mouseover(
    function() {
    $(".subbar-stroke").removeClass("subbar-hide");
    });
$("canvas").mouseover(
    function() {
    $(".subbar-bg").addClass("subbar-hide");
    $(".subbar-stroke").addClass("subbar-hide");
    $(".subbar").addClass("subbar-hide");
    });

// BG Color Change
$(".bgopt").tap(function() {
    var newcolor = $(this).find("a").attr("id");
    $("#" + activepad).removeClass("yellow red blue green orange");
    $("#" + activepad).addClass(newcolor);
})


// End
});





