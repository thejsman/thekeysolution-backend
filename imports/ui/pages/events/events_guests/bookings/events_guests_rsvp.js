import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Events } from '../../../../../api/events/events.js';
import { SubEvents } from '../../../../../api/subevents/subevents.js';
import { SubEventSortingTypes } from '../../../../../api/events/subEventSortingTypes.js';
import { RSVP } from '../../../../../api/rsvp/rsvp.js';
import { Guests } from '../../../../../api/guests/guests.js';
import { updateRSVP, updateInvitation } from '../../../../../api/rsvp/methods.js';
import { showSuccess, showError } from '../../../../components/notifs/notifications.js';
import { activityRecordInsert } from '../../../../../api/activity_record/methods';
import './events_guests_rsvp.html';
import './events_guests_invites.html';
import _ from 'lodash';
import moment from 'moment';



Template.events_guest_invite.onCreated(function () {
  this.subeventList = new ReactiveVar([]);
});

Template.events_guest_invite.onRendered(function () {
  let rsvpSub = this.subscribe('rsvp.guest', {
    guestId: FlowRouter.getParam("guestId"),
    eventId: FlowRouter.getParam("id")
  });

  this.autorun(() => {
    let subReady = rsvpSub.ready();
    let events = Events.find();
    let guests = Guests.find();
    let subevents = SubEvents.find();
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    if (guest) {
      let inviteStatus = guest.inviteStatus ? guest.inviteStatus : -1;
      let list = getEventsList(guest.inviteStatus);
      this.subeventList.set(list);
    }
  });
});

Template.events_guest_invite.events({
  'change #toggle-checkboxes'(event, template) {
    template.$('input:checkbox').not(this).prop('checked', event.target.checked);
  },

  'submit #guest-invite'(event, template) {
    event.preventDefault();
    let statuses = _.map(template.$('input').not('#toggle-checkboxes'), (jq) => {
      return {
        subEventId: jq.id.substring(1),
        status: template.$(jq).prop('checked')
      };
    });
    let subevents = [];
    _.each(statuses, (statusObj) => {
      let eventIds = statusObj.subEventId.split(',');
      let status = statusObj.status;
      _.each(eventIds, (id) => {
        subevents.push({
          subEventId: id,
          status
        });
      });
    });
    let guestId = FlowRouter.getParam("guestId");
    let newGuest = Guests.findOne(guestId);
    updateInvitation.call({ guestId, subevents }, (err, res) => {
      if (err) showError(err)
      else {
        showSuccess("Updated guest invitations");
        //code to insert data in Activity Record
        activityInsertData = {
          eventId: newGuest.eventId,
          activityModule: 'Guests',
          activitySubModule: 'RSVP',
          event: 'Update',
          activityMessage: 'RSVP of ' + newGuest.guestTitle + ' ' + newGuest.guestFirstName + ' ' + newGuest.guestLastName + ' is updated.'
        }
        activityRecordInsert(activityInsertData);
      }
    });
  }
});

Template.events_guest_invite.helpers({
  subeventsList() {
    return Template.instance().subeventList.get();
  }
});

Template.events_guests_rsvp_invite_item.onCreated(function () {
  this.currentState = new ReactiveVar();
});

Template.events_guests_rsvp_invite_item.onRendered(function () {
  let status = this.data.rsvp.status;
  let property = 'checked';
  let val = false;
  var stringProp = null;
  if (status === false) {
    val = false;
    stringProp = false;
  }
  else {
    val = true;
    stringProp = true;
  }
  this.$('input').prop(property, val);
  this.currentState.set(stringProp);
});

Template.events_guests_rsvp_invite_item.events({
  'change .subevent-rsvp'(event, template) {
    template.currentState.set(event.target.checked);
  }
});

Template.events_guests_rsvp_invite_item.helpers({
  currentState() {
    return Template.instance().currentState.get();
  }
});


Template.events_guests_rsvp.onCreated(function () {
  this.subeventList = new ReactiveVar([]);
});

Template.events_guests_rsvp.onRendered(function () {
  let rsvpSub = this.subscribe('rsvp.guest', {
    guestId: FlowRouter.getParam("guestId"),
    eventId: FlowRouter.getParam("id")
  });
  this.autorun(() => {
    let subReady = rsvpSub.ready();
    let event = Events.findOne();
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    if (guest) {
      let inviteStatus = guest.inviteStatus ? guest.inviteStatus : [];
      let subevents = SubEvents.find({ eventId: event._id });
      let rsvps = RSVP.find({ guestId: guest._id });
      let subs = [];
      subevents.forEach(sub => {
        let invite = inviteStatus.find(s => {
          return s.subEventId === sub._id
        });
        if (!invite || invite.status !== false) {
          subs.push(sub._id);
        }
      });
      let list = getEventsList(null, subs);
      this.subeventList.set(list);
    }
  });
});

Template.events_guests_rsvp.helpers({
  availableTill() {
    let event = Events.findOne(FlowRouter.getParam("id"));
    if (event) {
      return event.basicDetails.eventRSVPBy;
    }
    return "";
  },
  canRSVP() {
    let event = Events.findOne(FlowRouter.getParam("id"));
    if (event) {
      let m = moment(event.basicDetails.eventRSVPBy, "DD MMMM, YYYY");
      m.add(1, 'd');
      return moment().isBefore(m);
    }
    return false;
  },
  rsvpList() {
    return Template.instance().subeventList.get();
  }
});

