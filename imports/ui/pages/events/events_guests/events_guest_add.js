import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Random } from 'meteor/random';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session'
import { insertGuest, updateGuests } from '../../../../api/guests/methods.js';
import { Airports } from '../../../../api/airports/airports.js';
import { showError, showSuccess, showWarning } from '../../../components/notifs/notifications.js';
import _ from 'lodash';
import { Guests } from '../../../../api/guests/guests.js';
import { GuestMemberSchema } from '../../../../api/guests/schema.js';
import './events_guests.scss';
import './events_guest_add.html';
import countrycodes from '../../../../extras/countrycodes.js';
import { Meteor } from 'meteor/meteor';
import { HotelforsaleBookings } from '../../../../api/hotelsforsale/hotelforsaleBookings';
import { HotelBookings } from '../../../../api/hotels/hotelBookings';
import { FlightforsaleBookings } from '../../../../api/flightsforsale/flightforsaleBookings';
import { FlightBookings } from '../../../../api/flights/flightBookings';
import { Events } from '../../../../api/events/events.js';
import { SubEvents } from '../../../../api/subevents/subevents.js';
import { updateInvitation } from '../../../../api/rsvp/methods.js';

var guestMember = new ReactiveVar();
var selectedContact = new ReactiveVar();
var selectedContactN = new ReactiveVar();
var phoneCode = new ReactiveVar("+91");
var useSameContact = new ReactiveVar(false);

let subEventsList = new ReactiveVar([]);

Session.setDefault('key', false);

