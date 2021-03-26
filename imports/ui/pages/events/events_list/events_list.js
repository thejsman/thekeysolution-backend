// Time-stamp: 2017-08-21
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_list.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Events } from '../../../../api/events/events.js';
import { ReactiveVar } from 'meteor/reactive-var';
import { Agencies } from '../../../../api/agencies/agencies.js';

import './events_list.scss';
import './events_list.html';

let eventSearchName = new ReactiveVar('');
let eventSearchStatus = new ReactiveVar([]);
let eventSearchType = new ReactiveVar([]);
let eventSearchLocation = new ReactiveVar([]);

Template.events_list.onRendered(function() {
  let sub = this.subscribe('events.all');
  this.$('select').material_select();
  eventSearchName.set('');
  eventSearchStatus.set([]);
  eventSearchType.set([]);
  eventSearchLocation.set([]);
});

let getLookupObjectOpen = () => {

  let lookupObject = {
    'basicDetails.isEventClose': false
  };

  let agency = FlowRouter.getQueryParam("agency");

  if(agency) {
    lookupObject = {
      ...lookupObject,
      'basicDetails.agency': agency
    };
  }

  let appRequested = FlowRouter.getQueryParam("appRequested");

  if(appRequested) {
    lookupObject = {
      ...lookupObject,
      appRequested: true
    };
  }


  let searchName = eventSearchName.get();
  if(searchName.length > 0) {
    lookupObject = {
      ...lookupObject,
      'basicDetails.eventName': new RegExp('^'+searchName+'.*', "i")
    }
  }

  let searchStatus = eventSearchStatus.get();
  if(searchStatus.length > 0) {
    // console.log(searchStatus.map);

    if(searchStatus.indexOf("closed") > -1) {
      lookupObject = {
	...lookupObject,
	'basicDetails.isEventClose': ''
      };
    }
    if(searchStatus.indexOf('active') > -1) {
      lookupObject = {
	...lookupObject,
	'basicDetails.isEventClose': false
      };
    }
  }

  let searchType = eventSearchType.get();
  if(searchType.length > 0) {
    lookupObject = {
      ...lookupObject,
      'basicDetails.eventType': {
	$in: searchType
      }
    };
  }

  let searchLocation = eventSearchLocation.get();
  if(searchLocation.length > 0) {
    let status = searchLocation.map(s => {
      if(s === "domestic") return false;
      else return true;
    });

    lookupObject = {
      ...lookupObject,
      'basicDetails.eventLocationType': {
	$in: status
      }
    };
  }

  return lookupObject;
};

let getLookupObjectClosed = () => {
  let lookupObject = {
    'basicDetails.isEventClose': true
  };

  let agency = FlowRouter.getQueryParam("agency");

  if(agency) {
    lookupObject = {
      ...lookupObject,
      'basicDetails.agency': agency
    };
  }

  let searchName = eventSearchName.get();
  if(searchName.length > 0) {
    lookupObject = {
      ...lookupObject,
      'basicDetails.eventName': new RegExp('^'+searchName+'.*', "i")
    }
  }

  let searchStatus = eventSearchStatus.get();
  if(searchStatus.length > 0) {
    // console.log(searchStatus.map);

    if(searchStatus.indexOf("closed") > -1) {
      lookupObject = {
	...lookupObject,
	'basicDetails.isEventClose': true
      };
    }
    if(searchStatus.indexOf('active') > -1) {
      lookupObject = {
	...lookupObject,
	'basicDetails.isEventClose': ''
      };
    }
  }

  let searchType = eventSearchType.get();
  if(searchType.length > 0) {
    lookupObject = {
      ...lookupObject,
      'basicDetails.eventType': {
	$in: searchType
      }
    };
  }

  let searchLocation = eventSearchLocation.get();
  if(searchLocation.length > 0) {
    let status = searchLocation.map(s => {
      if(s === "domestic") return false;
      else return true;
    });

    lookupObject = {
      ...lookupObject,
      'basicDetails.eventLocationType': {
	$in: status
      }
    };
  }

  return lookupObject;
};

Template.events_list.helpers({
  eventsList() {
    let lookupObject = getLookupObjectOpen();
    return Events.find(lookupObject, {
      sort: { createdAt: -1 }
    });
  },

  agencyName() {
    let agencyId = FlowRouter.getQueryParam("agency");
    if(agencyId) {
      let agency = Agencies.findOne(agencyId);
      return agency ? "of "+agency.name : "";
    }
    return "";
  },

  totalEvents(){
    return Events.find(getLookupObjectOpen()).count();
  },
  totalClosedEvents(){
    return Events.find(getLookupObjectClosed()).count();
  },
  closedeventsList(){
    let lookupObject = getLookupObjectClosed();
    return Events.find(lookupObject, {
      sort: { createdAt: -1 }
    });
  }
});

Template.event_data_card.helpers({
  appRequested() {
    return !!this.appRequested;
  }
});

Template.event_data_card.events({
  'click'(event, template) {
    FlowRouter.go('events.summary', { id: template.data._id });
  }
});

Template.events_list.events({
  'click .click_add-event-button'(event, template) {
    FlowRouter.go('events.add');
  },

  'input #search_event_list'(event, template) {
    eventSearchName.set(event.target.value);
  },

  'change #event-option'(event, template) {
    eventSearchStatus.set(template.$(event.target).val());
  },

  'change #event-type'(event, template) {
    eventSearchType.set(template.$(event.target).val());
  },

  'change #event-location'(event, template) {
    eventSearchLocation.set(template.$(event.target).val());
  }
});
