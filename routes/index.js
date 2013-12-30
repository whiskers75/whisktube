// Routes!
var fs = require('fs');
var ytdl = require('ytdl');
var vids = {};

exports.index = function(req, res){
    fs.readdir(__dirname.replace('routes', '') + 'public/videos', function(err, videos) {
        var s = 0;
	fs.readdirSync('public/videos').forEach(function(x) {
	    s = fs.statSync('public/videos/' + x).size + s;
	});
	res.render('index', {list: videos, size: s / 1024 / 1024});
    });
};
exports.video = function(req, res) {
    res.render('video', {video: req.url.split('/').pop()});
};
exports.dl = function(url, formt, socket, res) {
    var yt = ytdl(url, {filter: function(format) {
	if (formt) {
	    return format.container == formt;
	}
	return format.container === 'mp4';
    }});
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
    yt.on('error', function(err) {
	if (res) {
	    res.redirect('/');
	}
	else {
	    console.log(err.toString());
	    socket.emit('error', {error: err.toString()});
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
	    socket.emit('info', {info: info, format: fmt});
	}
        yt.pipe(fs.createWriteStream(__dirname.replace('routes', '') + 'public/videos/' + info.title.replace('/', ' ') + '.' + format.container));
    });
};
exports.get = function(req, res) {
    exports.dl(req.body.url, null, null, res);
};
exports.rm = function(req, res) {
    fs.unlink(__dirname.replace('routes', '') + 'public/videos/' + decodeURIComponent(req.url.split('/').pop()), function(err, result) {
	res.redirect('/');
    });
};
