const OBSWebSocket 	= require('obs-websocket-js')
		,	config				= require('config')
		,	obs 					= new OBSWebSocket();

//Connect to OBS.
obs.connect({ address: 'localhost:4444', password: config.get('Secrets.OBS.password') })
	.then(() => {
		console.log(`Success! We're connected & authenticated.`);
		
		return obs.getSceneList();
	})
	.then(data => {
		console.log(`${data.scenes.length} Available Scenes!`);
		
		data.scenes.forEach(scene => {
			if (scene.name !== data.currentScene) {
				console.log(`Found Scene: ${scene.name}`);
			}
		});
	})
	.catch(err => { // Promise convention dicates you have a catch on every chain.
		console.log('obs connect error:', err);
	});

//Define some OBS events to listen to.
obs.onSwitchScenes(data => {
	console.log(`New Active Scene: ${data.sceneName}`);
});

obs.on('error', err => {
	console.error('obs caught error:', err);
});

//Commands.
exports.checkStatus = function() {
	return obs.getStreamingStatus()
	.then(data => {
		return data;
	})
	.catch(err => {
		console.log('obs check status error', err);
	})
};
exports.startStreaming = function() {
	return obs.startStreaming()
	.then(() => {
		console.log('obs: starting stream');
	})
	.catch(err => {
		console.log('obs start streaming error', err);
	});
};
exports.stopStreaming = function() {
	return obs.stopStreaming()
	.then(() => {
		console.log('obs: stopping stream');
	})
	.catch(err => {
		console.log('obs stop streaming error', err);
	});
};
exports.startRecording = function() {
	obs.startRecording({}, (err) => {
		if (err != null) {console.log('obs start recording error', err)};
	});
};
exports.stopRecording = function() {
	obs.stopRecording({}, (err) => {
		if (err != null) {console.log('obs stop recording error', err)};
	});
};
exports.sceneChange = function(args) {
	return obs.setCurrentScene({'scene-name': args});
};
exports.titleImage = function(url) {
	return obs.setSourceSettings({'sourceName': 'Browser - Preview Image', 'sourceSettings': {'url': url}});
};
exports.titleText = function(data) {
	return obs.setSourceSettings({'sourceName': 'Text (GDI+) - title', 'sourceSettings': {'text': data}});
};