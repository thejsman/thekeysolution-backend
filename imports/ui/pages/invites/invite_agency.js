// Time-stamp: 2017-08-15 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : invite_agency.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { AdminInvitations } from '../../../api/adminusers/invitations.js';
import { Packages } from '../../../api/packages/packages.js';
import { acceptInvitation } from '../../../api/adminusers/methods.js';
import { showError } from '../../components/notifs/notifications.js';
import './invite_agency.html';
import '../../components/preloader/preloaders.js';

var timer = new ReactiveVar();
var timerId = null;

Template.invite_agency_page.onRendered(function() {
  var token = FlowRouter.getParam('token');
  this.subscribe('packages.all');
  this.subscribe('admin.invite', token);

  timer.set(10);
  timerId = Meteor.setInterval(() => {
    timer.set(timer.get() - 1);
  }, 1000);

});

Template.invite_agency_page.onDestroyed(function() {
  Meteor.clearInterval(timerId);
});

Template.invite_agency_page.helpers({
  inviteDetails() {
    if(AdminInvitations.find().count() > 1) {
      return false;
    }
    else {
      Meteor.clearInterval(timerId);
      return AdminInvitations.findOne();
    }
  },
  showPackageName(){
    // console.log(AdminInvitations.findOne());
      var datahere = AdminInvitations.findOne();
      // console.log(datahere.packageId)
      var packhere = Packages.find({_id:datahere.packageId}).fetch();
      // console.log(packhere[0].packagesName)
      return packhere[0].packagesName;
  },

  showUnavailable() {
    if(timer.get() > 0) {
      return false;
    }
    else {
      Meteor.clearInterval(timerId);
      return true;
    }
  }
  
});


Template.invite_agency_page.events({
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
