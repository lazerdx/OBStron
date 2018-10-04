const fs 				= require('fs')
		, config		= require('config')
		, videodir 	= config.get('Filepaths.videos');

exports.ls = function(dir) {
	return new Promise((resolve, reject) => {
		var dirlong = videodir + dir;
		fs.readdir(dirlong, function(err, data) {
			if (err) {
				reject(err);
			}
			else {
				var filelist = typeify(dirlong, data);
				filelist = removeExtraFiles(filelist);
				resolve({'dir': dir, 'data': filelist});
			}
		});
	});	
};
exports.updir = function(dir) {
	return new Promise((resolve, reject) => {	
		if (dir == '') {
			resolve('');
		}
		else if (dir != '') {
			var last = dir.lastIndexOf('/')
			if (last != -1) {dir = dir.slice(0, last)}
			resolve(dir);
		}
		else {
			reject(new Error('Directory up call failed.'));
		}
	});
};

//Functions
function typeify(dir, list) {
	var sorted = []
		, type = '';
	
	for (var i = 0; i < list.length; ++i) {
		var filestats = fs.statSync(dir + '/' + list[i]);
		if (filestats.isDirectory() == true) {
			type = 'directory';
		}
		else {
			type = 'file';
		}
		var value = list[i];
		sorted.push({file: value, type: type});
	}
	return sorted;
};
function removeExtraFiles(list) {
	var substrings = ['.mkv','.avi','.mp4','.flv']	
	  , newlist = [];
	
	for (var i = 0; i < list.length; ++i) {
		var removal = false;
		
		if (list[i].type == 'file') {
			var filename = list[i].file
				,	slice = filename.slice(-5)
				,	length = substrings.length;
				
			while(length-- > 0) {
				if (slice.indexOf(substrings[length]) > -1) {
				  removal = true;
				}
			}			
			if (removal == true) {
				newlist.push(list[i]);
			}
		}
		else if (list[i].type == 'directory') {newlist.push(list[i])}
	}
	return newlist;
};