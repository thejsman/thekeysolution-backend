import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { HasRole } from '../../../extras/hasRole.js';
import { Events } from '../../../api/events/events'

import './side_navbar.js';
import './top_navbar.html';

Template.top_navbar.helpers({
  homeRoute() {
    return FlowRouter.path('events.list');
  },
  showAdmin() {
    return (HasRole(Meteor.userId(), 'admin')||HasRole(Meteor.userId(), 'member'));
  },
  currentUserName(){
    if(Meteor.user()) {
      return Meteor.user().profile.name;
    }
    return "";
  }
});

Template.top_navbar.events({
  'click #logout-button': function (event, template) {
    Meteor.logout();
  },

  'click #ham-menu': function (event){
    $('#nav-mobile').toggleClass('active');
  }
});

Template.breadcrumbs.helpers({
  eventRoute(){
    let event = FlowRouter.getParam("id");
    if(event){
      return '/events'
    } else {
      return false
    }
  },

  eventName(){
    let event = Events.findOne();
    return event && event.basicDetails.eventName;
  },

  eventSummary(){
    let event = FlowRouter.getRouteName();
    if(event == 'events.summary'){
      return true;
    } else {
      return false
    }
  },
  eventSummaryPath() {
    return FlowRouter.path('events.summary', { id: FlowRouter.getParam("id") });
  },
})