const mpvAPI = require('node-mpv');
const mpv = new mpvAPI();
var config    = require('config')
  , rootdir   = config.get('Filepaths.videos');


//Start mpv.
mpv.start()
.then(() => {
	console.log('mpv: ready');
})
/*.then (() => {
	mpv.observeProperty('playlist', 13);
})*/
.catch((error) => {
    console.log(error);
});


//Playlist handling.


//Assign our commands list.
var commands = {};
//Commands.
exports.load = function(file) {
	//make sure to do check to see if file exists here, just in case.
	var dir = rootdir + file;
	return mpv.load(dir, 'append-play')
	.then(() => {
		console.log('mpv: playing file | ', file)
	})
	.catch((error) => {
		console.log(error);
	});
};
exports.play = function() {
	return mpv.play()
	.then(() => {
		console.log('mpv: resuming current |')
	})
	.catch((error) => {
		console.log(error);
	});
};
exports.pause = function() {
	return mpv.pause()
	.then(() => {
		console.log('mpv: pausing current |');
	})
	.catch((error) => {
		console.log(error);
	});
};
exports.prev = function() {
	return mpv.prev()
	.then(() => {
		console.log('mpv: starting playback on previous entry in playlist |');
	})
	.catch((error) => {
		console.log(error);
	});
};
exports.next = function() {
	return mpv.next()
	.then(() => {
		console.log('mpv: starting playback on next entry in playlist |');
	})
	.catch((error) => {
		console.log(error);
	});
};
exports.stop = function() {
	return mpv.stop()
	.then(() => {
		console.log('mpv: stopping playback |');
	})
	.catch((error) => {
		console.log(error);
	});
};
exports.playlist = function() {
	return mpv.getProperty('playlist')
	.then(data => {
		console.log('mpv: fetching playlist object | ', data)
		var playlist = bundlePlaylist(data);
		return playlist;
	})
	.catch((error) => {
		console.log(error);
	});
};
exports.playlistRemove = function(data) {
	return mpv.playlistRemove(data)
	.then(() => {
		console.log('mpv: removing index from playlist | ', data);
	})
	.catch((error) => {
		console.log(error);
	});
};
exports.playlistMove = function(data) {
	console.log(data);
	var oldIndex = data[0];
	var newIndex = data[1];
	return mpv.playlistMove(oldIndex, newIndex)
	.then(() => {
		console.log('mpv: moving playlist item to new index | ', oldIndex, newIndex);
	})
	.catch((error) => {
		console.log(error);
	});
};
exports.timeRemaining = function() {
	return mpv.getTimeRemaining()
	.then(data => {
		return data;
	})
	.catch((error) => {
		console.log(error);
	});
};
exports.pauseCheck = function() {
	return mpv.isPaused()
	.then(data => {
		return data;
	})
	.catch(error => {
		console.log(error);
	});
}
exports.volume = function(val) {
	return mpv.volume(val)
	.then(() => {
		console.log('volume set to ', val);
	})
	.catch(() => {
		console.log('volume could not be set');
	});
}

//Give the mpv object to the calling file so it can play with .on events.
exports.mpv = mpv;

//Fucntions.
function bundlePlaylist(plist) {
	var newPlist = [];
	for (var i = 0; i < plist.length; ++i) {
		var plistFile = plist[i].filename;
		var last = plistFile.lastIndexOf('/');
		plistFile = plistFile.slice(last+1);
		if ('current' in plist[i]) { newPlist.push({'file': plistFile, 'current': true}) }
		else { newPlist.push({'file': plistFile}) }
	};
	return newPlist;
};