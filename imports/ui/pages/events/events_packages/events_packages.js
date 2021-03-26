import "./events_packages.html";
import "./packages_info.html";
import "./events_packages.scss";
import "./eventsPackagesForm.html";
import { uploadFile } from "../../../components/upload/uploadFile";
import { FlowRouter } from "meteor/kadira:flow-router";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic/build/ckeditor";
import {
  showError,
  showSuccess
} from "../../../components/notifs/notifications";
import {
  updatePackageInfo,
  insertPackage,
  updatePackage,
  deletePackage
} from "../../../../api/events_packages/methods";
import { Events } from "../../../../api/events/events";
import { App_General } from "../../../../api/app_general/app_general";
import {
  EventPackages,
  EventPackageInfo
} from "../../../../api/events_packages/event_packages";
import { rsvpSubEvents } from "../../../../api/subevents/methods";
import _ from "lodash/lodash";

import MyCustomUploadAdapterPlugin from "./editorimageUpload.js";

import currencies from "../../../../extras/currencies";

// Reactive variables
let subeventList = new ReactiveVar([]);
let selectedPage = new ReactiveVar();
let showAddressForm = new ReactiveVar(false);

// Google Map
var placeSearch, autocomplete;
var componentForm = {
  street_number: "short_name",
  route: "long_name",
  locality: "long_name",
  administrative_area_level_1: "short_name",
  country: "long_name",
  postal_code: "short_name"
};

const geolocate = autocomplete => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      const circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });

      if (autocomplete) {
        autocomplete.setBounds(circle.getBounds());
      }
    });
  }
};

function fillInAddress() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();
  for (var component in componentForm) {
    document.getElementById(component).value = "";
  }

  // For Building Name
  document.getElementById("building").value = place.name;
  document.getElementById("mapurl").value = place.url;
  document.getElementById("lat").value = place.geometry.location.lat();
  document.getElementById("lng").value = place.geometry.location.lng();

  // Get each component of the address from the place details
  // and fill the corresponding field on the form.
  for (var i = 0; i < place.address_components.length; i++) {
    var addressType = place.address_components[i].types[0];
    if (componentForm[addressType]) {
      var val = place.address_components[i][componentForm[addressType]];
      document.getElementById(addressType).value = val;
    }
  }
}

const initLocationSearch = function() {
  autocomplete = new google.maps.places.Autocomplete($("#venue").get(0), {
    types: ["geocode", "establishment"]
  });

  autocomplete.addListener("place_changed", () => {
    fillInAddress();
    showAddressForm.set(true);
  });
  this.loaded.set(true);
};

Template.events_packages_info.onCreated(function() {
  this.autorun(() => {
    Meteor.subscribe("packages.event.info", FlowRouter.getParam("id"));
    Meteor.subscribe("appgeneral.event", FlowRouter.getParam("id"));
    let packageInfo = EventPackageInfo.findOne();
    if (packageInfo && packageInfo.address) {
      showAddressForm.set(true);
    }

    // load image preview at starting
    let file = $("#banner_img").attr("data-default-file");
    if (typeof file != "undefined" && file.length > 0) {
      $(".dropify-render").html('<img src="' + file + '">');
      $(".dropify-wrapper .dropify-preview").css("display", "block");
    }
  });
});

Template.events_packages_info.onRendered(function() {
  this.loaded = new ReactiveVar(false);

  let template = this;
  ClassicEditor.create(document.querySelector("#description"), {
    extraPlugins: [MyCustomUploadAdapterPlugin]
  })
    .then(editor => {
      window.mde = editor;
    })
    .catch(error => {
      console.error(error.stack);
    });

  ClassicEditor.create(document.querySelector("#terms"), {
    extraPlugins: [MyCustomUploadAdapterPlugin]
  })
    .then(editor => {
      window.mde2 = editor;
    })
    .catch(error => {
      console.error(error.stack);
    });

  this.$("select").material_select();
  this.$(".dropify").dropify();
  this.autorun(() => {
    let packageInfo = EventPackageInfo.findOne();
    if (packageInfo && packageInfo.packagesInfo_aboutPage) {
      this.$("#packagesInfo_aboutPage").val(packageInfo.packagesInfo_aboutPage);
      this.$("#packagesInfo_aboutPage").material_select();
    }

    if (showAddressForm.get()) {
      $("#addressForm").show();
      $("#venueSearch").hide();
    } else {
      $("#addressForm").hide();
      $("#venueSearch").show();
    }

    if (selectedPage.get()) {
      let app = App_General.findOne();
      if (app && app.aboutpages) {
        let page = _.find(app.aboutpages, p => {
          return p._id === selectedPage.get();
        });
        mde.value(page.aboutPageContent);
        $("#banner_img").data("data-default-file", page.aboutPageImg);
        $(".dropify-render").html('<img src="' + page.aboutPageImg + '">');
        $(".dropify-wrapper .dropify-preview").css("display", "block");
      }
    } else {
      // load image preview at starting
      let file = $("#banner_img").attr("data-default-file");
      if (typeof file != "undefined" && file.length > 0) {
        $(".dropify-render").html('<img src="' + file + '">');
        $(".dropify-wrapper .dropify-preview").css("display", "block");
      }
    }
  });

  if (window.google && google && google.maps && !this.loaded.get()) {
    initLocationSearch.call(this);
  }

  // Google Map
  $.getScript(
    `https://maps.googleapis.com/maps/api/js?key=AIzaSyA0DOfR8bnZW_EhpsOfJX3v2cK2i3VZTrI&libraries=places`
  )
    .done(() => {
      if ($("#venue").get(0) && !this.loaded.get()) {
        initLocationSearch.call(this);
      }
    })
    .fail(() => {
      console.log("Invalid Google Maps API key!");
    });
});

