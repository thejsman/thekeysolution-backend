import { Template } from 'meteor/templating';
import { HotelRoomSchema } from '../../../../api/hotels/schema.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import './events_hotels_add_room.html';
import { addHotelRooms, updateHotelRoom, removeHotelRooms } from '../../../../api/hotels/methods.js';
import { Hotels } from '../../../../api/hotels/hotels.js';
// import { Rooms } from "../../../../api/hotels/rooms.js";
import './events_hotels_rooms.js';
import { ReactiveVar } from 'meteor/reactive-var';
import { Rooms } from '../../../../api/hotels/rooms.js';
import { Meteor } from 'meteor/meteor';
import chance from '../../../../extras/randomizer.js';
import _ from 'lodash';

let selectedRoomType = new ReactiveVar(null);
let editing = new ReactiveVar(false);
let editId = new ReactiveVar('');
let selects = ['hotelRoomIsSmoking', 'hotelRoomIsAdjoining', 'hotelRoomIsConnecting'];

const dbRoomsList = new ReactiveVar();

Template.events_hotels_add_room.onRendered(function () {
  this.subscribe("rooms.event", FlowRouter.getParam("id"));
  this.$('.tooltip-icon').tooltip({ delay: 50 });
  this.$('.tooltipped').tooltip({ delay: 50 });
  this.$('select').material_select();
  editing.set(false);
  let event = this.data.eventInfo;
  let defaultDate = event ? event.basicDetails.eventStart : undefined;
  this.$('.modal').modal({
    dismissible: true,
    opacity: .5,
    inDuration: 300,
    outDuration: 200,
    startingTop: '4%',
    endingTop: '10%'
  });
  this.$('.datepicker').pickadate({
    closeOnSelect: true,
    selectYears: 20,
    onStart: function () {
      this.set('select', defaultDate);
    }
  });

  this.autorun(() => {
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    }, 100);
  });
});

Template.events_hotels_add_room.helpers({
  hotelRoomDetails() {

    const r = Rooms.find({
      hotelId: FlowRouter.getParam("hotelId")
    }).fetch();
    dbRoomsList.set(r);
    return r;
  },

  selectedRoom() {
    return selectedRoomType;
  },

  title() {
    return editing.get() ? "Edit Room Type" : "Add Room Type";
  },

  roomDetails() {
    let ed = editing.get();
    if (ed) {
      let rooms = dbRoomsList.get();
      let room = _.find(rooms, r => { return r._id === editId.get(); });
      return room ? room : {};
    }
    else if (Meteor.settings.public.autoFillForm) {
      return {
        hotelRoomCategory: chance.word(),
        hotelRoomTotal: chance.natural({max: 100}),
        // hotelRoomMaxOccupants: chance.natural({ max: 10 }),
        // hotelRoomTotal: chance.natural({ max: 100 }),
        hotelRoomBedType: chance.word(),
        hotelRoomIsSmoking: chance.word(),
        hotelRoomIsAdjoining: chance.word(),
        hotelRoomIsConnecting: chance.word(),
        // hotelRoomFrom: chance.date({ string: true }),
        // hotelRoomTo: chance.date({ string: true }),
        hotelRoomRemarks: chance.sentence()
      };
    }
    return {};
  }
});

Template.events_hotels_add_room.events({
  'click .add-rooms-button'(event, template) {
    editing.set(false);
  },
  'submit #add-new-hotel-room'(event, template) {
    event.preventDefault();
    let jq = template.$(event.target);
    let data = jq.serializeObject();
    //data.hotelRoomIsSmoking = !!data.hotelRoomIsSmoking;
    data.hotelId = template.data.hotelInfo._id;
    data.eventId = template.data.eventInfo._id;
    let cleanedData = HotelRoomSchema.clean(data);
    let context = HotelRoomSchema.newContext();
    context.validate(cleanedData, { clean: true });
    let cbText = editing.get() ? "Updated Room" : "Added hotel rooms";
    let cb = (err, res) => {
      if (err) {
        showError(err);
      }
      else {
        showSuccess(cbText);
      }
      template.$('.modal').modal('close');
      jq[0].reset();
      editing.set(false);
    };
    if (context.isValid()) {
      if (editing.get()) {
        data.id = editId.get();
        updateHotelRoom.call(data, cb);
      }
      else {
        addHotelRooms.call(cleanedData, cb);
      }

    }
    else {
      console.log(context.validationErrors());
      showError(context.validationErrors()[0].toString());
    }
  }
});

Template.hotel_rooms_room_details.helpers({
  // reservedRooms(id) {
  //   console.log('-----------', id);
  //   return Rooms.find({ id }).count();
  // },
  smokingNew(smoking) {
    switch (smoking) {
      case 'true':
        return 'Smoking'
        break;
      case 'false':
        return 'Non-Smoking'
        break;
      default:
        return 'None'
    }
  },
  adjoining(adjoin) {
    switch (adjoin) {
      case 'true':
        return 'Adjoining';
        break;
      case 'false':
        return 'Non-adjoining';
        break;
      default:
        return 'None';
    }
  },
  connecting(connect) {
    switch (connect) {
      case 'true':
        return 'Connecting';
        break;
      case 'false':
        return 'Non-Connecting'
        break;
      default:
        return 'None';
    }
  }
});

Template.hotel_rooms_room_details.events({
  'click .reserve-button'(event, template) {
    selectedRoomType.set({
      room: template.data.room
    });
  },

  'click .edit-room-button'(event, template) {
    editing.set(true);
    editId.set(template.data.room._id);
    console.log(dbRoomsList.get(), 'ROOM DATA', template.data.room);
    selects.forEach(s => {
      $('#' + s).val(template.data.room[s]);
      $('#' + s).material_select();
    });
  },

  'click .delete-room-button'(event, template) {
    mbox.confirm('Delete this room', function (yes) {
      if (!yes) return;
      let room = template.data.room;
      removeHotelRooms.call(room, (err, res) => {
        if (err) {

        }
        else {
          showSuccess("Removed Room");
        }
      });
    });
  }
})
