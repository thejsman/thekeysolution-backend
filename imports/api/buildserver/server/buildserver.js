// Time-stamp: 2017-10-28
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : buildserver.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { HTTP } from 'meteor/http';
import { Meteor } from 'meteor/meteor';
import ip from 'ip';

class BuildServer {

  authKey: null

  connect(url) {
  };

  buildApk(info) {

    return new Promise((resolve, reject) => {
      let serverInfo = {
	serverHost: ip.address()
      };
      info = Object.assign(info, serverInfo);
      HTTP.post(`${Meteor.settings.buildServer.url}/build`, {
	data: info,
	headers: {
	  password: Meteor.settings.buildServer.key
	}
      }, (error, result) => {
	if(error) return reject(error);
	console.log(result.content);
	resolve(result.content);
      });
    });

  }
}

let bs = new BuildServer();
export default bs;
