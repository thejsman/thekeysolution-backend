import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ActivityRecords } from '../../../../api/activity_record/activity_record.js';
import { PwaActivityRecords } from '../../../../api/pwa_activity_record/activity_record.js';
import { getEventActivityCount } from '../../../../api/activity_record/methods.js';
import { getEventPwaActivityCount } from '../../../../api/pwa_activity_record/methods.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { activityPerPage } from '../../../../api/activity_record/activityPerPage.js';
import { pwaActivityPerPage } from '../../../../api/pwa_activity_record/activityPerPage.js';

let currentPage = new ReactiveVar(0);
let skipCount = new ReactiveVar(0);
let activityCount = new ReactiveVar({ total: 0 });
let eventActivitySearchModule = new ReactiveVar('');
let pwaCurrentPage = new ReactiveVar(0);
let pwaSkipCount = new ReactiveVar(0);
let pwaActivityCount = new ReactiveVar({ total: 0 });
let eventPwaActivitySearchModule = new ReactiveVar('');
let searchTerm = new ReactiveVar('');
let searchTerm2 = new ReactiveVar('');
let oldPage = 0;
let tempPage = -1;

import './event_activity_export.js';
import './events_activity.html';
import './events_activity.scss';
import './pwa_activity/event_pwa_activity_export.js';

Template.event_dashboard_activity_record.onRendered(function () {
  skipCount.set(0);
  currentPage.set(0);
  pwaSkipCount.set(0);
  pwaCurrentPage.set(0);
  eventActivitySearchModule.set('');
  eventPwaActivitySearchModule.set('');
  searchTerm.set('');
  searchTerm2.set('');
  var eventId = FlowRouter.getParam('id');
  var lookupObject = {
    'activityEventId': FlowRouter.getParam('id')
  }
  eventActivitySearchModule.set(lookupObject);
  eventPwaActivitySearchModule.set(lookupObject);
  getEventActivityCount.call(eventId, (err, res) => {
    activityCount.set(res);
  });
  getEventPwaActivityCount.call(eventId, (err, res) => {
    pwaActivityCount.set(res);
  });

  this.autorun(() => {
    let eventId = FlowRouter.getParam('id');
    this.subscribe('activity.event', eventId, skipCount.get(), searchTerm.get().trim());
    this.subscribe('pwa.activity.search', eventId, pwaSkipCount.get(), searchTerm2.get().trim());
    Meteor.setTimeout(() => {
      this.$('.datepicker').pickadate({
        dateFormat: 'yy-m-d',
        closeOnSelect: true,
        selectYears: 1000,
        selectMonths: true,
      });
    }, 200);
  });
});

Template.event_pwa_activity_record.onRendered(function () {
  $('.tabs').tabs();
  searchTerm2.set('');
  skipCount.set(0);
  currentPage.set(0);
  pwaSkipCount.set(0);
  pwaCurrentPage.set(0);
  eventActivitySearchModule.set('');
  eventPwaActivitySearchModule.set('');
  var eventId = FlowRouter.getParam('id');
  var lookupObject = {
    'activityEventId': FlowRouter.getParam('id')
  }
  eventActivitySearchModule.set(lookupObject);
  eventPwaActivitySearchModule.set(lookupObject);
  getEventActivityCount.call(eventId, (err, res) => {
    activityCount.set(res);
  });
  getEventPwaActivityCount.call(eventId, (err, res) => {
    pwaActivityCount.set(res);
  });
  this.autorun(() => {
    let eventId = FlowRouter.getParam('id');
    this.subscribe('activity.event', eventId, skipCount.get(), searchTerm.get().trim());
    this.subscribe('pwa.activity.search', eventId, pwaSkipCount.get(), searchTerm2.get().trim());
  });

  this.autorun(() => {
    Meteor.setTimeout(() => {
      this.$('.datepicker').pickadate({
        dateFormat: 'yy-m-d',
        closeOnSelect: true,
        selectYears: 1000,
        selectMonths: true,
      });
    }, 200);
  });
});

Template.event_dashboard_activity_record.helpers({
  hasEventActivity() {
    return ActivityRecords.find().count() > 0;
  },
  eventActivityList() {
    var lookupObject = {
      'activityEventId': FlowRouter.getParam('id')
    }
    return ActivityRecords.find(lookupObject, {
      sort: { activityeDateTime: -1 }
    });
  },
  totalEventActivity() {
    var lookupObject = {
      'activityEventId': FlowRouter.getParam('id')
    }
    return ActivityRecords.find(lookupObject).count();  //getLookupObjectOpen()
  },

  getEventActivityCount() {
    return activityCount.get().total;
  },

  getEventPagination() {
    let totalActivity = activityCount.get().total;
    if (searchTerm.get() !== '') {
      totalActivity = ActivityRecords.find({}).count();
    }
    let pages = Math.floor(totalActivity / activityPerPage) + 1;

    let pageList = [];
    for (var i = 0; i < pages; i++) {
      pageList.push({
        pageNo: i,
        isActive: currentPage.get() === i ? "active" : ""
      })
    }
    return pageList;
  }
});

