var SpotifyWebApi	= require('spotify-web-api-node');
var fs = require('fs');
var config = require('config');
var code = '';
var scopes = ['user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing'];
var clientId = config.get('Secrets.Spotify.clientId');
var clientSecret = config.get('Secrets.Spotify.clientSecret');
var redirectURI = config.get('Secrets.Spotify.redirectURI');

//Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
  clientId: clientId
  , clientSecret: clientSecret
  , redirectUri: redirectURI
});

//Create the authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(scopes);
console.log('spot auth code url:', authorizeURL);

//Prompt user to input auth code.

exports.auth = function () {
  var code = fs.readFileSync('code.txt', 'utf8');
	
  return spotifyApi.authorizationCodeGrant(code).then(
    function (data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);

      //Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
      code = '';
    },
    function (err) {
      console.log('Something went wrong!', err);
    }
  );
};
exports.setRefresh = function () {
  (function scheduleRefresh () {
    spotifyApi.refreshAccessToken()
      .then(data => {
        console.log('Spot token refreshed.');
        spotifyApi.setAccessToken(data.body['access_token']);
        setTimeout(function () {
          console.log('Refreshing spot token.');
          scheduleRefresh();
        }, 1000 * 60 * 30);
      })
      .catch(err => {
        console.error('error in scheduler', err);
      });
  })();
};

exports.play = function () {
  console.log(spotifyApi);
  return spotifyApi.play()
    .then(() => {
      console.log('spotify: sending play command.');
    })
    .catch(err => {
      console.log('spotify: something went wrong sending play command', err);
    });
};
exports.pause = function () {
  return spotifyApi.pause()
    .then(() => {
      console.log('spotify: sending pause command.');
    })
    .catch(err => {
      console.log('spotify: something went wrong sending pause command', err);
    });
};
exports.getState = function () {
  return spotifyApi.getMyCurrentPlaybackState()
    .then(data => {
      console.log('spotify: got playback state');
      return data;
    })
    .catch(err => {
      console.log('spotify: something went wrong getting data', err);
    });
};