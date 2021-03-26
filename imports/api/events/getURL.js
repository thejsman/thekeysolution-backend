// Time-stamp: 2017-06-14
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : getURL.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Meteor } from "meteor/meteor";

export default GetURL = function (url) {
  if (Meteor.isServer) {
    return S3.knox.http(url);
  } else {
    return url;
  }
};
