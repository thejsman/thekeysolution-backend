import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { FlowRouter } from "meteor/kadira:flow-router";
import { ReactiveVar } from "meteor/reactive-var";

import _ from "lodash";
import moment from 'moment';

import { Hotels } from "../../../../../api/hotels/hotels.js";
import { HotelBookings } from "../../../../../api/hotels/hotelBookings.js";
import {
  unbookRoom,
  updateRoomBooking
} from "../../../../../api/hotels/methods.js";
import {
  showError,
  showSuccess
} from "../../../../components/notifs/notifications.js";
import "./events_guests_hotel_bookings.html";
import "./events_guests_bookings.scss";
import "../../events_hotels/events_hotel_update_room.js";
import "../../events_hotels/events_hotel_udpate_room_remarks.js";
import { Rooms } from "../../../../../api/hotels/rooms.js";
import { Guests } from "../../../../../api/guests/guests.js";
import { fetchGuestList } from "../../../../../api/guests/methods";

import "../../events_flights/search.scss";
const Fuse = require("fuse.js");

var currentHotel = new ReactiveVar();
var currentRoomCategory = new ReactiveVar();
var editModal = null;
let hotelRooms = new ReactiveVar([]);

Template.agency_guest_hotel_add.onRendered(function() {
  this.autorun(() => {
    let roomCategoryId = currentRoomCategory.get();
    Meteor.setTimeout(() => {
      this.$("select").material_select();
    }, 1000);
    this.subscribe("hotels.bookedRooms.all", roomCategoryId);
    this.subscribe("rooms.event", FlowRouter.getParam("id"));
  });
  this.autorun(() => {
    Meteor.setTimeout(() => {
      this.$("select").material_select();
    }, 100);
  });
  this.$(".modal").modal();
  let airlinel = [];
  fetchGuestList.call(FlowRouter.getParam("id"), (err, res) => {
    if (err) console.log(err);
    else {
      res.map(a => {
        airlinel.push(a);
      });
    }
  });
  this.autorun(() => {
    let optionsF = {
      shouldSort: true,
      threshold: 0.4,
      maxPatternLength: 32,
      keys: [
        {
          name: "guestFirstName",
          weight: 0.5
        },
        {
          name: "guestLastName",
          weight: 0.4
        },
        {
          name: "folioNumber",
          weight: 0.1
        }
      ]
    };

    let fuse = new Fuse(airlinel, optionsF);

    var ac = this.$("#autocomplete2")
      .on("click", function(e) {
        e.stopPropagation();
      })
      .on("focus keyup", search)
      .on("keydown", onKeyDown);

    let acval = this.$(".value-for-db-airline");
    let airlineCodeForSearch = this.$("#airlineCode");

    var wrap = $("<div>")
      .addClass("autocomplete-wrapper")
      .insertBefore(ac)
      .append(ac);

    var list = $("<div>")
      .addClass("autocomplete-results")
      .on("click", ".autocomplete-result", function(e) {
        e.preventDefault();
        e.stopPropagation();
        selectIndex($(this).data("index"));
      })
      .appendTo(wrap);

    this.$(document)
      .on("mouseover", ".autocomplete-result", function(e) {
        var index = parseInt($(this).data("index"), 10);
        if (!isNaN(index)) {
          list.attr("data-highlight", index);
        }
      })
      .on("click", clearResults);

    function clearResults() {
      results = [];
      numResults = 0;
      list.empty();
    }

    function selectIndex(index) {
      if (results.length >= index + 1) {
        ac.val("");
        acval.val(results[index]._id);
        $("#selected-member").append(
          '<p class="col s4"> <input type="checkbox" name="selectedPeople[]" value="' +
            results[index]._id +
            '" id="family{{' +
            results[index]._id +
            '}}" />' +
            '<label for="family{{' +
            results[index]._id +
            '}}">' +
            results[index].guestFirstName +
            " " +
            results[index].guestLastName +
            "</label>" +
            "</p>"
        );
        clearResults();
      }
    }

    var results = [];
    var numResults = 0;
    var selectedIndex = -1;

    function search(e) {
      if (e.which === 38 || e.which === 13 || e.which === 40) {
        return;
      }

      if (ac.val().length > 0) {
        results = _.take(fuse.search(ac.val()), 5);
        numResults = results.length;
        var divs = results.map(function(r, i) {
          return (
            '<div class="autocomplete-result" data-index="' +
            i +
            '">' +
            "<div><b>" +
            r.guestFirstName +
            "</b> " +
            r.guestLastName +
            "</div>" +
            '<div class="autocomplete-location">' +
            "Folio No : " +
            r.folioNumber +
            "</div>" +
            "</div>"
          );
        });

        selectedIndex = -1;
        list.html(divs.join("")).attr("data-highlight", selectedIndex);
      } else {
        numResults = 0;
        list.empty();
      }
    }

    function onKeyDown(e) {
      switch (e.which) {
        case 38:
          selectedIndex--;
          if (selectedIndex <= -1) {
            selectedIndex = -1;
          }
          list.attr("data-highlight", selectedIndex);
          break;
        case 13:
          selectIndex(selectedIndex);
          break;
        case 9:
          selectIndex(selectedIndex);
          e.stopPropagation();
          return;
        case 40:
          selectedIndex++;
          if (selectedIndex >= numResults) {
            selectedIndex = numResults - 1;
          }
          list.attr("data-highlight", selectedIndex);
          break;

        default:
          return;
      }
      e.stopPropagation();
      e.preventDefault();
    }
  });
});

