// Routes!
var fs = require('fs');
var ytdl = require('ytdl');
var vids = {};

exports.index = function(req, res){
    fs.readdir(__dirname.replace('routes', '') + 'public/videos', function(err, videos) {
	res.render('index', { list: videos });
    });
};
exports.video = function(req, res) {
    res.render('video', {video: req.url.split('/').pop()});
};
exports.dl = function(url, socket, res) {
    var yt = ytdl(url);
    var format;
    var dataRead = 0;
    yt.on('end', function() {
	if (res) {
            res.redirect('/');
	}
	else {
	    socket.emit('done');
	}
    });
    yt.on('data', function(data) {
        dataRead += data.length;
        var percent = dataRead / format.size;
	if(socket) {
	    socket.emit('progress', {progress: percent, tidy: (percent * 100).toFixed(0) + '%'});
	}
    });
    yt.on('info', function(info, fmt) {
        format = fmt;
	if (socket) {
	    socket.emit('info', info);
	}
        yt.pipe(fs.createWriteStream(__dirname.replace('routes', '') + 'public/videos/' + info.title + '.flv'));
    });
};
exports.get = function(req, res) {
    exports.dl(req.body.url, null, res);
};
exports.rm = function(req, res) {
    fs.unlink(__dirname.replace('routes', '') + 'public/videos/' + decodeURIComponent(req.url.split('/').pop()), function(err, result) {
	console.log('deleting:', err, result);
	res.redirect('/');
    });
};
