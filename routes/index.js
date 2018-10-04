var fs = require('fs');

module.exports = function(app, passport, whitelist){
	// Routing stuff.
	app.get('/', checkAuth, checkId, function(req, res) {
		//console.log(req.user)
		//res.json(req.user);
		res.render('home');
	})
	
	//Auth routing (i could put this in with the other routes but then i have to give passport to that file too and it's already out of hand).
	app.get('/login', passport.authenticate('discord', { scope: ['identify'] }), function(req, res) {})
	app.get('/disc',
		passport.authenticate('discord', { failureRedirect: '/login' }), function(req, res) { res.redirect('/') } // auth success
	)
	app.get('/spot', function(req, res) {
		var params = parseURLParams(req.url);
		fs.writeFile('code.txt', params.code, (err) => {
			if (err) {console.log(err)};
			console.log('spot code saved to txt');
		});
		res.redirect('/');
	})
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/login');
	})
	
	//Bad routes.
	app.use(function (req, res, next) {
		res.status(404).send('404 Not Found.')
	})
	app.use(function (err, req, res, next) {
		console.error(err.stack)
		res.status(500).send('500 Internal Server Error')
	})
	
	//Check authentication, compare ids (wish i had a better place for these).
	function checkAuth(req, res, next) {
		if (req.isAuthenticated()) return next();
		res.status(401).send('401 Unauthorized.')
	}
	function checkId(req, res, next) {
		var userid = req.user.id;
		for (var i=0; i < whitelist.length; i++) {
			//console.log(whitelist[i].id);
			if (whitelist[i].id == userid) return next()
		}	
		res.status(403).send('403 Forbidden.')
	}
	function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
	}
};