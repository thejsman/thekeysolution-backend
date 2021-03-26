// Time-stamp: 2017-08-14 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : hasRole.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Roles } from 'meteor/meteor-roles';

export const MainRoles = ['admin', 'client', 'freelancer'];

export const HasRole = (userId, roles) => {
  var scopes = Roles.getScopesForUser(userId);
  if(scopes.length > 0) {
    var has = false;
    for(var i = 0; i < scopes.length; i++) {
      if(Roles.userIsInRole(userId,roles, scopes[i])) {
	has = true;
	break;
      }
    }
    return has;
  }
  else {
    return Roles.userIsInRole(userId, roles);
  }
};
