import './events_guest_profile_preferences.html';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { FoodPreferences } from '../../../../api/preferences/foodpreference.js';
import { SpecialAssistancePreferences } from '../../../../api/preferences/specialassistancepreference.js';
import { SizePreferences } from '../../../../api/preferences/sizepreference.js';
import { updateGuestPreferences } from '../../../../api/preferences/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Guests } from '../../../../api/guests/guests.js';


Template.guest_profile_preference.onRendered(function(){
  this.autorun(() => {
    let foods = FoodPreferences.find().count();
    let sizes = SizePreferences.find().count();
    let specials = SpecialAssistancePreferences.find().count();
    let guest = Guests.findOne({ _id: FlowRouter.getParam("guestId")});

    Meteor.setTimeout(() => {
      // console.log(guest.foodPreference);
      if(guest) {
        this.$('#foodPreference').val(guest.foodPreference);
        this.$("#sizePreference").val(guest.sizePreference);
        this.$('#specialAssistance').val(guest.specialAssistance);
      }
      this.$('select').material_select();
      Materialize.updateTextFields();
    }, 1000);
  });
});


Template.guest_profile_preference.helpers({
  sizeList() {
    let size = SizePreferences.findOne({eventId: FlowRouter.getParam("id")});
    return size ? size.sizePreferences.filter(pr => pr !== '') : false;
  },

 sizePreferenceRemark() {
    let size = Guests.findOne(FlowRouter.getParam("guestId"));
    return size ? size.sizePreferenceRemark : "No remarks set";
  },

  sizePreferenceLabel() {
    let size = SizePreferences.findOne({eventId: FlowRouter.getParam("id")});
    return size ? size.sizeSectionRemarks : "No label defined";
  },

  foodPreferencesRemark() {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    return guest ? guest.foodPreferencesRemark : "No remarks set";
  },

  foodPreferencesLabel() {
    let food = FoodPreferences.findOne({eventId: FlowRouter.getParam("id")});
    return food ? food.foodSectionStatement : "No label defined";
  },

  foodList() {
    let food = FoodPreferences.findOne({eventId: FlowRouter.getParam("id")});
    return food ? food.foodPreferences.filter(pr => pr !== '') : false;
  },

  specialList() {
    let ass = SpecialAssistancePreferences.findOne({ eventId: FlowRouter.getParam("id")});
    return ass ? ass.assistanceOptions.filter(pr => pr !== '') : false;
  },

  specialPreferencesLabel() {
    let ass = SpecialAssistancePreferences.findOne({eventId: FlowRouter.getParam("id")});
    return ass ? ass.assistanceSectionStatement : "No label defined";
  },

  specialPreferencesRemark() {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    return guest ? guest.specialAssistanceRemark : "No remarks set";
  }
});

Template.guest_profile_preference.events({
  'submit #guest-profile-preference'(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    data.guestId = FlowRouter.getParam("guestId");
    data.specialAssistance = template.$('#specialAssistance').val();
    updateGuestPreferences.call(data, (err, res) => {
      if(err) {
        showError(err);
      }
      else {
        showSuccess("Updated guest preferences");
      }
    });
  }
});