Template.events_packages_info.helpers({
  pageInfo() {
    let eId = selectedPage.get();
    let instance = Template.instance();
    if (eId) {
      let app = App_General.findOne();
      if (app && app.aboutpages) {
        Meteor.setTimeout(() => {
          instance.$(".dropify").dropify();
        });
        let page = _.find(app.aboutpages, p => {
          return p._id === eId;
        });
        // mde.value(page.aboutPageContent);
        mde.setData(page.aboutPageContent);
        return {
          banner_img: page.aboutPageImg,
          description: page.aboutPageContent
        };
      } else {
        return "";
      }
    }
  },
  packageInfo() {
    let eventInfo = Events.findOne({});
    let packageInfo = EventPackageInfo.findOne();
    if (packageInfo) {
      mde.setData(packageInfo.description);
      mde2.setData(packageInfo.terms);
      return packageInfo;
    }
    return {
      eventName:
        eventInfo && eventInfo.basicDetails && eventInfo.basicDetails.eventName,
      start_date:
        eventInfo &&
        eventInfo.basicDetails &&
        eventInfo.basicDetails.eventStart,
      end_date:
        eventInfo && eventInfo.basicDetails && eventInfo.basicDetails.eventEnd,
      host_details:
        eventInfo &&
        eventInfo.hostDetails &&
        eventInfo.hostDetails.eventHostName
    };
  },
  aboutPages() {
    let app = App_General.findOne();
    if (app && app.aboutpages) {
      return app.aboutpages.map(page => {
        return {
          id: page._id,
          title: page.aboutPageTitle
        };
      });
    } else {
      return [];
    }
  },
  showAddressForm() {
    return showAddressForm.get() ? true : false;
  }
});

// Submit Event Packages Info Form
function toArray(fileList) {
  return Array.prototype.slice.call(fileList);
}

function submitPackagesInfo(data, files, fileNames, form, template) {
  _.each(files, file => {
    if (file.file["original_name"] === fileNames.banner_img) {
      data.banner_img = file.secure_url;
      return;
    }
  });

  let successMessage = "Packages Info Updated";
  let cb = (err, res) => {
    if (err) {
      showError(err);
    } else {
      showSuccess(successMessage);
    }
  };
  updatePackageInfo.call(data, cb);
}

