var ks                = require('node-key-sender')
  , util              = require('util')
  , setTimeoutPromise = util.promisify(setTimeout);

exports.send = function(keys) {
  return ks.sendCombination(keys)
  .then(() => {
    return setTimeoutPromise(2500);
  })
  .then(() => {
    console.log('voicem: finished with pan');
  })
  .catch(err => {
    console.log('could not issue command to voicemeeter.', err);
  })
};