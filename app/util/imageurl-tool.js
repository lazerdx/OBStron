var isImageUrl = require('is-image-url');

exports.check = function (url) {
  return new Promise((resolve, reject) => {	
    if (isImageUrl(url) == true) {
      resolve(url);
    } else {
      reject(new Error('Not a valid image url!'));
    }
  });
};