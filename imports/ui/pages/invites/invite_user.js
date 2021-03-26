// Time-stamp: 2017-08-16 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : invite_user.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { AdminInvitations } from '../../../api/adminusers/invitations.js';
import { acceptInvitation } from '../../../api/adminusers/methods.js';
import { showError } from '../../components/notifs/notifications.js';
import '../../components/preloader/preloaders.js';
import './invite_user.html';

var timer = new ReactiveVar();
var timerId = null;
Template.invite_user_page.onRendered(function() {
  var token = FlowRouter.getParam('token');
  this.subscribe('admin.invite', token);

  timer.set(10);
  timerId = Meteor.setInterval(() => {
    timer.set(timer.get() - 1);
  }, 1000);

});

Template.invite_user_page.onDestroyed(function() {
  Meteor.clearInterval(timerId);
});

Template.invite_user_page.helpers({
  inviteDetails() {
    if(AdminInvitations.find().count() > 1) {
      return false;
    }
    else {
      Meteor.clearInterval(timerId);
      return AdminInvitations.findOne();
    }
  },

  showUnavailable() {
    console.log(timer.get());
    if(timer.get() > 0) {
      return false;
    }
    else {
      Meteor.clearInterval(timerId);
      return true;
    }
  }
  
});

Template.invite_user_page.events({
  'submit #accept-invitation'(event, template) {
    event.preventDefault();
    var invite = AdminInvitations.findOne();
    if(!invite) {
      return;
    }
    var data = template.$(event.target).serializeObject();
    data.password = Accounts._hashPassword(data.password);
    data.token = FlowRouter.current().params.token;

    acceptInvitation.call(data, (err, res) => {
      if(err) {
	showError(err.toString());
      }
      else {
	FlowRouter.go('/');
      }
    });
    
  }
});
