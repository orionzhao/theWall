//Import all libraries
var express = require('express');
var http = require('http');
var path = require('path');
var swig = require('swig');
var socketio = require('socket.io');

//Authentication libraries
//var passport = require('passport');
//var FacebookStrategy = require('passport-facebook').Strategy;

//Database Models
var db = require('./db')
var Wall = require('./models/wall').Wall;

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

//Passport middleware
//app.use(passport.initialize());
//app.use(passport.session());

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

//Start server on the correct port number
var server = http.createServer(app);
server.listen( globals.PORT, function(){
  console.log('Express server listening on port ' + globals.PORT);
});

//Web Sockets
//var io = socketio.listen(server);
//io.sockets.on('connection', require('./routes/socket').connect )