Template.agency_guest_hotel_add.helpers({
  hotelList() {
    var hotels = Hotels.find();
    return hotels;
  },

  roomCategories() {
    let hotelId = currentHotel.get();
    if (hotelId) {
      const rooms = Rooms.find({
        hotelId
      }).fetch();
      hotelRooms.set(rooms);
      return rooms.map(item => ({ ...item }));
    } else {
      hotelRooms.set([]);
      return [];
    }
  },

  rooms() {
    const roomCategoryId = currentRoomCategory.get();
    if (!roomCategoryId) {
      return [];
    }
    const bookedRooms = HotelBookings.find({ roomId: roomCategoryId }).fetch();
    const filteredData = bookedRooms.reduce(
      (acc, { guestId, placeHolderRoomNumber }) => {
        acc[placeHolderRoomNumber] = {
          people:
            (acc[placeHolderRoomNumber]
              ? acc[placeHolderRoomNumber].people
              : 0) + (guestId ? 1 : 0),
          guestId: guestId
        };
        return acc;
      },
      {}
    );

    return Object.keys(filteredData).map(key => ({
      roomNumber: key,
      people: filteredData[key].people,
      guestId: filteredData[key].guestId
    }));
  },

  spaceLeft(room) {
    if (room.assignedTo && room.assignedTo.length > 0) {
      return room.capacity - room.assignedTo.length;
    } else {
      return room.capacity;
    }
  },

  familyMembers() {
    return Guests.find();
  },

  canBookRoom() {
    let bookings = HotelBookings.find().map(b => b.guestId);
    return (
      Guests.find({
        _id: {
          $nin: bookings
        }
      }).count() > 0
    );
  },
  bookSmoking(smoking) {
    switch (smoking) {
      case "true":
        return "Smoking Room";
        break;
      case "false":
        return "Non-Smoking Room";
        break;
      default:
        return "Smoking: None";
    }
  },
  bookAdjoining(adjoin) {
    switch (adjoin) {
      case "true":
        return "Adjoining Room";
        break;
      case "false":
        return "Non-Adjoining Room";
        break;
      default:
        return "Adjoining: None";
    }
  },
  bookConnecting(connect) {
    switch (connect) {
      case "true":
        return "Connecting Room";
        break;
      case "false":
        return "Non-Connecting Room";
        break;
      default:
        return "Connecting: None";
    }
  }
});

