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
import { Random } from 'meteor/random';
import chance from '../../extras/randomizer.js';
var autoFill = false;
if(Meteor.settings.public) {
  autoFill = Meteor.settings.public.autoFillForm;
}

Template.registerHelper('autoFillPersonName', () => {
  if(autoFill === true) {
    return chance.name();
  }
});

Template.registerHelper('autoFillContact', () => {
  if(autoFill === true) {
    return chance.phone({ formatted: false });
  }
});

Template.registerHelper('autoFillName', () => {
  if(autoFill === true) {
    return chance.name();
  }
});

Template.registerHelper('autoFillString', () => {
  if(autoFill === true) {
    return chance.word();
  }
});

Template.registerHelper('autoFillDate', () => {
  if(autoFill === true) {
    return chance.date({string: true, american: false});
  }  
});

Template.registerHelper('autoFillEmail', () => {
  if(autoFill === true) {
    return chance.email();
  }
});

Template.registerHelper('autoFillInteger', () => {
  if(autoFill === true) {
    return chance.natural({ min: 1, max: 20});
  }
});

Template.registerHelper('autoFillTime', () => {
  if(autoFill === true) {
    return  chance.hour({twentyfour: true}) + ":" + chance.minute();
  }
});

Template.registerHelper('autoFillDateTime', () => {
  if(autoFill === true) {
    return chance.date();
  }
});

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
