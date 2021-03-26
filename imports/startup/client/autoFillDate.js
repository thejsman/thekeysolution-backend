// Time-stamp: 2017-06-16
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : autoFill.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Events } from '../../../../api/events/events.js';
import { Guests } from '../../../../api/guests/guests.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Random } from 'meteor/random';
var autoFill = false;
if(Meteor.settings.public) {
  autoFill = Meteor.settings.public.autoFillForm;
}

Template.registerHelper('autoFillPersonName', () => {
   this.subscribe('events.one', FlowRouter.getParam("id"));
   // this.subscribe('guests.event', FlowRouter.getParam("id"));

  if(autoFill === true) {
    var names = ['RAFAEL', 'LEONARDO', 'MICHAEL', 'DONATELLO', 'SPLINTER', 'APRIL','SHREDDER','VENUS','CASEY','SLASH'];
    return names[Math.floor(Math.random() * names.length)];
  }
});



function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
