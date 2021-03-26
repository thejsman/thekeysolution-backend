import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './events_ticket.html';
import './events_ticket_info.html';
import './events_ticket.scss';

Template.events_ticket.onRendered(function() {
  
});

Template.events_ticket.helpers({
  ticketAddPath() {
    return FlowRouter.path('events.ticket.add', { id : FlowRouter.getParam("id") });
  },
});

Template.events_ticket_info.helpers({
  inclusionPath() {
    return FlowRouter.path('events.ticket.inclusion', { id : FlowRouter.getParam("id") });
  },
});

Template.ticket_card.events({
  'click'(event, template) {
    FlowRouter.go('events.ticket.info', { id : FlowRouter.getParam("id") });
  }
});