Template.events_packages_info.events({
  "change #packagesInfo_aboutPage"(e, template) {
    e.preventDefault();
    selectedPage.set(template.$(e.target).val());
  },
  "focus #venue": (event, templateInstance) => {
    event.preventDefault();
    geolocate(templateInstance.autocomplete);
  },
  "click .reset--address": event => {
    event.preventDefault();
    showAddressForm.set(false);
  },
  "submit #packagesInfoForm"(e, template) {
    e.preventDefault();
    const eventInfo = Events.findOne({});
    let form = template.$(e.target);
    let formData = form.serializeObject();
    // Check for speakers and sponsors
    if (formData && !formData.include_speaker) {
      formData.include_speaker = false;
    }

    if (formData && !formData.include_sponsor) {
      formData.include_sponsor = false;
    }

    let address = {
      building: $("#building").val(),
      street: $("#street_number").val(),
      street2: $("#route").val(),
      city: $("#locality").val(),
      state: $("#administrative_area_level_1").val(),
      pin: $("#postal_code").val(),
      country: $("#country").val(),
      mapurl: $("#mapurl").val(),
      lat: $("#lat").val(),
      lng: $("#lng").val()
    };
    let data = Object.assign(formData, {
      eventId: FlowRouter.getParam("id"),
      eventName:
        eventInfo && eventInfo.basicDetails && eventInfo.basicDetails.eventName,
      start_date:
        eventInfo &&
        eventInfo.basicDetails &&
        eventInfo.basicDetails.eventStart,
      end_date:
        eventInfo && eventInfo.basicDetails && eventInfo.basicDetails.eventEnd,
      host_details:
        eventInfo &&
        eventInfo.hostDetails &&
        eventInfo.hostDetails.eventHostName,
      address: address
    });
    let fileInputs = template.$('input[type="file"]');
    let fileList = [];
    let fileNames = {};
    fileInputs.each((index, element) => {
      fileList = toArray(fileList).concat(toArray(element.files));
    });

    if (fileList.length > 0) {
      fileNames.banner_img = fileList[0].name.split(/(\\|\/)/g).pop();
      uploadFile(fileList, "bmtimages", false)
        .then(fs => {
          submitPackagesInfo(data, fs, fileNames, form[0], template);
        })
        .catch(e => {
          showError(e);
        });
    } else {
      submitPackagesInfo(data, [], fileNames, form[0], template);
    }
  }
});

// List of Packages
Template.events_packages.onRendered(function() {
  this.autorun(() => {
    Meteor.subscribe("packages.event", FlowRouter.getParam("id"));
  });
});

Template.events_packages.helpers({
  title() {
    if (FlowRouter.current().route.name === "eventsPackagesAdditional") {
      return "Additional Packages";
    } else {
      return "Main Packages";
    }
  },
  eventPackageAddPath() {
    if (FlowRouter.current().route.name === "eventsPackagesAdditional") {
      return FlowRouter.path("eventsPackagesAdditionalAdd", {
        id: FlowRouter.getParam("id")
      });
    } else {
      return FlowRouter.path("eventsPackagesAdd", {
        id: FlowRouter.getParam("id")
      });
    }
  },
  packageList() {
    let packages;
    if (FlowRouter.current().route.name === "eventsPackagesAdditional") {
      packages = EventPackages.find({
        eventId: FlowRouter.getParam("id"),
        packageType: "additional"
      }).fetch();
    } else {
      packages = EventPackages.find({
        eventId: FlowRouter.getParam("id"),
        packageType: "main"
      }).fetch();
    }
    return packages;
  }
});

Template.eventPackageForm.onCreated(function() {
  this.packageType = new ReactiveVar("main");

  // Set packageType on template creation

  const additionalPackagesRoutes = [
    "eventsPackagesAdditional",
    "eventsPackagesAdditionalAdd",
    "eventsPackagesAdditionalEdit"
  ];
  const currentRoute = FlowRouter.current().route.name;
  if (_.includes(additionalPackagesRoutes, currentRoute)) {
    this.packageType.set("additional");
  } else {
    this.packageType.set("main");
  }
});

Template.eventPackageForm.onRendered(function() {
  const additionalPackagesRoutes = [
    "eventsPackagesAdditional",
    "eventsPackagesAdditionalAdd",
    "eventsPackagesAdditionalEdit"
  ];
  const currentRoute = FlowRouter.current().route.name;

  let template = this;
  ClassicEditor.create(document.querySelector("#description"), {
    extraPlugins: [MyCustomUploadAdapterPlugin]
  })
    .then(editor => {
      window.packageDescription = editor;
    })
    .catch(error => {
      console.error(error.stack);
    });

  ClassicEditor.create(document.querySelector("#msg"), {
    extraPlugins: [MyCustomUploadAdapterPlugin]
  })
    .then(editor => {
      window.attendeeMsg = editor;
    })
    .catch(error => {
      console.error(error.stack);
    });
  this.autorun(() => {
    this.$("select").material_select();
    if (FlowRouter.current().route.name === "eventsPackagesEdit") {
      let packageInfo = EventPackages.findOne({
        eventId: FlowRouter.getParam("id"),
        _id: FlowRouter.getParam("packageId")
      });
      $("#packageCurrency").val(packageInfo && packageInfo.packageCurrency);
    }
    Meteor.subscribe("packages.event", FlowRouter.getParam("id"));
    Meteor.subscribe("events.one", FlowRouter.getParam("id"));
    if (_.includes(additionalPackagesRoutes, currentRoute)) {
      this.packageType.set("additional");
    } else {
      this.packageType.set("main");
    }
  });

  // Sub events list
  let eId = FlowRouter.getParam("id");
  rsvpSubEvents.call(eId, (err, res) => {
    if (err) {
      console.log(err);
    } else if (!res.single && res.data) {
      let events = _.map(res.data, (s, d) => {
        let ids = _.map(s, "_id");
        return {
          subEventTitle: d,
          subEventId: _.join(ids, ",")
        };
      });
      subeventList.set(events);
    } else if (res.single && res.data) {
      let events = _.map(res.data, (s, d) => {
        let ids = _.map(s, "_id");
        let title = _.map(s, "subEventTitle");
        let date = _.map(s, "subEventDate");
        return {
          subEventTitle: _.join(title, "") + " - " + date,
          subEventId: _.join(ids, ",")
        };
      });
      subeventList.set(events);
    } else {
      console.log("No SubEvents");
    }
  });
});

