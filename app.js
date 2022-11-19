//Import all libraries
var express = require('express');
var http = require('http');
var path = require('path');
var swig = require('swig');
var socketio = require('socket.io');

//Database Models
var db = require('./db')
var Wall = require('./models').Wall;

//Configuration and API Keys
var globals = require('./globals');

//Create application object
var app = express();

app.use(express.logger('dev')); //Logging
app.use(express.bodyParser()); //Parses form data
app.use(express.favicon()); //Favicon

//Needed for user sessions
app.use(express.cookieParser()); //Parsing cookies
app.use(express.session({ secret: globals.SESSION_TOKEN }));

//App router
app.use(app.router);

//Register Swig as template parser
app.engine('html', swig.renderFile);
app.set('views', __dirname + '/views');
app.set('view cache', false);
swig.setDefaults({ cache: false });

//Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

//All the application routes
app.get('/', require('./routes/index').get);
app.get('/newwall', require('./routes/newwall').get);
app.get('/wall', require('./routes/wall').get);
app.get('/timeline', require('./routes/timeline').get);

app.get('/clear', function(req, res){
    Wall.remove({}, function(err) { 
       console.log('collection removed') 
       res.redirect('/');
    });
});

//Start server on the correct port number
var server = http.createServer(app);
server.listen( globals.PORT, process.env.IP, function(){
  console.log('Express server listening on port ' + globals.PORT);
});

//Web Sockets
var io = socketio.listen(server);
io.sockets.on('connection', require('./routes/socket').connect );