import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Assistances } from '../../../../api/assistances/assistances.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { SpecialAssistancePreferences } from '../../../../api/preferences/specialassistancepreference.js';
import { updateSpecialAssistancePreferences } from '../../../../api/preferences/methods.js';
import { activityRecordInsert } from '../../../../api/activity_record/methods';

import './events_assistances.html';

let deleteId = new ReactiveVar();
let editModal = null;
let editId = new ReactiveVar();
let deleteModal = null;
Template.events_assistances.onRendered(function () {
  this.subscribe('event.specialassistance.preferences', FlowRouter.getParam("id"));
  this.$('.tooltipped').tooltip({ delay: 50 });
});

Template.events_assistances.helpers({
  assistanceData() {
    let ass = SpecialAssistancePreferences.findOne();
    if (ass) {
      let options = ass.assistanceOptions;
      while (options.length < 3) {
        options.push('');
      }
      ass.assistanceOptions = options;
      Meteor.setTimeout(() => {
        Materialize.updateTextFields();
      }, 100);
      return ass;
    }
    return {
      assistanceOptions: ['', '', '']
    };
  }
});

Template.events_assistances.events({
  'submit #edit-assistance'(event, template) {
    event.preventDefault();
    let eventId = FlowRouter.getParam('id');
    var target = template.$(event.target);
    var data = target.serializeObject();
    data.eventId = eventId;
    updateSpecialAssistancePreferences.call(data, (err, res) => {
      if (err) {
        showError(err);
      }
      else {
        showSuccess("Updated special assistance preferences");
        //code to add activiy record
        activityInsertData = {
          eventId: data.eventId,
          activityModule: 'App Settings',
          activitySubModule: 'Guest Preferences',
          event: 'Special Assistance',
          activityMessage: 'Special assistance preferences updated'
        }
        activityRecordInsert(activityInsertData);
      }
    });
  }
});