Template.agency_guest_hotel_add.events({
  "change #hotelName"(event, template) {
    template.$("#hotelRoomCategory, #placeHolderRoomNumber").val("");
    currentHotel.set(event.target.value);
    Meteor.setTimeout(() => {
      template.$("select").material_select();
    }, 1000);
  },

  "change #hotelRoomCategory"(event, template) {
    template.$("#placeHolderRoomNumber").val("");
    currentRoomCategory.set(event.target.value);
  },

  async "submit #hotel_book_room"(event, template) {
    event.preventDefault();
    const jq = template.$(event.target);
    const { selectedPeople, ...rest } = jq.serializeObject();
    const eventId = FlowRouter.getParam("id");
    const hotelRoomFrom = new Date(rest.hotelRoomFrom);
    const hotelRoomTo = new Date(rest.hotelRoomTo);
    if (
      !selectedPeople ||
      typeof selectedPeople !== "object" ||
      !selectedPeople.length
    ) {
      showError(new Error("Please select Guest"));
      return;
    }
    if (
      isNaN(hotelRoomFrom) ||
      isNaN(hotelRoomTo) ||
      hotelRoomFrom <= new Date() ||
      hotelRoomFrom >= hotelRoomTo
    ) {
      showError(new Error("Invalid Dates"));
      return;
    }

    try {
      // await unbookRoom.call({ guestIds: selectedPeople });
      await Promise.all(
        selectedPeople.map(guestId => {
          return new Promise((resolve, reject) => {
            updateRoomBooking.call(
              { ...rest, guestId, eventId, hotelRoomFrom, hotelRoomTo },
              (err, res) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });
        })
      );

      jq[0].reset();
      showSuccess("Room booked");
      template.$(".modal").modal("close");
    } catch (err) {
      showError(err);
    }
  }
});

Template.events_guests_hotel_info.helpers({
  hotelBookingInfo() {
    const guest = Guests.find({
      _id: FlowRouter.getParam("guestId")
    }).fetch();
    if (!guest || !guest.length) {
      return false;
    }
    const family = Guests.find({
      guestFamilyID: guest[0].guestFamilyID
    }).fetch();
    let bookings = HotelBookings.find({
      guestId: { $in: family.map(({ _id }) => _id) }
    }).fetch();
    if (bookings && bookings.length) {
      const data = bookings.map(bookedRoom => ({
        ...bookedRoom,
        hotelRoomFrom: moment(bookedRoom.hotelRoomFrom).format('LL'),
        hotelRoomTo: moment(bookedRoom.hotelRoomTo).format('LL'),
      }));
      return data;
    } else {
      return false;
    }
  },

  hotelInfo() {
    var hotel = Hotels.findOne(this.hotelId);
    let guest = Guests.findOne(this.guestId);
    var room = Rooms.find({ hotelId: this.hotelId }).fetch();
    if (guest) {
      const data = {
        bookedRoom: this,
        hotelName: hotel.hotelName,
        guestName: guest.guestFirstName,
        roomInfo: room[0],
      };
      return data;
    }
  }
});

Template.hotel_booking_info_card.events({
  "click .click_delete-hotel-booking"(event, template) {
    mbox.confirm("Are you sure?", yes => {
      if (!yes) return;
      unbookRoom.call({ bookingId: template.data.hotel.bookedRoom._id }, (err, res) => {
        if (err) showError(err);
        else {
          showSuccess("Unbooked room");
        }
      });
    });
  }
});

Template.hotelinfo_edit_modal.onRendered(function() {
  editModal = this.$(".modal");
  editModal.modal();
  this.$("select").material_select();
  this.$(".datepicker").pickadate({
    closeOnSelect: true,
    selectYears: 1000
  });
});