let editId = new ReactiveVar(null);
let selects = ['guestTitle', 'guestAddressNationality', 'guestNearestAirport', 'guestPhoneNo', 'guestGender'];
Template.events_guest_add.onRendered(function () {
  this.autorun(() => {
    let subReady = this.subscribe('subevents.event', FlowRouter.getParam("id"));
    if (subReady) {
      let subevents = SubEvents.find({}).fetch();
      let seList = subevents.map(a => {
        return {
          subEventId: a._id,
          status: true
        }
      });
      subEventsList.set(seList);
    } else {

    }
  });

  this.subscribe('hotelbookings.guest', FlowRouter.getQueryParam("guestId"));
  this.subscribe('hotelforsalebookings.guest', FlowRouter.getQueryParam("guestId"));
  this.subscribe('flight.bookings.guest', FlowRouter.getQueryParam("guestId"));
  this.subscribe('flightforsale.bookings.guest', FlowRouter.getQueryParam("guestId"));
  this.$('.tooltipped').tooltip({ delay: 50 });
  this.$('select').material_select();
  this.$('#guestAddress1').trigger('autoresize');
  this.$('#guestAddress2').trigger('autoresize');
  this.$('input#guestFirstName,input#guestLastName,input#guestAddressing,input#guestFirstName, textarea#textarea1').characterCounter();
  phoneCode.set("+91");
  guestMember.set([]);
  editId.set(null);

  var d = new Date();
  d.setFullYear(d.getFullYear() - 100);
  this.$('.datepicker').pickadate({
    selectMonths: true,
    selectYears: 80,
    max: new Date()
  });

  let ed = FlowRouter.getQueryParam("guestId");
  let eventId = FlowRouter.getParam("id");
  if (ed) {
    Meteor.subscribe('guests.guestInfo', ed, eventId);
    this.autorun(() => {
      let event = Events.find().fetch();
      let guest = Guests.findOne(ed);
      if (guest) {
        selects.forEach(s => {
          this.$(`#${s}`).val(guest[s]);
        });
        Meteor.setTimeout(() => {
          Materialize.updateTextFields();
          if (event[0].featureDetails.selectedFeatures) {
            // console.log('SAM TEST START', event[0].featureDetails.selectedFeature);
            var selectedFeature = event[0].featureDetails.selectedFeatures;

            if ((selectedFeature.indexOf("Hotel Booking Paid") > -1) && (selectedFeature.indexOf("Hotel Booking") > -1)) {
              // console.log('in condition 1 ');
            } else if ((selectedFeature.indexOf("Hotel Booking Paid") < 0) && (selectedFeature.indexOf("Hotel Booking") > -1)) {

              $("#freeHotelRoom").prop("checked", true);
              $('#freeHotelRoom').attr('disabled', 'disabled');
              $('#freeHotelRoomDiv').css('display', 'none');

              // $('#freeHotelRoom').prop('disabled', true);
            } else if ((selectedFeature.indexOf("Hotel Booking Paid") > -1) && (selectedFeature.indexOf("Hotel Booking") < 0)) {

              $("#freeHotelRoom").prop("checked", false);
              $('#freeHotelRoom').attr('disabled', 'disabled');
              $('#freeHotelRoomDiv').css('display', 'none');

              //  $('#freeHotelRoom').prop('disabled', true);
            } else if ((selectedFeature.indexOf("Hotel Booking Paid") < 0) && (selectedFeature.indexOf("Hotel Booking") < 0)) {

              $('#freeHotelRoomDiv').css('display', 'none');
              $("#freeHotelRoom").prop("checked", true);
            }

            if ((selectedFeature.indexOf("Flight Booking") > -1) && (selectedFeature.indexOf("Flight Booking Paid") > -1)) {
              // console.log('BOTH FILGHT ALLOWED ');
            } else if ((selectedFeature.indexOf("Flight Booking") < 0) && (selectedFeature.indexOf("Flight Booking Paid") > -1)) {

              $("#freeFlightTicket").prop("checked", false);
              $('#freeFlightTicket').attr('disabled', 'disabled');
              $('#freeFlightTicketDiv').css('display', 'none');
              // console.log('ONLY PAID FILGHT ALLOWED ');
              // $('#freeHotelRoom').prop('disabled', true);
            } else if ((selectedFeature.indexOf("Flight Booking") > -1) && (selectedFeature.indexOf("Flight Booking Paid") < 0)) {

              $("#freeFlightTicket").prop("checked", true);
              $('#freeFlightTicket').attr('disabled', 'disabled');
              $('#freeFlightTicketDiv').css('display', 'none');
              // console.log('ONLY FREE FILGHT ALLOWED ');
              //  $('#freeHotelRoom').prop('disabled', true);
            } else if ((selectedFeature.indexOf("Flight Booking") < 0) && (selectedFeature.indexOf("Flight Booking Paid") < 0)) {

              $('#freeFlightTicketDiv').css('display', 'none');
              $("#freeFlightTicket").prop("checked", true);
              // console.log('BOTH FILGHT NOT ALLOWED ');

            }

          }

          this.$('select').material_select();
          this.$('.tooltipped').tooltip({ delay: 50 });
        }, 10);
        editId.set(guest);
      }
      else {
        editId.set(null);

      }
    });

    setTimeout(function () {
      let freeHotelBookCount = HotelBookings.find({ 'guestId': FlowRouter.getQueryParam("guestId") }).count();
      if (freeHotelBookCount > 0) {
        $('#freeHotelRoom').attr('disabled', 'disabled');
      }
      let paidHotelBookCount = HotelforsaleBookings.find({ 'guestId': FlowRouter.getQueryParam("guestId") }).count();
      if (paidHotelBookCount > 0) {
        $('#freeHotelRoom').attr('disabled', 'disabled');
      }

      let freeFlightBookCount = FlightBookings.find({ 'guestId': FlowRouter.getQueryParam("guestId"), 'flightId': { $exists: true, $ne: null } }).count();

      if (freeFlightBookCount > 0) {
        $('#freeFlightTicket').attr('disabled', 'disabled');
      }
      let paidFlightBookCount = FlightforsaleBookings.find({ 'guestId': FlowRouter.getQueryParam("guestId") }).count();
      if (paidFlightBookCount > 0) {
        $('#freeFlightTicket').attr('disabled', 'disabled');
      }


    }, 1000);

  }

  this.autorun(() => {
    setTimeout(function () {
      if (!(editId)) {
        // console.log("new guest edit");
      }
      let event = Events.find().fetch();
      if (event[0].featureDetails.selectedFeatures) {
        // console.log('SAM TEST START', event[0].featureDetails.selectedFeature);
        var selectedFeature = event[0].featureDetails.selectedFeatures;

        if ((selectedFeature.indexOf("Hotel Booking Paid") > -1) && (selectedFeature.indexOf("Hotel Booking") > -1)) {
          // console.log('in condition 1 ');
          // console.log('BOTH HOTEL ALLOWED ');

        } else if ((selectedFeature.indexOf("Hotel Booking Paid") < 0) && (selectedFeature.indexOf("Hotel Booking") > -1)) {

          $("#freeHotelRoom").prop("checked", true);
          $('#freeHotelRoom').attr('disabled', 'disabled');
          $('#freeHotelRoomDiv').css('display', 'none');

          // console.log('ONLY FREE HOTEL ALLOWED ');
          // $('#freeHotelRoom').prop('disabled', true);
        } else if ((selectedFeature.indexOf("Hotel Booking Paid") > -1) && (selectedFeature.indexOf("Hotel Booking") < 0)) {

          $("#freeHotelRoom").prop("checked", false);
          $('#freeHotelRoom').attr('disabled', 'disabled');
          $('#freeHotelRoomDiv').css('display', 'none');

          // console.log('ONLY PAID HOTEL ALLOWED ');

          //  $('#freeHotelRoom').prop('disabled', true);
        } else if ((selectedFeature.indexOf("Hotel Booking Paid") < 0) && (selectedFeature.indexOf("Hotel Booking") < 0)) {

          $('#freeHotelRoomDiv').css('display', 'none');
          $("#freeHotelRoom").prop("checked", true);
          // console.log('NO HOTEL ALLOWED ');

        }

        if ((selectedFeature.indexOf("Flight Booking") > -1) && (selectedFeature.indexOf("Flight Booking Paid") > -1)) {
          // console.log('BOTH FILGHT ALLOWED ');
        } else if ((selectedFeature.indexOf("Flight Booking") < 0) && (selectedFeature.indexOf("Flight Booking Paid") > -1)) {

          $("#freeFlightTicket").prop("checked", false);
          $('#freeFlightTicket').attr('disabled', 'disabled');
          $('#freeFlightTicketDiv').css('display', 'none');
          // console.log('ONLY PAID FILGHT ALLOWED ');
          // $('#freeHotelRoom').prop('disabled', true);
        } else if ((selectedFeature.indexOf("Flight Booking") > -1) && (selectedFeature.indexOf("Flight Booking Paid") < 0)) {

          $("#freeFlightTicket").prop("checked", true);
          $('#freeFlightTicket').attr('disabled', 'disabled');
          $('#freeFlightTicketDiv').css('display', 'none');
          // console.log('ONLY FREE FILGHT ALLOWED ');
          //  $('#freeHotelRoom').prop('disabled', true);
        } else if ((selectedFeature.indexOf("Flight Booking") < 0) && (selectedFeature.indexOf("Flight Booking Paid") < 0)) {

          $('#freeFlightTicketDiv').css('display', 'none');
          $("#freeFlightTicket").prop("checked", true);
          // console.log('BOTH FILGHT NOT ALLOWED ');
        }

      }

    }, 600);
  })



});

