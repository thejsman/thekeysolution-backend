// Time-stamp: 2017-06-14 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : copyImages.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';

const CopyFile = (oldUrl, newUrl) => (
  new Promise( (resolve, reject) => {
    if(Meteor.isServer) {
      S3.knox.copy(oldUrl, newUrl).on('response', function(res){
	if(res.statusCode === 200) {
	  resolve({
	    old: oldUrl,
	    changed: newUrl
	  });
	}
	else {
	  reject(res.statusCode);
	}
      }).end();
    }
    else {
      resolve({
	old: oldUrl,
	changed: newUrl
      });
    }
  })
);

export default CopyToPermanentS3 = function(oldUrls, callback) {
  const promises = [];
  const returnedObjects = [];

  if(!oldUrls || oldUrls.length < 1) {
    throw new Error("Need array of urls");
  }

  for(var i = 0; i < oldUrls.length; i++) {
    const newUrl = "/brewskyimages/"+oldUrls[i].split(/(\\|\/)/g).pop();
    promises.push(
      CopyFile(oldUrls[i],newUrl).then( changedUrl => (
	returnedObjects.push(changedUrl))).catch(err => {
	  console.log(err);
	})
    );
  }

  return Promise.all(promises).then(() => returnedObjects).catch(error => console.log(error));
};
