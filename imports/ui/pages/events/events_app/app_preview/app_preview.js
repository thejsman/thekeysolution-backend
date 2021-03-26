import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Events } from '../../../../../api/events/events.js';
import { App_General } from '../../../../../api/app_general/app_general.js';
import { FoodPreferences } from '../../../../../api/preferences/foodpreference';
import { SizePreferences } from '../../../../../api/preferences/sizepreference';
import { SpecialAssistancePreferences } from '../../../../../api/preferences/specialassistancepreference';

import './design.html';
import './welcome.html';
import './about.html';
import './contact.html';
import './destination.html';
import './itinerary.html';
import './wishes_feedback.html';
import './meal_preferences.html';
import './app_navbar.js'

/**
 * TODO: User ReactiveVar or ReactiveDict for preview
 * 
 * 
 */


// App Design Preview
Template.general_preview.onCreated(function(){
  const eventId = FlowRouter.getParam("id");

  this.autorun(() => {
    this.subscribe('event.size.preferences', eventId);
    this.subscribe('event.specialassistance.preferences', eventId);
    this.subscribe('event.food.preferences', eventId);
  });
})

Template.general_preview.onRendered(function(){
  this.autorun(() => {
    // console.log('rendered :: general_preview');
  });
});

Template.general_preview.helpers({
  appBaseSettings: () => {
    const appSettings = App_General.findOne();

    return appSettings;
  },

  aboutUsTitle: () => {
    const eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (event && event.basicDetails && event.basicDetails.eventType && event.basicDetails.eventType == "wedding") {
      return 'BRIDE & GROOM';
    }
    return 'ABOUT';
  },

  checkFeature: (featureName) => {
    const eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (event && event.appDetails && event.appDetails.selectedAppDetails && event.appDetails.selectedAppDetails.indexOf(featureName) > -1) {
      return true;
    }
    return false;
  },

  eventType: (type) => {
    const eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if ((event && event.basicDetails && event.basicDetails.eventType && event.basicDetails.eventType) == type) {
      return true;
    }
    return false;
  },
  checkSocial(socialLink){
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if(socialLink){
      if (event && event.appDetails && event.appDetails.selectedAppSocialDetails && event.appDetails.selectedAppSocialDetails.indexOf(socialLink) > -1) {
        return true;
      }
      return false;
    } else {
      if (event && event.appDetails && event.appDetails.selectedAppSocialDetails && event.appDetails.selectedAppSocialDetails.length > 0) {
        return true;
      }
      return false;
    }
  },
  checkGuestInformation(info){
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if(info){
      if (event && event.appDetails && event.appDetails.selectedAppGuestInfo && event.appDetails.selectedAppGuestInfo.indexOf(info) > -1) {
        return true;
      }
      return false;
    } else {
      if (event && event.appDetails && event.appDetails.selectedAppGuestInfo && event.appDetails.selectedAppGuestInfo.length > 0) {
        return true;
      }
      return false;
    }
  },
  checkGuestPreferences(info){
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if(info){
      if (event && event.appDetails && event.appDetails.selectedAppPreferences && event.appDetails.selectedAppPreferences.indexOf(info) > -1) {
        return true;
      }
      return false;
    } else {
      if (event && event.appDetails && event.appDetails.selectedAppPreferences && event.appDetails.selectedAppPreferences.length > 0) {
        return true;
      }
      return false;
    }
  },
  checkFeedback(info){
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (event && event.appDetails && event.appDetails.featureFeedbackType && event.appDetails.featureFeedbackType == "none") {
      return false;
    }
    return true;  
  },
  
  rsvpTitle() {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (event && event.featureDetails && event.featureDetails.featureRSVPOption && event.featureDetails.featureRSVPOption == "RSVP Registration") {
      return 'REGISTRATION';
    }
    return 'RSVP';

  },
  wish_title() {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (event && event.appDetails && event.appDetails.featureFeedbackType && event.appDetails.featureFeedbackType == "FeedBack") {
      return "FEEDBACK";
    }
    return "WISHES";
  }
});

Template.app_preview_wishes.helpers({
  hasguestInfo(guestInfo) {
    let event = Events.findOne(FlowRouter.getParam("id"));
    return event && event.appDetails.selectedAppGuestInfo ? event.appDetails.selectedAppGuestInfo.indexOf(guestInfo) > -1 : false;
  }
})

Template.app_preview_preference_meal.helpers({
  hasAppPreferences(preference) {
    let event = Events.findOne(FlowRouter.getParam("id"));
    return event && event.appDetails.selectedAppPreferences ? event.appDetails.selectedAppPreferences.indexOf(preference) > -1 : false;
  },
  foodPreference() {
    let preferences = FoodPreferences.findOne({
      eventId: FlowRouter.getParam("id")
    });
    return preferences ? preferences : {
      foodPreferences: ['','','']
    };
  },
})

Template.app_preview_preference_size.helpers({
  hasAppPreferences(preference) {
    let event = Events.findOne(FlowRouter.getParam("id"));
    return event && event.appDetails.selectedAppPreferences ? event.appDetails.selectedAppPreferences.indexOf(preference) > -1 : false;
  },
  sizePreference() {
    let preferences = SizePreferences.findOne({
      eventId: FlowRouter.getParam("id")
    });
    return preferences ? preferences : {
      sizePreferences: ['','','']
    };
  }
})

Template.app_preview_preference_assistance.helpers({
  hasAppPreferences(preference) {
    let event = Events.findOne(FlowRouter.getParam("id"));
    return event && event.appDetails.selectedAppPreferences ? event.appDetails.selectedAppPreferences.indexOf(preference) > -1 : false;
  },
  assistancePreference(){
    let preferences = SpecialAssistancePreferences.findOne({eventId : FlowRouter.getParam("id")});
    return preferences ? preferences : ''
  },
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
})