Template.events_guest_add.helpers({

  subevents() {
    return SubEvents.find({});
  },

  guestIsPrimary() {
    let guest = editId.get();
    return guest ? guest.guestIsPrimary : true;
  },

  isAdding() {
    // console.log(editId.get());
    return editId.get() ? false : true;
  },

  title() {
    return editId.get() ? "Edit Guest" : "Add Guest";
  },

  buttonText() {
    return editId.get() ? "Save Guest" : "Save Guest";
  },

  guestInfo() {
    let id = FlowRouter.getQueryParam("guestId");

    let guest = Guests.findOne(id);
    return guest ? guest : {};
  },

  members() {
    let members = guestMember.get();
    return members.length > 0 ? members : false;
  },

  membersVar() {
    return guestMember;
  },

  phoneCode() {
    return phoneCode.get();
  },

  isEnabled() {
    return isLoading.get() ? "disabled" : "";
  },
  contactno() {
    if (useSameContact.get()) {
      return phoneCode.get() + selectedContactN.get();
    }
    return null;
  },
  airportiata() {
    var airportiataa = Airports.find();
    if (airportiataa.count() > 0) {
      $('select').material_select();
    }
    return airportiataa;
  },
});


Template.events_guest_add.events({
  // ABL : BOC TO Check existing booking before swtiching Hotel type
  'click #hotelSwitch'(event, template) {
    if (($('#freeHotelRoom').attr('disabled'))) {
      showWarning('You have to delete existing Hotel Booking !');
    }
    return;
  },
  // ABL : EOC TO Check existing booking before swtiching Hotel type

  // ABL : BOC TO Check existing booking before swtiching Flight type
  'click #flightSwitch'(event, template) {
    if (($('#freeFlightTicket').attr('disabled'))) {
      showWarning('You have to delete existing Flight Booking !');
    }
    return;
  },
  // ABL : EOC TO Check existing booking before swtiching Flight type


  'change #guestPhoneCode'() {
    let xyz = $('#guestPhoneCode').val();
    phoneCode.set(xyz);
  },
  'submit #add-guest-form'(event, template) {
    event.preventDefault();
    var jq = template.$(event.target);
    var data = jq.serializeObject();
    data.guestPersonalEmail = (data.guestPersonalEmail.toLowerCase()).trim();
    // console.log("Guest insert data is - " , data);
    if ($('#freeFlightTicket').prop('checked')) {
      data.freeFlightTicket = true;
    } else {
      data.freeFlightTicket = false;
    }
    if ($('#freeHotelRoom').prop('checked')) {
      data.freeHotelRoom = true;
    } else {
      data.freeHotelRoom = false;
    }
    if ($('#canBringCompanion').prop('checked')) {
      data.canBringCompanion = true;
    } else {
      data.canBringCompanion = false;
    }

    data.eventId = FlowRouter.getParam("id");
    data.guestMember = guestMember.get();
    if ($('#freeHotelRoom').is(':checked')) {
      data.freeHotelRoom = true;
    }
    else {
      data.freeHotelRoom = false;
    }

    if ($('#freeFlightTicket').is(':checked')) {
      data.freeFlightTicket = true;
    }
    else {
      data.freeFlightTicket = false;
    }
    if ($('#canBringCompanion').is(':checked')) {
      data.canBringCompanion = true;
    } else {
      data.canBringCompanion = false;
    }

    // console.log('data', data);
    let ed = editId.get();
    let cbText = ed ? "Updated Guest Details" : "Guest Added";
    let cb = (err, res) => {
      if (err) {
        showError(err);
      }
      else {
        template.$('.modal').modal('close');
        showSuccess(cbText);
        FlowRouter.go('events.guest', { id: FlowRouter.getParam("id") });
        // location.reload()
      }
    };
    if (ed) {
      let updatedData = Object.assign(ed, data);
      updatedData.guestId = FlowRouter.getQueryParam("guestId");
      updateGuests.call(updatedData, cb)
    }
    else {
      data._id = Random.id();
      let guestId = data._id;
      // data.inviteStatus = subEventsList.get();
      insertGuest.call(data, cb);
      let eventId = FlowRouter.getParam("id");
      let subevents = subEventsList.get();
      // console.log(subevents);
      // updateInvitation.call({ guestId, subevents }, (err, res) => {
      //   if (err){
      //     console.log('invitation error ',err);
      //   }
      // });
    }
  },
  'change #guestContactNo,paste #guestContactNo, keyup #guestContactNo, mouseup #guestContactNo'(event, template) {
    var comment_text = template.$(event.target).val();
    if (useSameContact.get()) {
      template.$('#guestPhoneNo').val(comment_text);
    }
    selectedContact.set(comment_text)
    selectedContactN.set(comment_text);
  },
  'change #filled'(event, template) {
    // Also, no need for the pound sign here
    var comment_text = template.$(event.target).val();
    if (event.target.checked) {
      useSameContact.set(true);
      let val = template.$('#guestContactNo').val();
      template.$('#guestPhoneNo').val(val);
      Materialize.updateTextFields();
      selectedContact.set(val)
      selectedContactN.set(val);
    }
    else {
      useSameContact.set(false);
      Session.set('key', false);
      template.$('#guestPhoneNo').val('');
    }
  }
});