Template.event_pwa_activity_record.helpers({
  hasEventPwaActivity() {
    return PwaActivityRecords.find().count() > 0;
  },
  eventPwaActivityList() {
    var lookupObject = {
      'activityEventId': FlowRouter.getParam('id')
    }
    // console.log('pwa activity list', PwaActivityRecords.find(lookupObject, {
    //   sort: { activityeDateTime: -1 }
    // }));
    return PwaActivityRecords.find(lookupObject, {
      sort: { activityeDateTime: -1 }
    });
  },

  totalEventPwaActivity() {
    var lookupObject = {
      'activityEventId': FlowRouter.getParam('id')
    }
    return PwaActivityRecords.find(lookupObject).count();  //getLookupObjectOpen()
  },
  getEventPwaActivityCount() {
    return pwaActivityCount.get().total;
  },

  getEventPwaPagination() {
    let totalActivity = pwaActivityCount.get().total;
    if (searchTerm2.get() !== '') {
      totalActivity = PwaActivityRecords.find({}).count();
    }
    let pages = Math.floor(totalActivity / pwaActivityPerPage) + 1;

    let pageList = [];
    for (var i = 0; i < pages; i++) {
      pageList.push({
        pageNo: i,
        isActive: pwaCurrentPage.get() === i ? "active" : ""
      })
    }
    return pageList;
  },
});

Template.event_dashboard_activity_record.events({
  'click #db-activity-export-btn'(){
    let xxx = searchTerm.get();
    console.log('export data ::: ', xxx);
    $('#event-activity-export-modal').attr('searchdata', xxx);
  },

  'click .event-page-no'(event, template) {
    let count = parseInt(event.target.id);
    currentPage.set(count);
    skipCount.set(count * activityPerPage);
  },

  'click #event-page-minus'(event, template) {
    let cP = currentPage.get();
    if (cP > 0) {
      let final = cP - 1;
      currentPage.set(final);
      skipCount.set(final * activityPerPage);
    }
  },

  'keyup #search-activity'(event, template)  {
    searchTerm.set(template.$('#search-activity').val());

    if (searchTerm.get() !== '') {
      if (tempPage == -1) {
        oldPage = skipCount.get();
        skipCount.set(0);
      }
      tempPage = 1;
    }
    else {
      skipCount.set(oldPage);
      tempPage = -1;
    }
  }
});

Template.event_pwa_activity_record.events({
  'click #pwa-activity-export-btn'(){
    let xxx = searchTerm2.get();
    console.log('export data ::: ', xxx);
    $('#event-pwa-activity-export-modal').attr('searchdata', xxx);
  },

  'click .event-pwa-page-no'(event, template) {
    let count = parseInt(event.target.id);
    pwaCurrentPage.set(count);
    pwaSkipCount.set(count * pwaActivityPerPage);
    console.log('current page ::: ',pwaCurrentPage.get())
  },

  'click #event-pwa-page-minus'(event, template) {
    let cP = pwaCurrentPage.get();
    if (cP > 0) {
      let final = cP - 1;
      pwaCurrentPage.set(final);
      pwaSkipCount.set(final * pwaActivityPerPage);
    }
  },

  'click #event-pwa-page-plus'(event, template) {
    let cP = pwaCurrentPage.get();
    let totalActivity = pwaActivityCount.get().total;
    let pages = 0;
    if ((totalActivity % pwaActivityPerPage) == 0) {
      pages = Math.floor(totalActivity / pwaActivityPerPage);
    }
    else {
      pages = Math.floor(totalActivity / pwaActivityPerPage) + 1;
    }
    if ((cP + 1) < pages) {
      let final = cP + 1;
      pwaCurrentPage.set(final);
      pwaSkipCount.set(final * pwaActivityPerPage)
    }
  },
  'keyup #search-activity-pwa'(event, template)  {
    searchTerm2.set(template.$('#search-activity-pwa').val());
    // console.log("Search Term :::: ", searchTerm2.get());

    if(searchTerm2.get() !== '') {
      if(tempPage == -1) {
        oldPage = skipCount.get();
        skipCount.set(0);
      }
      tempPage = 1;
    }
    else {
      skipCount.set(oldPage);
      tempPage = -1;
    }
  },
});

Template.event_activity_details_item.helpers({
  PageNumbers(index) {
    return (skipCount.get() + index + 1);
  }
})
Template.event_pwa_activity_details_item.helpers({
  PageNumbers(index) {
    return (pwaSkipCount.get() + index + 1);
  }
})