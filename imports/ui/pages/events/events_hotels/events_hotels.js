// Time-stamp: 2017-08-27
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_hotels.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { FlowRouter } from "meteor/kadira:flow-router";
import { downloadGuestExcel } from "../../../../api/guests/methods";
import XLSX from "xlsx";
import FileSaver from "file-saver";
import { Hotels } from "../../../../api/hotels/hotels.js";
import { Rooms } from "../../../../api/hotels/rooms.js";
import { HotelBookings } from "../../../../api/hotels/hotelBookings";
import { Guests } from "../../../../api/guests/guests.js";
import { mbox } from "../../../components/mbox/mbox.js";

import {
  bookRoom,
  clearBookingData,
  removeHotel,
  insertHotel,
  addHotelRooms
} from "../../../../api/hotels/methods.js";

import {
  showError,
  showSuccess
} from "../../../components/notifs/notifications.js";

import _ from "lodash";
import "./events_hotels.scss";
import "./events_hotels.html";

let isLoading = new ReactiveVar(false);
let dbHotelList = new ReactiveVar();
const dbRoomsList = new ReactiveVar();
const guestList = new ReactiveVar();

Template.events_hotels.onCreated(function() {
  this.subscribe("hotels.all", FlowRouter.getParam("id"));
  this.subscribe("rooms.event", FlowRouter.getParam("id"));
  this.subscribe("guests.all", FlowRouter.getParam("id"));
});
Template.events_hotels.onDestroyed(function() {
  Object.keys(Template.instance()._subscriptionHandles).forEach(key => {
    Template.instance()._subscriptionHandles[key].stop();
  });
});

Template.events_hotels.onRendered(function() {});

Template.events_hotels.helpers({
  hotelAddPath() {
    if (!Template.instance().subscriptionsReady()) {
      return null;
    }
    return FlowRouter.path("events.hotel.add", {
      id: FlowRouter.getParam("id")
    });
  },

  hotelList() {
    if (!Template.instance().subscriptionsReady()) {
      return null;
    }
    const r = Rooms.find({
      eventId: FlowRouter.getParam("id")
    }).fetch();
    dbRoomsList.set(r);

    const g = Guests.find({ eventId: FlowRouter.getParam("id") }).fetch();
    guestList.set(g);

    const h = Hotels.find({
      hide: {
        $ne: true
      }
    }).fetch();
    dbHotelList.set(h);
    return h;
  },

  loading() {
    if (!Template.instance().subscriptionsReady()) {
      return false;
    }
    return isLoading.get();
  }
});

Template.events_hotels.events({
  "click #bulkUploadHotels"(event) {
    event.preventDefault();
    $("#bulkDownloadSection")
      .toggleClass("hide")
      .addClass("scale-in");
  },
  "click #download-hotel-upload-sample"(event) {
    event.preventDefault();

    var extraInfo = {
      hotel_bulk_upload: true
    };
    const eventId = FlowRouter.getParam("id");
    downloadGuestExcel.call({ eventId, extraInfo }, (err, wb) => {
      if (!wb) {
        return;
      }
      var wopts = { bookType: "xlsx", bookSST: false, type: "binary" };
      var wbout = XLSX.write(wb, wopts);
      FileSaver.saveAs(
        new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
        `GuestHotelsUpload-${eventId}.xlsx`
      );
    });
  },
  async "change #bulkUpload"(event, template) {
    isLoading.set(true);

    const eventId = FlowRouter.getParam("id");
    const file = event.currentTarget.files[0];
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const data = e.target.result;
        const wb = XLSX.read(data, { type: "binary" });
        const bookingdata = XLSX.utils.sheet_to_json(wb.Sheets.Sheet1);
        let hotelRoomMapping = mapDBHotelIds(
          eventId,
          bookingdata,
          dbHotelList.get()
        );

        await Promise.all(
          [
            ...new Set(
              hotelRoomMapping
                .filter(({ systemHotel }) => !systemHotel)
                .map(hotel => hotel.hotelName)
            )
          ].map(hotelName => {
            return insertHotel.call({
              hotelName,
              eventId
            });
          })
        );

        // wait for subscription to refetch hotels data to generate new mapping with newly inserted hotels as well
        setTimeout(async () => {
          hotelRoomMapping = await mapDBHotelIds(
            eventId,
            bookingdata,
            dbHotelList.get()
          );
          let roomMappingData = await mapDBRoomId(
            hotelRoomMapping,
            dbRoomsList.get()
          );
          roomMappingData = await insertRoomsForHotels(roomMappingData);

          await clearBookingData.call(eventId);
          await bookRoomForGuests(roomMappingData);
          showSuccess("Hotel Rooms booked successfully");
          $("#bulkDownloadSection").toggleClass("hide");
          isLoading.set(false);
        }, 0);
      } catch (err) {
        showError(err);
      }
    };
    reader.onerror = err => {
      showError(err);
    };
    reader.readAsBinaryString(file);
  }
});

