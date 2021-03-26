// Time-stamp: 2017-08-13
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : createSuperAdmins.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/meteor-roles';
import _ from 'lodash';


let administrators = Meteor.settings.adminUsers;

let _checkIfAccountsExist = ( count ) => {
  let userCount = Roles.getUsersInRole('superadmin').count();
  return userCount < count ? false : true;
};

let _createUser = ( user ) => {
  let userId = Accounts.createUser({
    email: user.email,
    password: user.password,
    profile: {
      name: user.name
    }
  });

  return userId;
};

let _checkIfUserExists = ( email ) => {
  return Meteor.users.findOne( { 'emails.address': email } );
};

let _checkIfAdmin = ( email ) => {
  return _.find( administrators, ( admin ) => {
    return admin.email === email;
  });
};

let _createUsers = ( users ) => {
  for ( let i = 0; i < users.length; i++ ) {
    let user       = users[ i ],
	userExists = _checkIfUserExists( user.email );
    let isAdmin = _checkIfAdmin( user.email );
    if ( !userExists && isAdmin) {
      let userId  = _createUser( user );
      Roles.setUserRoles( userId, 'superadmin');
    }
  }
};

export const generateAccounts = () => {
  let usersExist    = _checkIfAccountsExist( administrators.length );

  if ( !usersExist ) {
    _createUsers( administrators );
  }
};