Template.eventPackageForm.helpers({
  buttonText() {
    if (
      FlowRouter.current().route.name === "eventsPackagesEdit" ||
      "eventsPackagesAdditionalEdit"
    ) {
      return "Update Package";
    }
    return "Add Package";
  },

  title() {
    if (
      FlowRouter.current().route.name === "eventsPackagesEdit" ||
      "eventsPackagesAdditionalEdit"
    ) {
      return "Update Package";
    }
    return "Add New Package";
  },

  info() {
    if (
      FlowRouter.current().route.name === "eventsPackagesEdit" ||
      "eventsPackagesAdditionalEdit"
    ) {
      return EventPackages.findOne({
        eventId: FlowRouter.getParam("id"),
        _id: FlowRouter.getParam("packageId")
      });
    }
    return "";
  },

  currencies() {
    return currencies;
  },

  subeventsList() {
    return subeventList.get();
  },

  invitationBy() {
    let event = Events.findOne(FlowRouter.getParam("id"));
    return event && event.basicDetails.eventSubeventSorting;
  },

  isMainPackage() {
    return Template.instance().packageType.get() === "main" ? true : false;
  }
});

Template.eventPackageForm.events({
  "submit #eventPackageForm"(e, template) {
    e.preventDefault();
    const packageType = template.packageType.curValue;
    const eventId = FlowRouter.getParam("id");
    let data = template.$(e.target).serializeObject();
    data.eventId = eventId;
    data.packageType = packageType;
    data.description = window.packageDescription.getData();
    data.msg = window.attendeeMsg.getData();
    if (FlowRouter.current().route.name === "eventsPackagesEdit") {
      data.packageId = FlowRouter.getParam("packageId");
      updatePackage.call(data, (err, res) => {
        if (err) showError(err);
        else {
          if (packageType === "additional") {
            FlowRouter.go("eventsPackagesAdditional", {
              id: FlowRouter.getParam("id")
            });
          } else {
            FlowRouter.go("eventsPackages", { id: FlowRouter.getParam("id") });
          }
          showSuccess("Package Updated");
        }
      });
    } else {
      insertPackage.call(data, (err, res) => {
        if (err) showError(err);
        else {
          if (packageType === "additional") {
            FlowRouter.go("eventsPackagesAdditional", {
              id: FlowRouter.getParam("id")
            });
          } else {
            FlowRouter.go("eventsPackages", { id: FlowRouter.getParam("id") });
          }
          showSuccess("New Package Added");
        }
      });
    }
  }
});

Template.events_packages_card.events({
  "click .click_edit_btn"(e, template) {
    e.preventDefault();
    if (template.data.info.packageType === "additional") {
      FlowRouter.go("eventsPackagesAdditionalEdit", {
        id: FlowRouter.getParam("id"),
        packageId: template.data.info._id
      });
    } else {
      FlowRouter.go("eventsPackagesEdit", {
        id: FlowRouter.getParam("id"),
        packageId: template.data.info._id
      });
    }
  },
  "click .click_delete_btn"(e, template) {
    e.preventDefault();
    deletePackage.call(template.data.info._id, (err, res) => {
      if (err) showError(err);
      else {
        showSuccess("Package Deleted");
      }
    });
  }
});

Template.events_packages_rsvp.helpers({
  checked() {
    let pInfo = EventPackages.findOne({
      eventId: FlowRouter.getParam("id"),
      _id: FlowRouter.getParam("packageId")
    });
    let invitedSE = _.filter(pInfo && pInfo.inviteStatus, { status: true });
    let seList = invitedSE.map(a => a.subEventId);
    return seList.includes(this.rsvp.subEventId);
  }
});
