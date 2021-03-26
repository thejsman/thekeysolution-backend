import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { insertGuest } from '../../../../api/guests/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';

import './events_guests.scss';
import './events_add_guest.html';

let isLoading = new ReactiveVar(false);
Template.events_add_guest.onRendered(function () {
  Meteor.setTimeout(() => {
    Materialize.updateTextFields();
  }, 100);
  this.$('.modal').modal();
});

Template.events_add_guest.helpers({
  isEnabled() {
    return isLoading.get() ? "disabled" : "";
  }
});

Template.events_add_guest.events({
  'submit #add-guest'(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    data.eventId = FlowRouter.getParam("id");
    data.guestIsPrimary = !!data.guestIsPrimary;
    isLoading.set(true);
    insertGuest.call(data, (err, res) => {
      isLoading.set(false);
      if (err) {
        showError(err);
      }
      else {
        showSuccess("Guest Added");
        template.$('.modal').modal('close');
        template.$(event.target)[0].reset();
      }
    });
  }
});
