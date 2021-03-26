// Time-stamp: 2017-08-14 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : loginpage.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import '../../components/login/login.js';
import './loginpage.scss';
import './loginpage.html';

Template.login_page.onRendered(function() {
  this.autorun(() => {
    if(Meteor.user() || Meteor.loggingIn()) {
      FlowRouter.go('events.list');
    }
  });
});