Template.events_guests_rsvp.events({
  'submit #rsvp-form'(event, template) {
    event.preventDefault();
    let guestId = FlowRouter.getParam("guestId");
    let eventId = FlowRouter.getParam("id");

    let statuses = _.map(template.$('input'), (jq) => {
      return {
        subEventId: jq.id,
        status: template.$(jq).prop('indeterminate') ? 'indeterminate' : jq.checked
      };
    });

    let eventStatuses = [];
    _.each(statuses, (statusObj) => {
      let eventIds = statusObj.subEventId.split(',');
      let status = statusObj.status;

      _.each(eventIds, (id) => {
        eventStatuses.push({
          subEventId: id,
          status
        });
      });

    });
    updateRSVP.call({
      eventId, guestId, subevents: eventStatuses
    }, (err, res) => {
      if (err) showError(err)
      else showSuccess("Updated guest rsvp");
    });
  }
});

Template.events_guests_rsvp_subevent.onCreated(function () {
  this.currentState = new ReactiveVar();
  this.propertyName = new ReactiveVar();

  this.setProperty = (property, val) => {
    Meteor.setTimeout(() => {
      this.currentState.set(val);
      this.propertyName.set(property);
    });
  };
});

Template.events_guests_rsvp_subevent.onRendered(function () {
  this.autorun(() => {
    let currentState = this.currentState.get();
    let propertyName = this.propertyName.get();
    if (propertyName) {
      this.$('input').prop(propertyName, currentState);

      if (propertyName === 'checked') {
        this.$('input').prop('indeterminate', false);
      }
    }
  });
});

Template.events_guests_rsvp_subevent.events({
  'change .subevent-rsvp'(event, template) {
    template.propertyName.set('checked')
    template.currentState.set(event.target.checked)
  }
});

Template.events_guests_rsvp_subevent.helpers({
  currentState() {
    let state = this.rsvp.status;
    if (state === true) {
      return 'Yes';
    }
    else if (state === false) {
      return 'No';
    }
    else {
      return 'Maybe';
    }
  },

  checked() {
    let status = this.rsvp.status;
    let val = true;
    let stringProp = true;
    let property = "checked";
    if (status === true) {
      val = true;
      stringProp = true;
    }
    else if (status === false) {
      val = false;
      stringProp = false;
    }
    else {
      property = 'indeterminate';
      val = true;
      stringProp = "Maybe";
    }

    Template.instance().setProperty(property, val);
  },

  indeterminate() {
    let status = this.rsvp.status;
    if (status !== true && status !== false) {
      return "indeterminate";
    }
    return "";
  }
});

const getEventsList = (rsvpList, subs) => {
  let guestId = FlowRouter.getParam("guestId");
  let eventId = FlowRouter.getParam('id');
  let event = Events.findOne(eventId);
  let rsvps = rsvpList && rsvpList !== -1 ? rsvpList : RSVP.find({ guestId }).fetch();
  if (!event) {
    return [];
  }
  let sortingType = event.basicDetails.eventSubeventSorting;

  let subevents = SubEvents.find({
    eventId: event._id
  });

  if (subs) {
    subevents = SubEvents.find({
      eventId: event._id,
      _id: {
        $in: subs
      }
    });
  }

  let val = [];
  switch (sortingType) {
    case SubEventSortingTypes.subevent:
      val = getSubEvents(subevents.fetch(), rsvps);
      break;
    case SubEventSortingTypes.date:
      val = getSubEventsByDate(subevents.fetch(), rsvps);
      break;
    case SubEventSortingTypes.destination:
      val = getSubEventsByDestination(subevents.fetch(), rsvps);
      break;
    default:
      break;
  }
  return val;
};

const getSubEvents = (subs, rsvps) => {
  return _.map(subs, (s) => {
    let rsvp = _.find(rsvps, (r) => {
      return r.subEventId === s._id;
    });
    if (rsvp) {
      rsvp = rsvp.status;
    }
    else {
      rsvp = null;
    }
    return {
      subEventTitle: s.subEventTitle,
      subEventId: s._id,
      status: rsvp
    };
  });
};

const getSubEventsByDate = (subs, rsvps) => {
  let dates = _.groupBy(subs, 'subEventDate');
  let events = _.map(dates, (s, d) => {
    let ids = _.map(s, '_id');
    let statuses = _.map(ids, (id) => {
      let rsvp = _.find(rsvps, (r) => {
        return r.subEventId === id;
      });
      if (rsvp) {
        return rsvp.status;
      }
      else {
        return null;
      }
    });
    let status = null;
    if (statuses.length > 0) {
      let unique = _.uniq(statuses).length === 1;
      if (unique) {
        status = statuses[0];
      }
      else if (statuses.length == 1) {
        status = statuses[0];
      }
    }
    return {
      subEventTitle: d,
      subEventId: _.join(ids, ','),
      status: status
    };
  });
  return events;
};

const getSubEventsByDestination = (subs, rsvps) => {
  let destinations = _.groupBy(subs, 'subEventDestination');
  let events = _.map(destinations, (s, d) => {
    let ids = _.map(s, '_id');
    let statuses = _.map(ids, (id) => {
      let rsvp = _.find(rsvps, (r) => {
        return r.subEventId === id;
      });
      if (rsvp) {
        return rsvp.status;
      }
      else {
        return null;
      }
    });
    let status = null;
    if (statuses.length > 0) {
      let unique = !!statuses.reduce(function (a, b) { return (a === b) ? a : NaN; });
      if (typeof (unique) === "boolean") {
        status = statuses[0];
      }
    }
    return {
      subEventTitle: d,
      subEventId: _.join(ids, ','),
      status: status
    };
  });
  return events;
};
