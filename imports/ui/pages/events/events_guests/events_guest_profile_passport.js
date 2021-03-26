import './events_guest_profile_passport.html';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Guests } from '../../../../api/guests/guests.js';
import { updateGuestPassport } from '../../../../api/guests/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';

Template.agency_passport_add.onRendered(function() {
  // this.subscribe('passports.event', FlowRouter.getParam("id"));
  this.$('select').material_select();
  this.$('.datepicker').pickadate({
    closeOnSelect: true,
    selectYears: 1000,
    selectMonths: true
  });

  this.autorun(() => {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    if(guest && guest.passportInfo) {
      this.$('#guestNationality').val(guest.passportInfo.guestNationality);
      this.$('#guestPhotoID').val(guest.passportInfo.guestPhotoID);
    }
  });
});



Template.agency_passport_add.events({
  'submit #add-passport-form'(event, template) {
    event.preventDefault();
    var jq = template.$(event.target);
    var data = jq.serializeObject();
    data.guestId = FlowRouter.getParam("guestId");
    updateGuestPassport.call(data, (err, res) => {
      if(err) showError(err);
      else showSuccess("Updated Photo ID details");
    });
  }
});

Template.agency_passport_add.helpers({
  guestPassport() {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    console.log(guest);
    if(guest && guest.passportInfo) {
      return guest.passportInfo;
    }
    return {};
  },

  guestPassportImages() {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    if(guest && guest.guestPassportImages && guest.guestPassportImages.length > 0) {
      return guest.guestPassportImages;
    }
    return false;
  }
});