Template.hotel_card.onCreated(function() {
  this.hotelId = new ReactiveVar("");
  this.autorun(() => {
    const hotelId = this.data.hotel._id;
    this.subscribe("hotel.bookedRooms.byHotelId", hotelId);
    this.subscribe("hotel.rooms.byHotelId", hotelId);
    this.hotelId.set(hotelId);
  });
});
Template.hotel_card.onDestroyed(function() {
  Object.keys(Template.instance()._subscriptionHandles).forEach(key => {
    Template.instance()._subscriptionHandles[key].stop();
  });
});

Template.hotel_card.onRendered(function() {});

Template.hotel_card.helpers({
  roomsCountData() {
    const hotelId = Template.instance().hotelId.get();
    if (!hotelId || !Template.instance().subscriptionsReady()) {
      return {
        reserved: 0,
        occupied: 0
      };
    }
    const bookings = HotelBookings.find({ hotelId }).fetch();
    const reservedRooms = bookings.length
      ? [...new Set([...bookings.map(r => r.placeHolderRoomNumber)])].length
      : 0;
    const bookedRooms = bookings.length
      ? [
          ...new Set([
            ...bookings.filter(r => r.guestId).map(r => r.placeHolderRoomNumber)
          ])
        ].length
      : 0;

    return {
      reserved: reservedRooms - bookedRooms,
      occupied: bookedRooms
    };
  },
  totalRooms() {
    const hotelId = Template.instance().hotelId.get();
    if (!hotelId || !Template.instance().subscriptionsReady()) {
      return 0;
    }
    const rooms = Rooms.find({ hotelId }).fetch();
    const totalRooms = rooms.reduce((acc, r) => acc + r.hotelRoomTotal, 0);
    return totalRooms;
  }
});

Template.hotel_card.events({
  "click .click_edit_btn"(event, template) {
    FlowRouter.go("events.hotel.info", {
      id: FlowRouter.getParam("id"),
      hotelId: template.data.hotel._id
    });
  },

  "click .click_delete_btn"(event, template) {
    event.stopPropagation();
    mbox.confirm("Are you sure you want to delete this?", yes => {
      if (yes) {
        removeHotel.call(template.data.hotel._id, (err, res) => {});
      }
    });
  }
});

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

function mapDBHotelIds(eventId, data, availableHotels) {
  return data.map(data => {
    const hotel = availableHotels.find(h => {
      return (
        `${h.hotelName.toLowerCase().trim()}${
          h.hotelAddress ? h.hotelAddress.toLowerCase().trim() : ""
        }` ===
        `${data["Hotel Name"].toLowerCase().trim()}${
          data["Hotel Address"]
            ? data["Hotel Address"].toLowerCase().trim()
            : ""
        }`
      );
    });

    return {
      ...data,
      eventId,
      hotelName: data["Hotel Name"].trim(),
      hotelAddress: data["Hotel Address"],
      systemHotel: hotel
    };
  });
}

async function mapDBRoomId(data, systemRooms) {
  return [
    ...data.map(({ systemHotel, systemRoom, ...d }) => {
      let room = systemRoom;

      if (!systemRoom) {
        const xlsKey = `${systemHotel._id}${d["Room Category Type"]
          .toLowerCase()
          .trim()}${d["Bed Type"].toLowerCase().trim()}`;

        room = systemRooms.find(sd => {
          const dbKey = `${
            sd.hotelId
          }${sd.hotelRoomCategory
            .toLowerCase()
            .trim()}${sd.hotelRoomBedType.toLowerCase().trim()}`;
          return xlsKey === dbKey;
        });
      }

      return { systemHotel, systemRoom: room, ...d };
    })
  ];
}

async function insertRoomsForHotels(data) {
  // Filter non available rooms from list
  const roomsObj = {};
  data
    .filter(({ systemRoom }) => !systemRoom)
    .forEach(({ systemHotel, ...rest }) => {
      roomsObj[
        `${systemHotel._id}${systemHotel.hotelName.toLowerCase().trim()}${rest[
          "Room Category Type"
        ].toLowerCase()}${rest["Bed Type"].toLowerCase().trim()}`
      ] = {
        eventId: rest.eventId,
        hotelId: systemHotel._id,
        hotelRoomBedType: rest["Bed Type"].trim(),
        hotelRoomCategory: rest["Room Category Type"].trim()
      };
    });

  const newRooms = await Promise.all(
    [...new Set(Object.keys(roomsObj))].map(key => {
      const _id = addHotelRooms.call({ ...roomsObj[key] });
      return { ...roomsObj[key], _id };
    })
  );

  return await mapDBRoomId(data, newRooms);
}

async function bookRoomForGuests(data) {
  const roomList = data.map(({ systemHotel, systemRoom, ...d }) => {
    const guest = guestList
      .get()
      .find(guest => guest.folioNumber == d["Folio No"]);
    return {
      eventId: d.eventId,
      hotelId: systemHotel._id,
      roomId: systemRoom._id,
      guestId: guest ? guest._id : null,
      placeHolderRoomNumber: d["Placeholder Room Number"],
      roomNumber: d["Display Room Number"],
      hotelRoomFrom: new Date(d["Check-in Date"].trim()),
      hotelRoomTo: new Date(d["Check-out Date"].trim())
    };
  });

  return await Promise.all(
    roomList.map(room => {
      return bookRoom.call({
        ...room
      });
    })
  );
}
