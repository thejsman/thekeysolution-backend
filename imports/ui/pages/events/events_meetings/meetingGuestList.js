import "./meetingGuestList.html";
import Fuse from "fuse.js";
import { fetchGuestList } from "../../../../api/guests/methods.js";

const fuseOptions = {
  shouldSort: true,
  threshold: 0.4,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: [
    {
      name: "guestFirstName",
      weight: 0.5,
    },
    {
      name: "guestLastName",
      weight: 0.3,
    },
    {
      name: "guestPersonalEmail",
      weight: 0.2,
    },
  ],
};

Template.meetingGuestList.onRendered(function () {
  fetchGuests("all_guests");

  let selectedGuests;
  const currentRoute = FlowRouter.getRouteName();
  if (currentRoute === "editEventMeeting") {
    
    if (Session.get("selectedGuestIds")) {
      selectedGuests = _.clone(Session.get("selectedGuestIds"));
    } else {
      selectedGuests = [];
    }
  } else {
    selectedGuests = [];
  }

  Session.set("guestResult", Session.get("guestList"));
  this.$(".modal").modal();

  selectedGuests.map((a) => tickCheckbox(a));
});

Template.meetingGuestList.helpers({
  guestList: () => {
    return Session.get("guestResult");
  },
  selected: (id) => {
    let selectedGuests = Session.get("selectedGuestIds");
    if (selectedGuests) {
      return selectedGuests.indexOf(id) >= 0 ? true : false;
    }
    return false;
  },
});

async function fetchGuests(type) {
  const eventId = FlowRouter.getParam("id");
  const guestList = await fetchGuestList.call(
    { eventId, type: type },
    (err, res) => {
      if (err) console.log(err);
      else {
        return res;
      }
    }
  );
  Session.set("guestList", guestList);
  Session.set("guestResult", guestList);
}

function tickCheckbox(a) {
  $(`#${a}`).prop("checked", true);
}

Template.meetingGuestList.events({
  'change .selectGuestListType input[type="radio"]'(event, template) {
    event.preventDefault();
    fetchGuests(event.target.value);
  },

  'change .guestListInvite input[type="checkbox"]'(event, template) {
    event.preventDefault();
    let selectGuests;
    if (Session.get("selectedGuestIds")) {
      selectGuests = _.clone(Session.get("selectedGuestIds"));
    } else {
      selectGuests = [];
    }

    if (event.target.checked) {
      selectGuests.push(event.target.value);
    } else {
      selectGuests = selectGuests.filter((id) => id !== event.target.value);
    }
    Session.set("selectedGuestIds", selectGuests);
  },

  "keyup #searchGuest"(event, template) {
    event.preventDefault();
    let fuse = new Fuse(Session.get("guestList"), fuseOptions);
    if (event.target.value.length > 1) {
      Session.set("guestResult", fuse.search(event.target.value));
    } else {
      Session.set("guestResult", Session.get("guestList"));
    }
  },

  "click #selectAllGuest"(event, template) {
    template
      .$("input:checkbox")
      .not(this)
      .prop("checked", event.target.checked);
    let selectGuests;
    if (event.target.checked) {
      let guestResult = _.clone(Session.get("guestResult"));
      selectGuests = guestResult.map((guest) => guest._id);
    } else {
      selectGuests = [];
    }
    Session.set("selectedGuestIds", selectGuests);
  },
});
