const obstool     	= require('./util/obs-tool.js')
		, mpvtool				= require('./util/mpv-tool.js')
		, fbtool				=	require('./util/filebrowse-tool.js')
		, kstool				=	require('./util/keysend-tool.js')
		, imgurl				=	require('./util/imageurl-tool.js')
		, spottool			= require('./util/spotify-tool.js')
		, fs						= require('fs')
		, ranauth				= false;

var exports = module.exports = function(emitter){
	//This should be unified with mpv start parameters. mpv default is 40.
	var volume = 80;
	
	//Events.
	//OBS
	emitter.eventBus.on('obsStatus', function(data) {
		var id = data.id;
		obstool.checkStatus()
			.then(data => {
				var stream = data.streaming;
				toBus('obsStatus', id, stream);
			})
			.catch(err => {
				console.log('main error:', err);
				toBus('error', id, 'could not fetch obs status');
		});	
	});
	emitter.eventBus.on('obsStart', function() {
		obstool.startStreaming()
		.then(() => {
			toBus('obsStatus', 'all', true);
		})
		.catch(err => {
			console.log('main error:', err);
		});
	});
	emitter.eventBus.on('obsStop', function(data) {
		obstool.stopStreaming()
		.then(() => {
			toBus('obsStatus', 'all', false);
		})
		.catch(err => {
			console.log('main error:', err);
		});
	});
	emitter.eventBus.on('obsTitleImage', function(data) {
		var url = data.body;
		var id = data.id;
		imgurl.check(url)
		.then(() => {
			return obstool.titleImage(url);
		})
		.then(data => {
			console.log(data);
			toBus('obsTitleImage', id, 'Title image changed to ' + url);
		})
		.catch(err => {
			console.log('main error:', err);
		});
	});
	emitter.eventBus.on('obsTitleText', function(data) {
		var data = data.body;
		var id = data.id;
		obstool.titleText(data)
		.then(data => {
			console.log(data);
			toBus('obsTitleImage', id, 'Title text changed to ' + data);
		})
		.catch(err => {
			console.log('main error:', err);
		});
	});
	//Directory functions.
	emitter.eventBus.on('ls', function(data) {
		var dir = data.body;
		var id = data.id;
		fbtool.ls(dir).then(data => {
			toBus('localdir', id, data);
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not fetch file listing.');
		});		
	});
	emitter.eventBus.on('updir', function(data) {
		var dir = data.body;
		var id = data.id;
		fbtool.updir(dir).then(data => {
			return fbtool.ls(data);
		})
		.then(data => {
			toBus('localdir', id, data);
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not return directory up.');
		});	
	});
	//MPV
	emitter.eventBus.on('mpvStatus', function(data) {
		var id = data.id;
		mpvtool.playlist().then(data => {
			toBus('playlist', id, data);
			return mpvtool.pauseCheck();
		})
		.then(data => {
			if (data == true) {
				toBus('mpvStatus', 'all', 'pause');
			}
			else {
				toBus('mpvStatus', 'all', 'play');
			}
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not fetch playlist');
		});
	});
	emitter.eventBus.on('playlistAdd', function(data) {
		var dir = data.body;
		var id = data.id;
		mpvtool.load(dir).then(() => {
			return mpvtool.playlist();
		})
		.then(data => {
			toBus('playlist', 'all', data);
			return mpvtool.pauseCheck();
		})
		.then(data => {
			if (data == true) {
				return obstool.sceneChange('pause');
				toBus('mpvStatus', 'all', 'pause');
			}
			else {
				return obstool.sceneChange('mpv');
				toBus('mpvStatus', 'all', 'play');
			}
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not add to playlist');
		});
	});
	emitter.eventBus.on('playlistRemove', function(data) {
		var index = data.body;
		var id = data.id;
		mpvtool.playlistRemove(index.toString()).then(() => {
			return mpvtool.playlist();
		})
		.then(data => {
			toBus('playlist', 'all', data);
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not remove from playlist');
		});
	});
	emitter.eventBus.on('playlistMove', function(data) {
		var id = data.id;
		var indices = [];
		indices.push(data.body[0].toString());
		indices.push(data.body[1].toString());
		console.log(indices);
		mpvtool.playlistMove(indices).then(() => {
			return mpvtool.playlist();
		})
		.then(data => {
			toBus('playlist', 'all', data);
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not remove from playlist');
		});
	});
	emitter.eventBus.on('play', function(data) {
		var id = data.id;
		obstool.sceneChange('mpv').then(() => {
			return kstool.send(['shift', '1']);			
		})
		.then(() => {			
			return mpvtool.play();			
		})
		.then(() => {
			toBus('mpvStatus', 'all', 'play');
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not start mpv playback');
		});
	});
	emitter.eventBus.on('pause', function(data) {
		var id = data.id;
		obstool.sceneChange('pause').then(() => {
			return mpvtool.pause();
		})
		.then(() => {			
			toBus('mpvStatus', 'all', 'pause');
		})
		.then(() => {
			return kstool.send(['shift', '0']);
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not start mpv playback');
		});
	});
	emitter.eventBus.on('prev', function(data) {
		var id = data.id;
		mpvtool.prev().then(() => {
			return mpvtool.playlist();
		})
		.then(data => {
			toBus('playlist', 'all', data);
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not start mpv playback');
		});
	});
	emitter.eventBus.on('next', function(data) {
		var id = data.id;
		mpvtool.next().then(() => {
			return mpvtool.playlist();
		})
		.then(data => {
			toBus('playlist', 'all', data);
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not start mpv playback');
		});
	});
	emitter.eventBus.on('stop', function(data) {
		var id = data.id;
		mpvtool.stop().then(() => {
			toBus('mpvStatus', 'all', 'stop');
			return mpvtool.pause();
		})
		.then(() => {
			return obstool.sceneChange('pause');					
		})
		.then(() => {			
			return mpvtool.playlist();
		})
		.then(() => {
			toBus('playlist', 'all', data);
		})
		.then(data => {			
			return kstool.send(['shift', '0']);	
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not start mpv playback');
		});
	});
	emitter.eventBus.on('volume', function(data) {
		var id = data.id;
		volume = data.body;
		mpvtool.volume(volume).then(() => {
			toBus('volume', 'all', volume);
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not change volume');
		});
	});
	emitter.eventBus.on('getVolume', function(data) {
		var id = data.id;
		toBus('volume', id, volume);
	});
	//Spotify wip
	emitter.eventBus.on('spotifyPlay', function(data) {
		var id = data.id;
		spottool.play().then(() => {
			return spottool.getState();		
		})
		.then(data => {
			console.log(data);
			toBus('spotStatus', 'all', data);
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not start spotify playback');
		});
	});
	emitter.eventBus.on('spotifyPause', function(data) {
		var id = data.id;
		spottool.pause().then(() => {
			return spottool.getState();		
		})
		.then(data => {
			console.log(data);
			toBus('spotStatus', 'all', data);
		})
		.catch(err => {
			console.log('main error:', err);
			toBus('error', id, 'could not start spotify playback');
		});
	});
	emitter.eventBus.on('spotifyAuth', function(data) {
		var id = data.id;
		spottool.auth().then(() => {
			spottool.setRefresh();
		})
		.catch(err => {
			console.log('spotify auth failure', err);
		});
	});
	//misc
	emitter.eventBus.on('test', function() {
		var id = data.id;
	});
	
	//Module/sub events.
	mpvtool.mpv.on('statuschange', (data) => {
		//console.log(data);
	});
	mpvtool.mpv.on('timeposition', (data) => {
		var time = Math.trunc(data);
		var remaining = 0;
		mpvtool.timeRemaining()
		.then((data) => {
			remaining = data;
			var remainTrunc = Math.trunc(remaining);
			toBus('timeposition', 'all', [time, remainTrunc]);
		})
		.catch(err => {
			console.log('main error:', err);
		});
	});
	
	//Functions.	
	function toBus(head, id, data) {
		//Take whatever message and forward it to the sockets.
		emitter.eventBus.sendEvent('update', {"id": id, "head": head, "body": data});
		//console.log('sending return to client. |', head, data);
	};
	function updater() {
		
	};
};