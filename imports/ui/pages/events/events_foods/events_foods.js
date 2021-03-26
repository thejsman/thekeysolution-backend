import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { FoodPreferences } from '../../../../api/preferences/foodpreference.js';
import { updateEventFoodPreferences } from '../../../../api/preferences/methods.js';
import { activityRecordInsert } from  '../../../../api/activity_record/methods';

import './events_foods.html';
import '../events_app/app_preview/app_preview';

Template.events_foods.onRendered(function() {
  this.subscribe('event.food.preferences', FlowRouter.getParam("id"));
  this.$('.tooltipped').tooltip({delay: 50});
  this.autorun(() => {
    let foods = FoodPreferences.find();
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    }, 1000);
  });
});

Template.events_foods.helpers({
  foodPreference() {
    let preferences = FoodPreferences.findOne({
      eventId: FlowRouter.getParam("id")
    });
    return preferences ? preferences : {
      foodPreferences: ['','','']
    };
  }
});


Template.events_foods.events({
  'submit #edit-food'(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    data.eventId = FlowRouter.getParam("id");
    updateEventFoodPreferences.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
  showSuccess("Updated meal  preferences");
  //code to add activiy record
  activityInsertData = {
    eventId: data.eventId,
    activityModule: 'App Settings',
    activitySubModule: 'Guest Preferences',
    event: 'Meal',
    activityMessage: 'Meal preferences updated'
  }
  activityRecordInsert(activityInsertData);
      }
    });
  }
});
