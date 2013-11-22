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

    function createNote(id, x, y, text, color) {
        $("#container").append("<div id='post-" + id + "' class='drag " + color + "'><textarea id="+ id +" name='title' type='text' placeholder='Post-It Note'></textarea></div>")
        $("#post-" + id).css({
          left: x,
          top: y
        });
        
        if(text)
            $("#post-" + id).children("textarea").val(text);
    }

function noteinlist(id, list) {
    for(var i = 0; i < list.length; ++i) {
        if(list[i].id == id) {
            return true;
        }
    }
    
    return false;
}

//Canvas Drawing
var canvas = document.querySelector('#sketch');
var context = canvas.getContext('2d');

canvas.width = $(window).width();
canvas.height = $(window).height();

var current = -1;
function settime() {
    var next = $('#slider').slider('value');
    
    if(next != current) {
        context.clearRect ( 0 , 0 , canvas.width , canvas.height );
        
        $.each(wall.history[next], function(index, item) {
            if(item.type == 'note') {
                var $note = $('#post-' + item.id);
                if($note.size() > 0) { //This is a modification from the current state
                    $("#" + item.id).val(item.text);
                    $("#" + item.id).parent().animate( { "left" : item.x, "top" : item.y }, 100);
                    
                    $("#" + item.id).parent().removeClass("yellow red blue green orange");
                    $("#" + item.id).parent().addClass(item.color);
                }
                else { //You need to add it from the current state
                    createNote(item.id, item.x, item.y, item.text, item.color);
                }
            }
            if(item.type == 'canvas') {
                var image = new Image();
                image.src = wall.canvases[ item.image ];
                context.drawImage(image, 0, 0);
            }
        });
        
        
        if(current != -1) {
            
             $.each(wall.history[current], function(index, item) {
                 if( !noteinlist(item.id, wall.history[next]) ) { //This is deleted from the current state
                    $("#" + item.id).parent().remove();
                    
                 }
             });
        }
        
        update_embeds();
    }
    
    current = next;
}
    
// Ready Start
$(document).ready(function() { 
    
    
    $( "#slider" ).slider({
        value: wall.history.length - 1,
        min: 0,
        max: wall.history.length - 1,
        step: 1,
        slide : settime,
        change : settime
    });
    
    //$('#slider').slider().bind('slidechange',settime);
    
    settime();
    

});