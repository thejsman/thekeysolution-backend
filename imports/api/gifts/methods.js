// Time-stamp: 2017-07-29
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : methods.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { GiftSchema } from './schema.js';
import { GiftBookingSchema } from './schema.js';
import { Gifts } from './gifts.js';
import { Guests } from '../guests/guests.js';
import { GiftBookings } from './giftBooking.js';
import { Events } from '../events/events.js';
import { Roles } from 'meteor/meteor-roles';
import { insertActivity } from '../../api/activity_record/methods.js';
let isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId);
  console.log(scopes);
  if (scopes.length > 0) {
    for (var i = 0; i < scopes.length; i++) {
      if (Roles.userIsInRole(userId, role, scopes[i])) {
        return true;
      }
    }
    return false;
  }
  return Roles.userIsInRole(userId, role);
};
function getTotalGifts (giftId) {
  let total = 0;
  GiftBookings.find({giftId}).forEach(g => {
    total += g.giftNo;
  });;
  return total;
};

//code to insert data in Activity Record
function activityRecordInsert(data){
     var activityEvent=''
     var activityUserInfo={
        id:Meteor.userId(),
        name:Meteor.user().profile.name,
        email:Meteor.user().emails[0].address,
      }
      if(data.eventId==null || data.eventId=='' || data.eventId==undefined){
         activityEvent='general';
      }
      else{
         var event=Events.findOne(data.eventId);
         activityEvent=event.basicDetails.eventName;
      }
      var date = new Date();
      userdata={
        activityeDateTime:date, //date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'.'+date.getMilliseconds(),
        activityUserInfo:activityUserInfo,
        activityModule:data.activityModule,
        activitySubModule:data.activitySubModule,
        activityEvent:activityEvent,
        activityMessage:data.activityMessage,

      }
      insertActivity.call(userdata, (err, res) => {
      if(err) {
        console.log('Insert Activity record Error :: ',  err);
        return 0;
      }
      else {
        return true;
      }
    });
};

export const insertGift = new ValidatedMethod({
  name: "Gifts.methods.insert",
  validate: GiftSchema.validator( { clean: true }),
  run(giftNew) {
    var event = Events.findOne({
      _id: giftNew.eventId
    });

    giftNew.available = giftNew.giftQuantity;

    if(event) {
      Gifts.insert(giftNew);
    }
    else {
      throw new Meteor.Error("Event Id Invalid");
    }
  }
});

export const updateGift = new ValidatedMethod({
  name: "Gifts.methods.update",
  validate: GiftSchema.validator({ clean: true }),
  run(giftUpdate) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'edit-gifts')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    Gifts.update(giftUpdate.giftId, {
      $set: giftUpdate
    });
  }
});


export const deleteGift = new ValidatedMethod({
  name: "Gifts.methods.delete",
  validate: null,
  run(id) {
    // ABL_SAM added Permission Check
    if(!isAllowed(this.userId, 'delete-gifts')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }

    //code to insert data in Activity Record
    let gifts = Gifts.find({_id:id})
    let user = Meteor.user();

    GiftBookings.remove({ giftId: id });
    Gifts.remove(id);

    var activityInsertData={
      eventId:gifts.eventId,
      activityModule:'Guests',
      activitySubModule:'Gifts',
      event:'delete',
      activityMessage:'Gift is deleted. So Gifts Booking is deleted by '+user.profile.name + ', userId: '+user._id
    }
    activityRecordInsert(activityInsertData);

  }
});

export const deleteGiftBooking = new ValidatedMethod({
  name: "Gifts.booking.methods.delete",
  validate: null,
  run(bookingId) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'delete-gift-booking')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    let booking = GiftBookings.findOne(bookingId);
    if(booking) {
      Gifts.update(booking.giftId, {
  $inc: {
    bookedCount: -booking.giftNo
  }
      });

      //code for activity record
       let guests = Guests.findOne( booking.guestId );

          GiftBookings.remove(bookingId);

       activityInsertData={
          eventId:booking.eventId,
          activityModule:'Guests',
          activitySubModule:'Gifts',
          event:'delete',
          activityMessage:'Gift Booking is deleted by '+guests.guestTitle+' '+guests.guestFirstName+' '+guests.guestLastName+'.'
      }
      activityRecordInsert(activityInsertData);

    }
  }
});

export const updateGiftBooking = new ValidatedMethod({
  name: "Gifts.booking.method.update",
  validate: GiftBookingSchema.validator({ clean: true }),
  run(editBooking) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'edit-gift-booking')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    let gift = Gifts.findOne(editBooking.giftId);
    let bookings = GiftBookings.find({giftId: editBooking.giftId});
    let oldBooking = GiftBookings.findOne(editBooking.bookingId);

    let totalCount = 0;
    bookings.forEach(g => {
      totalCount += g.giftNo ? g.giftNo : 0;
    });
    let count = totalCount;

    if(gift.giftQuantity > count) {
      GiftBookings.update(editBooking.bookingId, {
  $set: editBooking
      });


      //code to insert data in Activity Record
       let guests = Guests.findOne( editBooking.guestId );

       activityInsertData={
          eventId:editBooking.eventId,
          activityModule:'Guests',
          activitySubModule:'Gifts',
          event:'update',
          activityMessage:'Gift is updated by '+guests.guestTitle+' '+guests.guestFirstName+' '+guests.guestLastName+'.'
      }
      activityRecordInsert(activityInsertData);

      if(gift) {
  let tC = 0;
  GiftBookings.find({giftId: editBooking.giftId}).forEach(g => {
    tC += g.giftNo ? g.giftNo : 0;
  });
  Gifts.update(editBooking.giftId, {
    $set: {
      bookedCount: tC
    }
  });
      }

      if(oldBooking.giftId !== editBooking.giftId) {
  let oldBookings = GiftBookings.find({giftId: oldBooking.giftId});
  let tC1 = 0;
  bookings.forEach(g => {
    tC1 += g.giftNo ? g.giftNo : 0;
  });
  Gifts.update(oldBooking.giftId, {
    $set: {
      bookedCount: tC1
    }
  });
      }
    }
    else {
      throw new Meteor.Error("Not enough gifts to assign");
    }

  }
});

export const bookGifts = new ValidatedMethod({
  name: "Gifts.methods.assign",
  validate: GiftBookingSchema.validator( { clean: true }),
  run(booking) {
    var eventId = booking.eventId;
    var giftId = booking.giftId;

    var event = Events.findOne({
      _id: eventId
    });

    var gifts = Gifts.findOne({
      _id: giftId
    });

    var guest = Guests.findOne({
      _id: booking.guestId
    });

    if(event && gifts && guest) {

      let count = getTotalGifts(giftId) + booking.giftNo;
      if(gifts.giftQuantity > count) {
  GiftBookings.insert(booking);
  Gifts.update(giftId, {
    $set: {
      bookedCount: count
    }
  });

      //code to insert data in Activity Record
       let guests = Guests.findOne( booking.guestId );

       activityInsertData={
          eventId:booking.eventId,
          activityModule:'Guests',
          activitySubModule:'Gifts',
          event:'add',
          activityMessage:'Gift is booked by '+guests.guestTitle+' '+guests.guestFirstName+' '+guests.guestLastName+'.'

      }
      activityRecordInsert(activityInsertData);



      }
      else {
  throw new Meteor.Error("Run out of gift inventory");
      }
    }
    else {
      throw new Meteor.Error("Invalid data");
    }
  }
});
