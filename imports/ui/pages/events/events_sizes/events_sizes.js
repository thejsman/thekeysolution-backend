import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { updateEventSizePreferences } from '../../../../api/preferences/methods.js';
import { SizePreferences } from '../../../../api/preferences/sizepreference.js';
import { activityRecordInsert } from '../../../../api/activity_record/methods';

import './events_sizes.html';

Template.events_sizes.onRendered(function () {
  this.subscribe('event.size.preferences', FlowRouter.getParam("id"));
  this.$('.tooltipped').tooltip({ delay: 50 });
  this.autorun(() => {
    let foods = SizePreferences.find();
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    }, 1000);
  });
});

Template.events_sizes.helpers({
  sizePreference() {
    let preferences = SizePreferences.findOne({
      eventId: FlowRouter.getParam("id")
    });
    return preferences ? preferences : {
      sizePreferences: ['', '', '']
    };
  }
});


Template.events_sizes.events({
  'submit #edit-size'(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    data.eventId = FlowRouter.getParam("id");
    updateEventSizePreferences.call(data, (err, res) => {
      if (err) {
        showError(err);
      }
      else {
        showSuccess("Updated merchandise preferences");
        //code to add activiy record
        activityInsertData = {
          eventId: data.eventId,
          activityModule: 'App Settings',
          activitySubModule: 'Guest Preferences',
          event: 'Merchandise',
          activityMessage: 'Merchandise preferences updated'
        }
        activityRecordInsert(activityInsertData);
      }
    });
  }
});
