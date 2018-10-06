var Strategy = require('passport-discord').Strategy;
var config = require('config');

var exports = module.exports = function (passport){
	
  //Passport stuff.
  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });
	
  //Get the strategy working.
  passport.use(new Strategy({
    clientID: config.get('Secrets.Passport.clientID')
    , clientSecret: config.get('Secrets.Passport.clientSecret')
    , callbackURL: config.get('Secrets.Passport.callbackURL')
    , scope: ['identify']
  }, function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }));	
};