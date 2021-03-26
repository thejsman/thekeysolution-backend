// Time-stamp: 2017-08-29
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_gifts.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Gifts } from '../../../../api/gifts/gifts.js';
import { ReactiveVar } from 'meteor/reactive-var';
import './events_gifts.html';
import './events_gifts.scss';
import './events_gifts_add.html';
import {  updateGift,deleteGift, insertGift } from '../../../../api/gifts/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import chance from './../../../../extras/randomizer.js';


var editing = new ReactiveVar(false);
var editId = new ReactiveVar();
var editeventId = new ReactiveVar();


Template.events_gifts.onRendered(function() {
  this.subscribe('gifts.event', FlowRouter.getParam("id"));
  this.$('.tooltip-icon').tooltip({ delay: 50 });
  editing.set(false);
});

Template.events_gifts.helpers({
  giftList() {
    return Gifts.find();
  }
});

Template.events_gifts.events({
  'click #add-gift-button'(event, template) {
    editing.set(false);
  }
});

Template.gift_card.helpers({
  giftsAvailable() {
    console.log(this.gift);
    let booked = this.gift.bookedCount ? this.gift.bookedCount : 0;
    return this.gift.giftQuantity - booked;
  }
});

Template.gift_card.events({
  'click #edit-gift'(event, template) {
    editing.set(true);
    editId.set(template.data.gift._id);    
  },

  'click #delete-gift'(event, template) {
    mbox.confirm('This cannot be undone', function(yes) {
      if (yes) {
	deleteGift.call(template.data.gift._id, (err, res) => {
	  if(err) {
	    showError(err);
	  }
	  else {
	    showSuccess("Gift deleted");
	  }
	});	
      }
    });
  }
});


Template.events_gifts_add.onRendered(function() {
  this.$('.modal').modal();
  this.autorun(() => {
    let ed = editing.get();
    let edId = editId.get();
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    },100);
  });
});

Template.events_gifts_add.helpers({
  title() {
    return editing.get() ? "Edit Gift" : "Add Gift";
  },

  giftInfo() {
    let isEdit = editing.get();
    if(isEdit) {
      return Gifts.findOne(editId.get());
    }
    else if(Meteor.settings.public.autoFillForm) {
      return {
	giftName: chance.name(),
	giftQuantity: chance.natural({ min: 1, max: 40 })
      };
    }
    return {};
  }
});

Template.events_gifts_add.events({
  'submit #add-new-gift'(event, template) {
    event.preventDefault();
    let form = template.$(event.target);
    let data = form.serializeObject();
    data.eventId = FlowRouter.getParam('id');
    
    let ed = editing.get();
    let cbText = ed ? "Gift updated" : "Gift added";
    let cb = (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess(cbText);
	template.$('.modal').modal('close');
	form[0].reset();
      }
    };
    if(ed) {
      data.giftId = editId.get();
      updateGift.call(data, cb);
    }
    else {
      insertGift.call(data, cb);
    }    
  }
});
