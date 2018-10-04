//Get our define on.
var fs                = require('fs')
	, config            = require('config')
	, rawdata           = fs.readFileSync('./config/whitelist.json')
	, whitelist         = JSON.parse(rawdata)
	,	express           = require('express')
	, passport          = require('passport')
	, app               = express()
	, session           = require("express-session")({
      secret:							config.get('Secrets.Session.secret'),
      cookie: 						{},
      resave: 						true,
			saveUninitialized:	true,
    });

if (config.get('Application.https') == true) {
  options	= {
    pfx: fs.readFileSync(config.get('Filepaths.httpscert'))
  }	
  server = require('https').createServer(options, app);
}
else {
  server = require('http').createServer(app);
}

var io                = require('socket.io')(server)
  , pass              =	require('./config/pass.js')(passport)
  , emitter           = require('./app/emitter.js')
  , sockets           = require('./app/sockets.js')(io, session, emitter, whitelist);

//Session stuff.
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
	
// Express config.
var exphbs            =	require('express-handlebars')
  ,	logger            = require('morgan');

app.use(logger('combined'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));

var routes = require('./routes')(app, passport, whitelist);

//Start the application
var main = require('./app/main.js')(emitter);
	
//Kick up the webserver.
server.listen(443, function (err) {
  if (err) return console.log(err)
  console.log('Listening at http://localhost:443/')
})