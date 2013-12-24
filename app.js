
/**
 * Module dependencies.
 */

var express = require('express')
, routes = require('./routes')
, http = require('http')
, path = require('path');

var app = express();


// all environments
app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/show/*', routes.video);
app.post('/download', routes.get);
app.get('/delete/*', routes.rm);

var serv = http.createServer(app).listen(app.get('port'), function(){
    console.log('WhiskTube: port ' + app.get('port'));
});
var io = require('socket.io').listen(serv);
io.set('log level', 1); // reduce logging
io.sockets.on('connection', function(socket) {
    socket.on('download', function(dl) {
	routes.dl(dl.url, socket, null);
    });
});