Template.events_guest_add_member.onRendered(function () {
  this.$('.modal').modal();
  this.$('.tooltipped').tooltip({ delay: 50 });
});

Template.events_guest_add_member.events({
  'submit #add-new-guest-member'(event, template) {
    event.preventDefault();
    var jq = template.$(event.target);
    var data = jq.serializeObject();
    data._id = Random.id();
    var cleanedObj = GuestMemberSchema.clean(data);
    var validationContext = GuestMemberSchema.newContext();
    validationContext.validate(cleanedObj);
    // console.log("Guest Data Object ::: ", validationContext.validate(cleanedObj));
    if (validationContext.isValid()) {
      let members = template.data.membersVar.get();
      members.push(cleanedObj);
      template.data.membersVar.set(members);
      template.$('.modal').modal('close');
      // addToList(servicemembers, cleanedObj);
      // template.$('.modal').modal('close');
    }
    else {
      // console.log(validationContext.validationErrors());
      showError(validationContext.validationErrors()[0].toString());
    }
  }
});



Template.events_guest_add_member.helpers({

});



Template.events_guest_member_info.events({
  'click .click_remove-member'(event, template) {
    let memberId = template.data.member._id;
    let members = guestMember.get();
    _.remove(members, member => {
      return member._id === memberId;
    });
    guestMember.set(members);
  }
});
