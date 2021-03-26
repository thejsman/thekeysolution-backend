import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import { ReactiveVar } from "meteor/reactive-var";
import {
  insertAppWishFeedback,
  insertAppGeneral,
  requestApp,
  requestDone,
  insertAppWelcome,
  insertAppAbout,
  insertAppContact,
  insertAppItinerary
} from "../../../../api/app_general/methods.js";
import {
  showError,
  showSuccess
} from "../../../components/notifs/notifications.js";
import { Events } from "../../../../api/events/events.js";
import { Agencies } from "../../../../api/agencies/agencies.js";
import { SubEvents } from "../../../../api/subevents/subevents.js";
import { Roles } from "meteor/meteor-roles";
import _ from "lodash";
import { UploadFiles } from "../../../../api/upload/S3Uploads.js";
// import { getFileArray } from '../../../../api/upload/UploadExtensions.js';
// import { uploadFile } from './uploadFile.js';
import { App_General } from "../../../../api/app_general/app_general.js";
import fontList from "../../../../api/app_general/fonts.js";
import { FoodPreferences } from "../../../../api/preferences/foodpreference";
import { SizePreferences } from "../../../../api/preferences/sizepreference";
import { activityRecordInsert } from "../../../../api/activity_record/methods";
import { SpecialAssistancePreferences } from "../../../../api/preferences/specialassistancepreference";
// import "../../../style/fonts.scss";
import "../../../components/colorPicker";
import "../../../components/imageUpload";
import './app_preview/app_preview';
// App preview UIs
import "./events_app.html";
import "./app_welcome_settings.html";
import "./app_wishfeedback_settings.html";
import "./app_about_settings.html";
import "./app_contact_settings.html";
import "./destinations/app_destinations.js";
import "./app_itinerary_settings.js";
// import './app_notification_settings.js';
import "../events_foods/events_foods.html";
import "../events_foods/events_foods.js";
import "../events_sizes/events_sizes.html";
import "../events_sizes/events_sizes.js";
import "../events_assistances/events_assistances.html";
import "../events_assistances/events_assistances.js";
import "../events_subevent/events_subevent.html";
import "../events_subevent/events_subevent.js";
import "./events_app.scss";
import "./app_slideshow.html";

// new about page
import "./events_app_about/events_app_about";

let font_list = new ReactiveVar([]);
let allowedToGenerateVar = new ReactiveVar();
allowedToGenerateVar = false;

Template.app_general_settings.onRendered(function() {
  this.$(".dropify").dropify();
  Meteor.setTimeout(() => {
    this.$("select").material_select();
    Materialize.updateTextFields();
  }, 100);

  let self = this;
  this.autorun(() => {
    let fonts = [];
    let appInfo = App_General.findOne();
    if (appInfo) {
      if (appInfo.isDefaultAppBackground) {
        $("#isDefaultAppBackground").prop("checked", "checked");
      }
      if (appInfo.appHeadingFont) {
        $("#appHeadingFont").val(appInfo.appHeadingFont);
      }
      if (appInfo.appBodyFont) {
        $("#appBodyFont").val(appInfo.appBodyFont);
      }
    }
    for (var key in fontList) {
      fonts.push({
        fontName: key,
        fileName: fontList[key]
      });
    }

    font_list.set(fonts);

    Meteor.setTimeout(() => {
      self.$("select").material_select("destroy");
      self.$("select").material_select();
      this.$(".tooltipped").tooltip({ delay: 50 });
    }, 10);
  });
  Meteor.setTimeout(() => {
    $("#update_app_design_preview").click();
  });
}, 300);

Template.app_general_settings.helpers({
  appBaseSettings() {
    return App_General.findOne();
  },
  appId() {
    let eventId = FlowRouter.getParam("id");
    let eId = eventId;
    if (eventId.match(/^\d/)) {
      eId = "e" + eventId;
    }
    return `com.thekey.${eId}`;
  },

  allowedToGenerate() {
    let isSuperAdmin = Roles.userIsInRole(Meteor.userId(), "superadmin");
    if (isSuperAdmin) {
      return true;
    }

    let event = Events.findOne(FlowRouter.getParam("id"));
    if (event.basicDetails && event.basicDetails.agency) {
      let agency = Agencies.findOne({ _id: event.basicDetails.agency });
      if (
        agency.agencyPlanNumOfAppsPurchased &&
        agency.agencyPlanNumOfAppsPurchased > 0
      ) {
        if (
          typeof agency.agencyPlanAppsGenerated != "undefined" &&
          agency.agencyPlanNumOfAppsPurchased - agency.agencyPlanAppsGenerated >
            0
        ) {
          allowedToGenerateVar = true;
        } else {
          allowedToGenerateVar = false;
        }
      } else {
        allowedToGenerateVar = false;
      }
    }
    return allowedToGenerateVar;
  },

  purchaseRoute() {
    return FlowRouter.path("admin.control.subscription");
  },

  buttonText() {
    let isSuperAdmin = Roles.userIsInRole(Meteor.userId(), "superadmin");
    return isSuperAdmin ? "Generate App" : "Request App";
  },

  requested() {
    let event = Events.findOne(FlowRouter.getParam("id"));
    return event && event.appRequested;
  },

  headingFonts() {
    let fonts = font_list.get();
    let headingFonts = [];
    let selectedFont = null;
    let appInfo = App_General.findOne();
    if (appInfo && appInfo.appHeadingFont) {
      selectedFont = appInfo.appHeadingFont;
    }
    for (var i = 0; i < fonts.length; i++) {
      headingFonts.push({
        ...fonts[i],
        selected: selectedFont === fonts[i].fileName ? "selected" : "false"
      });
    }
    return headingFonts;
  },

  bodyFonts() {
    let fonts = font_list.get();
    let headingFonts = [];
    let selectedFont = null;
    let appInfo = App_General.findOne();
    if (appInfo && appInfo.appBodyFont) {
      selectedFont = appInfo.appBodyFont;
    }
    for (var i = 0; i < fonts.length; i++) {
      headingFonts.push({
        ...fonts[i],
        selected: selectedFont === fonts[i].fileName ? "selected" : "false"
      });
    }
    return headingFonts;
  },

  hasFeature(featureName) {
    let event = Events.findOne(FlowRouter.getParam("id"));
    return event && event.appDetails.selectedAppSocialDetails
      ? event.appDetails.selectedAppSocialDetails.indexOf(featureName) > -1
      : false;
  }
});

Template.app_wishfeedback_settings.helpers({
  hasguestInfo(guestInfo) {
    let event = Events.findOne(FlowRouter.getParam("id"));
    return event && event.appDetails.selectedAppGuestInfo
      ? event.appDetails.selectedAppGuestInfo.indexOf(guestInfo) > -1
      : false;
  }
});

let itineraryList = new ReactiveVar([]);
let itineraryPreviewList = new ReactiveVar([]);
let itineraryEditId = new ReactiveVar(null);
let editId = new ReactiveVar(null);

Template.app_itinerary_settings.onRendered(function() {
  itineraryEditId.set(null);
  this.$(".modal").modal();
  this.$("select").material_select();
  this.$(".dropify").dropify();
  this.autorun(() => {
    let app = App_General.find().count() > 0 ? App_General.findOne() : null;
    if (app) {
      itineraryList.set(app.itineraryList ? app.itineraryList : []);
    }
  });

  Meteor.setTimeout(function() {
    updateItineraryPreview();
    $("#update_itinerary_preview").click();
  }, 800);
});

Template.app_itinerary_settings.helpers({
  appSettings() {
    return App_General.findOne();
  },

  subEventsReady() {
    let subEvents = SubEvents.find();
    return subEvents.count() > 0;
  },

  itineraryVar() {
    return itineraryList;
  },

  editId() {
    return itineraryEditId;
  },

  itinerary() {
    return itineraryList.get();
  }
});

Template.app_itinerary_settings.events({
  "click #save-itinerary"(event, template) {
    event.preventDefault();
    var fileInputs = template.$('input[type="file"]');
    let data = {
      itineraryList: itineraryList.get()
    };
    data.eventId = FlowRouter.getParam("id");
    UploadFiles(fileInputs, 1, true)
      .then(res => {
        data = Object.assign(data, res);
        insertAppItinerary.call(data, (err, res) => {
          if (err) {
            showError(err);
          } else {
            showSuccess("Itinerary Settings Added");
            //code to add activiy record
            activityInsertData = {
              eventId: data.eventId,
              activityModule: "App Settings",
              activitySubModule: "Itinerary",
              event: "Update",
              activityMessage: "Itinerary updated."
            };
            activityRecordInsert(activityInsertData);
          }
        });
      })
      .catch(err => {
        showError(err);
      });
  },

  "click #add-itinerary-button"() {
    itineraryEditId.set(null);
  },

  "click #update_itinerary_preview"(event, template) {
    updateItineraryPreview();
  }
});

function updateItineraryPreview() {
  var itineraryList1 = itineraryList.get();
  temp_list = itineraryList1;
  var selected_date;
  var other_date = [];
  if (typeof temp_list != "undefined" && temp_list.length > 0) {
    let first_item = temp_list[0];
    let final_list = [];
    selected_date = first_item.date;
    temp_list.forEach(function(item, index) {
      if (item.date == first_item.date) {
        final_list.push(item);
      } else {
        if (other_date.indexOf(item.date) < 0 && other_date.length < 2) {
          other_date.push(item.date);
        }
      }
    });
    itineraryList1 = final_list;
  } else {
    itineraryList1 = temp_list;
  }

  let itinerary_image = $(
    "#app_contact_setting_file_uploads .dropify-preview .dropify-render img"
  ).attr("src");
  if (typeof itinerary_image != "undefined" && itinerary_image.length) {
    $(".app-preview .app-body").css(
      "background-image",
      "url(" + itinerary_image + ")"
    );
  }
  if (selected_date.length > 0) {
    $("#selected_date").html(selected_date);
  } else {
    $("#selected_date").html("DATE 1");
  }
  if (other_date.length == 2) {
    $("#other_date1").show();
    $("#other_date1").html(other_date[0]);
    var cloneEle = $("#other_date1");
    cloneEle.html(other_date[1]);
    $("#other_date1")
      .parent("div.row")
      .append(cloneEle);
  } else if (other_date.length == 1) {
    $("#other_date1").show();
    $("#other_date1").html(other_date[0]);
  } else {
    $("#other_date1").hide();
  }

  var preview_string = "";
  for (var i = 0; i < itineraryList1.length; i++) {
    var icon = "";
    if (itineraryList1[i].selectIcon == "common")
      icon = "icon-common-itinerary";
    else if (itineraryList1[i].selectIcon == "food")
      icon = "icon-food-itineray-and-meal";
    else if (itineraryList1[i].selectIcon == "event")
      icon = "icon-event-details";
    else if (itineraryList1[i].selectIcon == "travel")
      icon = "icon-travel-itinerary";
    else if (itineraryList1[i].selectIcon == "transport")
      icon = "icon-transport";
    else if (itineraryList1[i].selectIcon == "hotel") icon = "icon-bed";
    else if (itineraryList1[i].selectIcon == "tour") icon = "icon-tour";
    var extra_class = "";
    if (i == 0) {
      extra_class = "first-child";
    }
    preview_string =
      preview_string +
      '   <div class="row s12 itinerary_preview"> <div class="col s2" ><i class="' +
      icon +
      " abl-itinerary-icon " +
      extra_class +
      ' " ></i> </div><div class="col s10"> <div>' +
      itineraryList1[i].startTime +
      "-" +
      itineraryList1[i].endTime +
      "  </div> <div >" +
      itineraryList1[i].description +
      " </div> </div> </div>";
  }

  $("#itinerary_preview_div").html(preview_string);
}

Template.app_add_destination_settings.onRendered(function() {
  this.$(".modal").modal();
  this.$(".modal-content ul.tabs").tabs();
});

Template.registerHelper("appData", () => {
  let appInfo = App_General.findOne();
  if (appInfo) {
    if (!appInfo.appColor1) {
      appInfo.appColor1 = "#0026fa";
      appInfo.appColor2 = "#000000";
      appInfo.appColor5 = "#ffffff";
      appInfo.appColor6 = "#ffffff";
    }
    if (!appInfo.appColor3) {
      appInfo.appColor3 = "#ed0ef5";
      appInfo.appColor4 = "#0026fa";
    }
    return appInfo;
  } else {
    appInfo = {
      appColor1: "#0026fa",
      appColor2: "#000000",
      appColor5: "#ffffff",
      appColor6: "#ffffff",
      appColor3: "#ed0ef5",
      appColor4: "#0026fa"
    };
    return appInfo;
  }
});

let isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId);
  if (scopes.length > 0) {
    for (var i = 0; i < scopes.length; i++) {
      if (Roles.userIsInRole(userId, role, scopes[i])) {
        return true;
      }
    }
    return false;
  } else {
    return Roles.userIsInRole(userId, role);
  }
};

Template.app_general_settings.helpers({
  canMakeApp() {
    return isAllowed(Meteor.userId(), ["admin", "member"]);
  }
});

Template.app_general_settings.events({
  "click #update_app_design_preview"(event, template) {
    let logo_image = $(
      "#app-general-logo .dropify-preview .dropify-render img"
    ).attr("src");
    let background_image = $(
      "#app-general-background .dropify-preview .dropify-render img"
    ).attr("src");
    let appName = $("#appName").val();
    let appShortName = $("#appShortName").val();
    let appHeadingFont = $("#appHeadingFont").val();
    let appBodyFont = $("#appBodyFont").val();
    let appColor1 = $("#appColor1").val();
    let appColor6 = $("#appColor6").val();
    let appColor2 = $("#appColor2").val();
    let appColor5 = $("#appColor5").val();

    // if (typeof logo_image != 'undefined' && logo_image.length) {
    //   $('#').css('background-image','url('+logo_image+')');
    // }

    if (typeof background_image != "undefined" && background_image.length) {
      $(".app-preview .app-body").css(
        "background-image",
        "url(" + background_image + ")"
      );
    }

    if (typeof appName != "undefined" && appName.length) {
      $(".app-preview .app-name").text(appName);
    } else {
      $(".app-preview .app-name").text("");
    }

    if (typeof appShortName != "undefined" && appShortName.length) {
      $("nav .app-title").text(appShortName);
    } else {
      $("nav .app-title").text("");
    }

    if (typeof appHeadingFont != "undefined" && appHeadingFont.length) {
      $(".app-title").css("font-family", appHeadingFont);
      $(".app-body .app-name").css("font-family", appHeadingFont);
    }

    if (typeof appBodyFont != "undefined" && appBodyFont.length) {
      $(".app-content").css("font-family", appBodyFont);
      $(".feature-title").css("font-family", appBodyFont);
    } else {
    }

    if (typeof appColor1 != "undefined" && appColor1.length) {
      $(".app-preview nav").css("background-color", appColor1);
    } else {
    }

    if (typeof appColor6 != "undefined" && appColor6.length) {
      $(".app-preview .app-title").css("color", appColor6);
    } else {
    }

    if (typeof appColor2 != "undefined" && appColor2.length) {
      $(".app-body").css("color", appColor2);
    } else {
    }

    if (typeof appColor5 != "undefined" && appColor5.length) {
    } else {
    }
  },

  "submit #app-general-setting"(event, template) {
    event.preventDefault();
    let form = template.$(event.target);
    let data = form.serializeObject();

    data.eventId = FlowRouter.getParam("id");
    if (!$("#isDefaultAppBackground").prop("checked")) {
      data.isDefaultAppBackground = false;
    } else {
      data.isDefaultAppBackground = true;
    }
    var fileInputs = template.$('input[type="file"]');
    // console.log('form data ... ', data)
    UploadFiles(fileInputs, 2, true)
      .then(res => {
        data = Object.assign(data, res);
        insertAppGeneral.call(data, (err, res) => {
          if (err) {
            showError(err);
          } else {
            showSuccess("General Settings Added");
            //to insert data in Activity Record
            activityInsertData = {
              eventId: data.eventId,
              activityModule: "App Settings",
              activitySubModule: "Design",
              event: "Update",
              activityMessage: "App design settings updated."
            };
            activityRecordInsert(activityInsertData);
          }
        });
      })
      .catch(err => {
        showError(err);
      });
  },

  "click #request-done-button"(event, template) {
    if (Roles.userIsInRole(Meteor.userId(), "superadmin")) {
      requestDone.call(Events.findOne()._id, (err, res) => {
        if (err) showError(err);
        else {
          mbox.alert("Request has been marked as completed");
        }
      });
    }
  },

  "click #request-app-button"(event, template) {
    if (Roles.userIsInRole(Meteor.userId(), "superadmin")) {
      download();
    } else {
      requestApp.call(Events.findOne()._id, (err, res) => {
        if (err) showError(err);
        else {
          mbox.alert(
            "Your app has been requested. We will update you on the progress shortly via email. Click on OK to continue working on the Event.",
            ok => {
              FlowRouter.go("events.summary", {
                id: FlowRouter.getParam("id")
              });
            }
          );
        }
      });
    }
  },

  'change .js_select_color input[type="color"]'(event, template) {
    event.preventDefault();
    const color = event.currentTarget.value;
    console.log("this ... ", this);
    $(event.currentTarget).siblings("span").innerHTML = color;
    console.log("color ... ", $(event.currentTarget).siblings("span"));
  }
});

//start new code
function download() {
  let eventId = FlowRouter.getParam("id");
  let app = App_General.findOne({ eventId });

  var filename_js = "config.js";
  var text_js =
    "export const EventId = '" +
    app.eventId +
    "'; \r\nexport const AppTItle = '" +
    app.appName +
    "'; \r\nexport const AppShortName = '" +
    app.appShortName +
    "';";
  var element_js = document.createElement("a");
  element_js.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text_js)
  );
  element_js.setAttribute("download", filename_js);
  element_js.style.display = "none";
  document.body.appendChild(element_js);
  element_js.click();
  document.body.removeChild(element_js);

  var filename_css = "config.css";
  var text_css =
    "html{height:100%;} \r\nbody,.appBody {background-image: url('";
  if (app.appBackground) {
    text_css = text_css + app.appBackground;
  } else {
    text_css = text_css + "";
  }
  text_css = text_css + "'); } \r\n.appLogo{ background-image: url('";

  if (app.appLogo) {
    text_css = text_css + app.appLogo;
  } else {
    text_css = text_css + "";
  }
  text_css = text_css + "');} \r\n.appNavbarBGColor{background-color:";

  if (app.appColor1) {
    text_css = text_css + app.appColor1;
  } else {
    text_css = text_css + "";
  }
  text_css = text_css + ";} \r\n.appNavbarFontColor{color:";

  if (app.appColor6) {
    text_css = text_css + app.appColor6;
  } else {
    text_css = text_css + "";
  }
  text_css = text_css + ";} \r\n.appNavbarFontFamily{font-family: '";

  if (app.appHeadingFont) {
    text_css = text_css + app.appHeadingFont;
  } else {
    text_css = text_css + "";
  }
  text_css = text_css + "';}  \r\n.appBodyFontColor{color:";

  if (app.appColor2) {
    text_css = text_css + app.appColor2;
  } else {
    text_css = text_css + "";
  }
  text_css = text_css + ";}  \r\n.appBodyFontFamily{font-family: '";

  if (app.appBodyFont) {
    text_css = text_css + app.appBodyFont;
  } else {
    text_css = text_css + "";
  }
  text_css = text_css + "';}   \r\n.appSelectColor{color:";

  if (app.appColor5) {
    text_css = text_css + app.appColor5;
  } else {
    text_css = text_css + "";
  }
  text_css =
    text_css +
    ";}  \r\n.appGradientColor{background: linear-gradient(to right,";

  if (app.appColor3) {
    text_css = text_css + app.appColor3;
  } else {
    text_css = text_css + "";
  }

  text_css = text_css + ",";

  if (app.appColor4) {
    text_css = text_css + app.appColor4;
  } else {
    text_css = text_css + "";
  }
  text_css = text_css + ");} \r\n.appWelcomeBackground{background-image: url('";

  if (app.welcomeBackground) {
    text_css = text_css + app.welcomeBackground;
  } else if (app.appBackground) {
    text_css = text_css + app.appBackground;
  } else {
    text_css = text_css + "";
  }
  text_css = text_css + "');}  \r\n.appAboutBackground{background-image: url('";

  if (app.aboutPageBackground) {
    text_css = text_css + app.aboutPageBackground;
  } else if (app.appBackground) {
    text_css = text_css + app.appBackground;
  } else {
    text_css = text_css + "";
  }
  text_css =
    text_css + "');}  \r\n.appContactBackground{background-image: url('";

  if (app.contactBackground) {
    text_css = text_css + app.contactBackground;
  } else if (app.appBackground) {
    text_css = text_css + app.appBackground;
  } else {
    text_css = text_css + "";
  }
  text_css =
    text_css + "');}  \r\n.appItineraryBackground{background-image: url('";

  if (app.itineraryBackground) {
    text_css = text_css + app.itineraryBackground;
  } else if (app.appBackground) {
    text_css = text_css + app.appBackground;
  } else {
    text_css = text_css + "";
  }
  text_css = text_css + "');} ";

  setTimeout(function() {
    element_js = document.createElement("a");
    element_js.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text_css)
    );
    element_js.setAttribute("download", filename_css);
    element_js.style.display = "none";
    document.body.appendChild(element_js);
    element_js.click();
    document.body.removeChild(element_js);
  }, 2000);

  Meteor.call("updateAppConfigFile", text_js, text_css);
}
//end new code

Template.app_welcome_settings.onRendered(() => {
  this.$(".dropify").dropify();
  Meteor.setTimeout(() => {
    this.$("select").material_select();
    Materialize.updateTextFields();
    // ABL_SAM: FIXING APP PREVIEW
    this.$(".tooltip-icon").tooltip({ delay: 50 });
    this.$(".tooltipped").tooltip({ delay: 50 });
  }, 100);
});

Template.app_welcome_settings.helpers({
  hasFeedback() {
    let event = Events.findOne(FlowRouter.getParam("id"));
    let app = App_General.findOne();
    if (event) {
      return event.appDetails.featureFeedbackType === "FeedBack";
    }

    if (app && event) {
      let questions = app.feedbackQuestions ? app.feedbackQuestions : [];
      while (questions.length < 6) {
        questions.push("");
      }
      return questions;
    } else {
      return [];
    }
  }
});

Template.app_welcome_settings.events({
  "click #update_welcome_preview"(event, template) {
    let welcome_image = $(
      "#welcomeImageDiv .dropify-preview .dropify-render img"
    ).attr("src");
    let welcome_background = $(
      "#welcomeBackgroundDiv .dropify-preview .dropify-render img"
    ).attr("src");
    let welcome_title = $("#welcomeTitle").val();
    let welcome_message = $("#app_welcome_setting #textarea1").val();
    let welcome_appColor3 = $("#appColor3").val();
    let welcome_appColor4 = $("#appColor4").val();

    if (typeof welcome_image != "undefined" && welcome_image.length) {
      $(".welcome .app-body .welcome-content .welcome-image").css(
        "background-image",
        "url(" + welcome_image + ")"
      );
    }

    if (typeof welcome_background != "undefined" && welcome_background.length) {
      $(".welcome .app-body").css(
        "background-image",
        "url(" + welcome_background + ")"
      );
    }

    if (typeof welcome_title != "undefined" && welcome_title.length) {
      $(".app-preview .app-title").text(welcome_title);
    }

    if (typeof welcome_message != "undefined" && welcome_message.length) {
      $(".app-preview #app_welcome_message").text(welcome_message);
    }

    if (
      (typeof welcome_appColor3 != "undefined" && welcome_appColor3.length) ||
      (typeof welcome_appColor4 != "undefined" && welcome_appColor4.length)
    ) {
      $(".app-body .welcome-text").css(
        "background",
        "linear-gradient(to right," +
          welcome_appColor3 +
          "," +
          welcome_appColor4 +
          ")"
      );

      //background: linear-gradient(to right, {{appColor3}}, {{appColor4}});
    }
  },

  "submit #app_welcome_setting"(event, template) {
    event.preventDefault();
    let form = template.$(event.target);
    let data = form.serializeObject();
    data.eventId = FlowRouter.getParam("id");
    var fileInputs = template.$('input[type="file"]');
    UploadFiles(fileInputs, 2, true)
      .then(res => {
        data = Object.assign(data, res);
        insertAppWelcome.call(data, (err, res) => {
          if (err) {
            showError(err);
          } else {
            showSuccess("Welcome Settings Added");
            //code to insert data in Activity Record
            activityInsertData = {
              eventId: data.eventId,
              activityModule: "App Settings",
              activitySubModule: "Welcome",
              event: "Update",
              activityMessage: "Welcome message updated."
            };
            activityRecordInsert(activityInsertData);
          }
        });
      })
      .catch(showError);
  }
});
// ABL BOC SAM ADDING WISH FEEDBACK SECTION
Template.app_wishfeedback_settings.onRendered(() => {
  Materialize.updateTextFields();
  Meteor.setTimeout(function() {
    this.$(".tooltip-icon").tooltip({ delay: 50 });
    this.$(".tooltipped").tooltip({ delay: 50 });
    let event = Events.findOne(FlowRouter.getParam("id"));

    if (event) {
      if (event.appDetails.featureFeedbackType == "FeedBack") {
        $("#wishSection").addClass("hide");
        $("#feedbackSection").removeClass("hide");
      } else {
        $("#wishSection").removeClass("hide");
        $("#feedbackSection").addClass("hide");
      }
    }

    $(".owl-carousel").owlCarousel({
      items: 1,
      nav: true,
      // autoplay:true,
      loop: true
    });
  }, 500);
});

Template.app_wishfeedback_settings.helpers({
  hasFeedback() {
    let event = Events.findOne(FlowRouter.getParam("id"));
    if (event) {
      return event.appDetails.featureFeedbackType === "FeedBack";
    }
    return false;
  },
  incremented(index) {
    return index + 1;
  },

  feedbackQuestions() {
    let eventId = FlowRouter.getParam("id");
    let app = App_General.findOne({ eventId });
    let event = Events.findOne(eventId);
    if (app && event) {
      let questions = app.feedbackQuestions ? app.feedbackQuestions : [];
      while (questions.length <= 5) {
        questions.push("");
      }
      return questions;
    } else {
      return [];
    }
  }
});

Template.app_wishfeedback_settings.events({
  "click #update_general_queries_preview"(event, template) {
    let visa_question = $("#app_wishfeedback_visa_question").val();
    let passport_question = $("#app_wishfeedback_passport_question").val();
    let wishes_title = $("#app_wishfeedback_wishes_title").val();
    let wishes_description = $("#app_wishfeedback_wishes_description").val();
    let feedback_question1 = $("#app_wishfeedback_feedback_question1").val();
    let feedback_question2 = $("#app_wishfeedback_feedback_question2").val();
    let feedback_question3 = $("#app_wishfeedback_feedback_question3").val();
    let feedback_question4 = $("#app_wishfeedback_feedback_question4").val();
    let feedback_question5 = $("#app_wishfeedback_feedback_question5").val();
    let feedback_question6 = $("#app_wishfeedback_feedback_question6").val();
    if (typeof visa_question != "undefined" && visa_question.length) {
      $("#general_visa_question").text(visa_question);
    } else {
      $("#general_visa_question").text("");
    }
    if (typeof passport_question != "undefined" && passport_question.length) {
      $("#general_passport_question").text(passport_question);
    } else {
      $("#general_passport_question").text("");
    }
    if (typeof wishes_title != "undefined" && wishes_title.length) {
      $(".owl-item #general_wishes_title").html(wishes_title);
    } else {
      $(".owl-item #general_wishes_title").html("");
    }
    if (typeof wishes_description != "undefined" && wishes_description.length) {
      $(".owl-item #general_wishes_description").text(wishes_description);
    } else {
      $(".owl-item #general_wishes_description").text("");
    }
    if (typeof feedback_question1 != "undefined" && feedback_question1.length) {
      $("#general_feedback1").text("1. " + feedback_question1);
    } else {
      $("#general_feedback1").text("1. Sample FeedBack Question ?");
    }
    if (typeof feedback_question2 != "undefined" && feedback_question2.length) {
      $("#general_feedback2").text("2. " + feedback_question2);
    } else {
      $("#general_feedback2").text("2. Sample FeedBack Question ?");
    }
    if (typeof feedback_question3 != "undefined" && feedback_question3.length) {
      $("#general_feedback3").text("3. " + feedback_question3);
    } else {
      $("#general_feedback3").text("3. Sample FeedBack Question ?");
    }

    if (typeof feedback_question4 != "undefined" && feedback_question4.length) {
      $("#general_feedback4").text("4. " + feedback_question4);
    } else {
      $("#general_feedback4").text("4. Sample FeedBack Question ?");
    }

    if (typeof feedback_question5 != "undefined" && feedback_question5.length) {
      $("#general_feedback5").text("5. " + feedback_question5);
    } else {
      $("#general_feedback5").text("5. Sample FeedBack Question ?");
    }

    if (typeof feedback_question6 != "undefined" && feedback_question6.length) {
      $("#general_feedback6").text("6. " + feedback_question6);
    } else {
      $("#general_feedback6").text("6. Sample FeedBack Question ?");
    }
  },

  "submit #app_wishfeedback_setting"(event, template) {
    event.preventDefault();
    let events = Events.findOne(FlowRouter.getParam("id"));
    let form = template.$(event.target);
    let data = form.serializeObject();
    data.eventId = FlowRouter.getParam("id");
    if (events) {
      if (events.appDetails.featureFeedbackType == "FeedBack") {
        data.showFeedback = true;
      } else {
        data.showFeedback = false;
      }
    }
    insertAppWishFeedback.call(data, (err, res) => {
      if (err) {
        showError(err);
      } else {
        showSuccess("General queries settings updated");
        activityInsertData = {
          eventId: data.eventId,
          activityModule: "App Settings",
          activitySubModule: "General Queries",
          event: "Update",
          activityMessage: "General queries settings updated"
        };
        activityRecordInsert(activityInsertData);
      }
    });
  },

  "change #showFeedback"(event, template) {
    if ($("#showFeedback").prop("checked")) {
      $("#feedbackSection").removeClass("hide");
      $("#wishSection").addClass("hide");
    } else {
      $("#feedbackSection").addClass("hide");
      $("#wishSection").removeClass("hide");
    }
  }
});

// ABL EOC SAM ADDING WISH FEEDBACK SECTION
Template.app_about_settings.onRendered(() => {
  this.$(".dropify").dropify();
  Meteor.setTimeout(() => {
    this.$("select").material_select();
    Materialize.updateTextFields();
    // ABL_SAM: FIXING APP PREVIEW
    this.$(".tooltip-icon").tooltip({ delay: 50 });
    this.$(".tooltipped").tooltip({ delay: 50 });
    $(".owl-carousel").owlCarousel({
      items: 1,
      nav: true,
      // autoplay:true,
      loop: true
    });
  }, 1000);
});

Template.app_about_settings.events({
  "click #update_about_preview"(event, template) {
    let imageBackground = $(
      "#app_about_settings .aboutBackgroundDiv .dropify-preview .dropify-render img"
    ).attr("src");
    let image1 = $(
      "#app_about_settings .aboutFirstDiv .dropify-preview .dropify-render img"
    ).attr("src");
    let image2 = $(
      "#app_about_settings .aboutSecondDiv .dropify-preview .dropify-render img"
    ).attr("src");
    let image3 = $(
      "#app_about_settings .aboutThirdDiv .dropify-preview .dropify-render img"
    ).attr("src");

    let title1 = $(".about_first_title ").val();
    let description1 = $(".about_first_content").val();
    let title2 = $(".about_second_title ").val();
    let description2 = $(".about_second_content").val();
    let title3 = $(".about_third_title ").val();
    let description3 = $(".about_third_content").val();

    if (typeof imageBackground != "undefined" && imageBackground.length > 0) {
      $(".app-preview .app-body").css(
        "background-image",
        "url(" + imageBackground + ")"
      );
    }

    if (typeof image1 != "undefined" && image1.length > 0) {
      $("#about_main_banner").css("background-image", "url(" + image1 + ")");
      $("#about_main_banner").html("");
    } else {
      $("#about_main_banner").css("background", "red");
    }

    if (typeof image2 != "undefined" && image2.length > 0) {
      $("#about_sub_banner1").css("background-image", "url(" + image2 + ")");
      $("#about_sub_banner1").html("");
    } else {
      $("#about_sub_banner1").css("background", "red");
    }

    if (typeof image3 != "undefined" && image3.length > 0) {
      $("#about_sub_banner2").css("background-image", "url(" + image3 + ")");
      $("#about_sub_banner2").html("");
    } else {
      $("#about_sub_banner2").css("background", "red");
    }

    if (typeof title1 != "undefined" && title1.length > 0) {
      $("#about_main_title").html(title1);
    } else {
      $("#about_main_title").html("");
    }

    if (typeof title2 != "undefined" && title2.length > 0) {
      $("#about_sub1_title").html(title2);
    } else {
      $("#about_sub1_title").html("");
    }

    if (typeof title3 != "undefined" && title3.length > 0) {
      $("#about_sub2_title").html(title3);
    } else {
      $("#about_sub2_title").html("");
    }

    if (typeof description1 != "undefined" && description1.length > 0) {
      $("#about_main_description").html(description1);
    } else {
      $("#about_main_description").html("");
    }

    if (typeof description2 != "undefined" && description2.length > 0) {
      $("#about_sub1_description").html(description2);
    } else {
      $("#about_sub1_description").html("");
    }

    if (typeof description3 != "undefined" && description3.length > 0) {
      $("#about_sub2_description").html(description3);
    } else {
      $("#about_sub2_description").html("");
    }
  },

  "submit #app_about_settings"(event, template) {
    event.preventDefault();
    let form = template.$(event.target);
    let data = form.serializeObject();
    data.eventId = FlowRouter.getParam("id");
    var fileInputs = template.$('input[type="file"]');
    UploadFiles(fileInputs, 1, true)
      .then(res => {
        data = Object.assign(data, res);
        insertAppAbout.call(data, (err, res) => {
          if (err) {
            showError(err);
          } else {
            showSuccess("About Settings Added");
          }
        });
      })
      .catch(showError);
  }
});

Template.app_contact_settings.onRendered(() => {
  this.$(".dropify").dropify();
  Meteor.setTimeout(() => {
    this.$("select").material_select();
    Materialize.updateTextFields();
    // ABL_SAM: FIXING APP PREVIEW
    this.$(".tooltip-icon").tooltip({ delay: 50 });
    this.$(".tooltipped").tooltip({ delay: 50 });
  }, 1000);

  let appData = App_General.findOne();
  if (appData && typeof appData.contactItems != "undefined") {
    if (appData.contactItems.length > 0) {
      $(
        '#contact_counter option[value="' + appData.contactItems.length + '"]'
      ).attr("selected", "selected");
    }
  }
});
Template.app_contact_settings.events({
  "click #update_contact_preview"(event, template) {
    updateContact();
  },

  "change #contact_counter"(event, template) {
    let count = $("#contact_counter").val();
    $(".contact_item").each(function() {
      if ($(this).attr("id") < count) {
        $(this).removeClass("hide");
      } else {
        $(this).addClass("hide");
        $(this)
          .find("input")
          .val("");
      }
    });
  }
});
Template.app_contact_settings.helpers({
  contacts() {
    let app = App_General.findOne();
    let cons = [];
    for (var i = 0; i < 5; i++) {
      if (app && app.contactItems && app.contactItems[i]) {
        cons.push({
          name: app.contactItems[i].name,
          number: app.contactItems[i].number,
          hide: ""
        });
      } else {
        cons.push({
          name: "",
          number: "",
          hide: "hide"
        });
      }
    }
    return cons;
  },
  incremented(num) {
    return num + 1;
  }
});

Template.app_contact_settings.events({
  "submit #app_contact_settings"(event, template) {
    event.preventDefault();
    let form = template.$(event.target);
    let data = form.serializeObject();
    data.eventId = FlowRouter.getParam("id");
    var fileInputs = template.$('input[type="file"]');
    UploadFiles(fileInputs, 4, true)
      .then(res => {
        data = Object.assign(data, res);

        insertAppContact.call(data, (err, res) => {
          if (err) {
            console.log(err);
            showError(err);
          } else {
            showSuccess("Contact Settings Added");
            //code to add activiy record
            activityInsertData = {
              eventId: data.eventId,
              activityModule: "App Settings",
              activitySubModule: "Contact",
              event: "Update",
              activityMessage: "Contact details updated"
            };
            activityRecordInsert(activityInsertData);
          }
        });
      })
      .catch(showError);
  }
});

Template.app_add_destination_settings.events({
  "submit #add-new-destination"(event, template) {
    event.preventDefault();
    let form = template.$(event.target);
    let data = form.serializeObject();
    data.eventId = FlowRouter.getParam("id");
  }
});

Template.app_preview_wishes.onRendered(() => {
  Meteor.setTimeout(function() {
    $("#star6").html("");
    $("#star6").css("border", "2px solid");
    $("#star6").css("height", "50px");
  }, 500);
});
Template.app_preview_wishes.helpers({
  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.appDetails &&
      event.appDetails.selectedAppDetails &&
      event.appDetails.selectedAppDetails.indexOf(featureName) > -1
    ) {
      return true;
    }
    return false;
  },
  appWishesSettings() {
    return App_General.findOne();
  },
  incremented(index) {
    return index + 1;
  },
  feedbackQuestions() {
    let eventId = FlowRouter.getParam("id");
    let app = App_General.findOne({ eventId });
    let event = Events.findOne(eventId);

    if (app && event) {
      let questions = app.feedbackQuestions ? app.feedbackQuestions : [];
      while (questions.length <= 5) {
        questions.push("Sample FeedBack Question ?");
      }
      return questions;
    } else {
      return [];
    }
  },
  showFeedbackScreen() {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (event) {
      if (
        event.appDetails &&
        event.appDetails.featureFeedbackType &&
        event.appDetails.featureFeedbackType == "FeedBack"
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
});

Template.app_preview_preference_meal.helpers({
  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.appDetails &&
      event.appDetails.selectedAppDetails &&
      event.appDetails.selectedAppDetails.indexOf(featureName) > -1
    ) {
      return true;
    }
    return false;
  },
  appPreferencesSettings() {
    return App_General.findOne();
  }
});

Template.app_preview_preference_size.helpers({
  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.appDetails &&
      event.appDetails.selectedAppDetails &&
      event.appDetails.selectedAppDetails.indexOf(featureName) > -1
    ) {
      return true;
    }
    return false;
  },
  appPreferencesSettings() {
    return App_General.findOne();
  }
});

Template.app_preview_preference_assistance.helpers({
  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.appDetails &&
      event.appDetails.selectedAppDetails &&
      event.appDetails.selectedAppDetails.indexOf(featureName) > -1
    ) {
      return true;
    }
    return false;
  },
  appPreferencesSettings() {
    return App_General.findOne();
  }
});

Template.app_preview_welcome.onRendered(function() {
  Meteor.setTimeout(function() {
    $("#update_welcome_preview").click();
  }, 300);
});

Template.app_preview_welcome.helpers({
  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.appDetails &&
      event.appDetails.selectedAppDetails &&
      event.appDetails.selectedAppDetails.indexOf(featureName) > -1
    ) {
      return true;
    }
    return false;
  },

  checkVideo(welcomeVideo) {
    if (typeof welcomeVideo != "undefined" && welcomeVideo.length) {
      return true;
    }
    return false;
  },
  appWelcomeSettings() {
    return App_General.findOne();
  },
  // ABL_SAM : Set default app default background isDefaultAppBackground
  backgroundUrl() {
    let eventId = FlowRouter.getParam("id");
    let app = App_General.findOne({ eventId });
    if (app) {
      if (
        typeof app.welcomeBackground != "undefined" &&
        app.welcomeBackground.length > 0
      ) {
        return app.welcomeBackground;
      } else if (
        typeof app.isDefaultAppBackground != "undefined" &&
        typeof app.appBackground != "undefined" &&
        app.isDefaultAppBackground
      ) {
        return app.appBackground;
      }
      return "";
    }
  }
});

Template.app_preview_about.helpers({
  aboutUsTitle() {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.basicDetails &&
      event.basicDetails.eventType &&
      event.basicDetails.eventType == "wedding"
    ) {
      return "BRIDE & GROOM";
    }
    return "ABOUT";
  },
  appAboutSettings() {
    return App_General.findOne();
  },
  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.appDetails &&
      event.appDetails.selectedAppDetails &&
      event.appDetails.selectedAppDetails.indexOf(featureName) > -1
    ) {
      return true;
    }
    return false;
  },
  // ABL_SAM : Set default app default background isDefaultAppBackground
  backgroundUrl() {
    let eventId = FlowRouter.getParam("id");
    let app = App_General.findOne({ eventId });
    if (app) {
      if (
        typeof app.aboutPageBackground != "undefined" &&
        app.aboutPageBackground.length > 0
      ) {
        return app.aboutPageBackground;
      } else if (
        typeof app.isDefaultAppBackground != "undefined" &&
        typeof app.appBackground != "undefined" &&
        app.isDefaultAppBackground
      ) {
        return app.appBackground;
      }
      return "";
    }
  }
});

Template.app_preview_contact.helpers({
  appContactSettings() {
    return App_General.findOne();
  },
  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.appDetails &&
      event.appDetails.selectedAppDetails &&
      event.appDetails.selectedAppDetails.indexOf(featureName) > -1
    ) {
      return true;
    }
    return false;
  },
  contacts() {
    let app = App_General.findOne();
    let cons = [];
    for (var i = 0; i < 5; i++) {
      if (app && app.contactItems && app.contactItems[i]) {
        cons.push({
          name: app.contactItems[i].name,
          number: app.contactItems[i].number,
          hide: ""
        });
      } else {
        cons.push({
          name: "",
          number: "",
          hide: "hide"
        });
      }
    }
    return cons;
  },
  incremented(index) {
    return index + 1;
  }
});

// CODE TO ADD PREVIEW SECTION IN DESTINATIONS
Template.app_preview_itinerary.helpers({
  symbol(selectIcon) {
    if (selectIcon == "common") return "icon-common-itinerary";
    else if (selectIcon == "food") return "icon-food-itineray-and-meal";
    else if (selectIcon == "event") return "icon-event-details";
    else if (selectIcon == "travel") return "icon-travel-itinerary";
    else if (selectIcon == "transport") return "icon-transport";
    else if (selectIcon == "hotel") return "icon-bed";
    else if (selectIcon == "tour") return "icon-tour";
  },

  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.appDetails &&
      event.appDetails.selectedAppDetails &&
      event.appDetails.selectedAppDetails.indexOf(featureName) > -1
    ) {
      return true;
    }
    return false;
  },
  checkItineraryIndex(index) {
    if (index < 8) {
      return true;
    }
    return false;
  },
  appItinerarySettings() {
    return App_General.findOne();
  },
  itineraryPreviewBackground() {
    let app = App_General.findOne();
    if (app.itineraryBackground) {
      return app.itineraryBackground;
    } else {
      return app.appBackground;
    }
  },
  list(event, template) {
    let app = App_General.findOne();
    let temp_list = [];
    if (app) {
      temp_list = app.itineraryList;
      if (typeof temp_list != "undefined" && temp_list.length > 0) {
        let first_item = temp_list[0];
        let final_list = [];
        temp_list.forEach(function(item, index) {
          if (item.date == first_item.date) {
            final_list.push(item);
          }
        });
        return final_list;
      } else {
        return temp_list;
      }
    } else {
      return [];
    }
  }
});

Template.app_preview_destination_places.helpers({
  app_settings() {
    return App_General.findOne();
  },
  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.appDetails &&
      event.appDetails.selectedAppDetails &&
      event.appDetails.selectedAppDetails.indexOf(featureName) > -1
    ) {
      return true;
    }
    return false;
  }
});

Template.app_preview_destination_places.events({
  "click #updateAppPreviewPlaces"(event, template) {
    updateAppPreviewPlaces();
  }
});

Template.app_preview_destination_places.onRendered(function() {
  Meteor.setTimeout(function() {
    updateAppPreviewPlaces();
  }, 800);
  Meteor.setTimeout(function() {
    updateAppPreviewPlaces();
    $("#places .owl-carausal").owlCarousel({
      items: 1,
      autoplay: true,
      loop: true
    });
  }, 2000);
});

function updateAppPreviewPlaces() {
  let image1 = $(
    "#add-destination-modal #place_to_visit1 .dropify-preview .dropify-render img"
  ).attr("src"); //$('#places input[name="placesToVisitImage1"]').sibling().attr('src');
  let image2 = $(
    "#add-destination-modal #place_to_visit2 .dropify-preview .dropify-render img"
  ).attr("src"); //$('#places input[name="placesToVisitImage2"]').attr('data-default-file');
  let image3 = $(
    "#add-destination-modal #place_to_visit3 .dropify-preview .dropify-render img"
  ).attr("src");
  let title1 = $("#places #destinationPlacesToVisitTitle1").val();
  let description1 = $("#places #destinationPlaceToVisitDescription1").val();
  let title2 = $("#places #destinationPlacesToVisitTitle2").val();
  let description2 = $("#places #destinationPlaceToVisitDescription2").val();
  let title3 = $("#places #destinationPlacesToVisitTitle3").val();
  let description3 = $("#places #destinationPlaceToVisitDescription3").val();
  if (typeof image1 != "undefined" && image1.length > 0) {
    $("#places #image1").css("background-image", "url(" + image1 + ")");
    $("#places #image1").html("");
  } else {
    $("#places #image1").css("background", "red");
    $("#places #image1").html("");
  }
  if (typeof image2 != "undefined" && image2.length > 0) {
    $("#places #image2").css("background-image", "url(" + image2 + ")");
    $("#places #image2").html("");
  } else {
    $("#places #image2").css("background", "red");
    $("#places #image2").html("");
  }
  if (typeof image3 != "undefined" && image3.length > 0) {
    $("#places #image3").css("background-image", "url(" + image3 + ")");
    $("#places #image3").html("");
  } else {
    $("#places #image3").css("background", "red");
    $("#places #image3").html("");
  }
  if (typeof title1 != "undefined" && title1.length > 0) {
    $("#places #title1").html(title1);
  } else {
    $("#places #title1").html("");
  }
  if (typeof title2 != "undefined" && title2.length > 0) {
    $("#places #title2").html(title2);
  } else {
    $("#places #title2").html("");
  }
  if (typeof title3 != "undefined" && title3.length > 0) {
    $("#places #title3").html(title3);
  } else {
    $("#places #title3").html("");
  }
  if (typeof description1 != "undefined" && description1.length > 0) {
    $("#places #description1").html(description1);
  } else {
    $("#places #description1").html("");
  }
  if (typeof description2 != "undefined" && description2.length > 0) {
    $("#places #description2").html(description2);
  } else {
    $("#places #description2").html("");
  }
  if (typeof description3 != "undefined" && description3.length > 0) {
    $("#places #description3").html(description3);
  } else {
    $("#places #description3").html("");
  }
}
Template.app_preview_destination_overview.helpers({
  app_settings() {
    return App_General.findOne();
  },
  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.appDetails &&
      event.appDetails.selectedAppDetails &&
      event.appDetails.selectedAppDetails.indexOf(featureName) > -1
    ) {
      return true;
    }
    return false;
  }
});
Template.app_preview_destination_overview.events({
  "click #refreshDestinationOverview"(event, template) {
    updateOverview();
  }
});
Template.app_preview_destination_overview.onRendered(function() {
  Meteor.setTimeout(function() {
    updateOverview();
  }, 100);
});
function updateOverview() {
  let image1 = $(
    "#add-destination-modal #overview .dropify-preview .dropify-render img"
  ).attr("src");
  let place = $("#overview #gift_name").val();
  let placedetails = $(
    '#overview textarea[name="basicInfo[aboutDestination]"]'
  ).val();
  let placename = $("#destination-location").val();

  if (typeof image1 != "undefined" && image1.length > 0) {
    $("#main_event_banner").css("background-image", "url(" + image1 + ")");
  } else {
    $("#main_event_banner").css("background", "red");
  }
  if (typeof place != "undefined" && description3.length > 0) {
    $("#overview #placename").html(place);
  } else {
    $("#overview #placename").html("");
  }

  if (typeof placename != "undefined" && placename.length > 0) {
    $("#overview #placename").html(placename);
    $("#overview #destination_name1").html(placename);
    $("#dosDestinationName").html(placename);
    $("#generalDestinationName").html(placename);
  } else {
    $("#overview #placename").html("");
    $("#overview #destination_name1").html("");
    $("#dosDestinationName").html("");
    $("#generalDestinationName").html("");
  }
  if (typeof placedetails != "undefined" && placedetails.length > 0) {
    $("#overview #placedetails").html(placedetails);
  } else {
    $("#overview #placedetails").html("");
  }
}

Template.app_preview_destination_travel.helpers({
  app_settings() {
    return App_General.findOne();
  },
  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.appDetails &&
      event.appDetails.selectedAppDetails &&
      event.appDetails.selectedAppDetails.indexOf(featureName) > -1
    ) {
      return true;
    }
    return false;
  }
});

Template.app_preview_destination_travel.events({
  "click #refreshDestinationTravel"(event, template) {
    updateTravel();
  }
});

Template.app_preview_destination_travel.onRendered(function() {
  Meteor.setTimeout(function() {
    updateTravel();
  }, 500);
});

function updateTravel() {
  let image1 = $(
    "#add-destination-modal #travel .dropify-preview .dropify-render img"
  ).attr("src");
  let airport = $("#travel #destinationAirport").val();
  let timezone = $("#travel #destinationTimezone").val();
  let max = $("#travel #destinationWeatherMax").val();
  let min = $("#travel #destinationWeatherMin").val();
  let rate1 = $("#travel #destinationCurrencyRate1").val();
  let rate2 = $("#travel #destinationCurrencyRate2").val();
  let rate3 = $("#travel #destinationCurrencyRate3").val();
  let from1 = $("#travel #destinationCurrencyFrom1").val();
  let from2 = $("#travel #destinationCurrencyFrom2").val();
  let from3 = $("#travel #destinationCurrencyFrom3").val();
  let to1 = $("#travel #destinationCurrencyTo1").val();
  let to2 = $("#travel #destinationCurrencyTo2").val();
  let to3 = $("#travel #destinationCurrencyTo3").val();
  let destinationName = $("#overview #destination-location").val();

  if (typeof destinationName != "undefined" && destinationName.length > 0) {
    $("#travel #destination_name1").html(destinationName);
  } else {
    $("#travel #destination_name1").html("");
  }
  if (typeof image1 != "undefined" && image1.length > 0) {
    $("#getting_there_banner").css("background-image", "url(" + image1 + ")");
  } else {
    $("#getting_there_banner").css("background", "red");
  }
  if (typeof airport != "undefined" && airport.length > 0) {
    $("#travel #airport").html(airport);
  } else {
    $("#travel #airport").html("");
  }
  if (typeof timezone != "undefined" && timezone.length > 0) {
    $("#travel #timezone").html(timezone);
  } else {
    $("#travel #timezone").html("");
  }
  if (
    typeof max != "undefined" &&
    max.length > 0 &&
    typeof min != "undefined" &&
    timezone.length > 0
  ) {
    $("#travel #weather").html(
      "Max &#x2192; " + max + "&#x2103;   Min &#x2192;" + min + "&#x2103;"
    );
  } else {
    $("#travel #weather").html("");
  }
  if (
    typeof rate1 != "undefined" &&
    rate1.length > 0 &&
    typeof from1 != "undefined" &&
    from1.length > 0 &&
    typeof to1 != "undefined" &&
    to1.length > 0
  ) {
    $("#travel #currency1").html(
      "1 " + from1 + " &#x2194; " + rate1 + " " + to1
    );
  } else {
    $("#travel #currency1").html("");
  }
  if (
    typeof rate2 != "undefined" &&
    rate2.length > 0 &&
    typeof from2 != "undefined" &&
    from2.length > 0 &&
    typeof to2 != "undefined" &&
    to2.length > 0
  ) {
    $("#travel #currency2").html(
      "1 " + from2 + " &#x2194; " + rate2 + " " + to2
    );
  } else {
    $("#travel #currency2").html("");
  }
  if (
    typeof rate3 != "undefined" &&
    rate3.length > 0 &&
    typeof from3 != "undefined" &&
    from3.length > 0 &&
    typeof to3 != "undefined" &&
    to3.length > 0
  ) {
    $("#travel #currency3").html(
      "1 " + from3 + " &#x2194; " + rate3 + " " + to3
    );
  }
}

Template.app_preview_destination_travel.helpers({
  app_settings() {
    return App_General.findOne();
  }
});

Template.app_preview_destination_dos.events({
  "click #refreshDestinationDos"(event, template) {
    updateDos();
  }
});

Template.app_preview_destination_dos.onRendered(function() {
  Meteor.setTimeout(function() {
    updateDos();
  }, 500);
});

Template.app_preview_destination_dos.helpers({
  app_settings() {
    return App_General.findOne();
  },
  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.appDetails &&
      event.appDetails.selectedAppDetails &&
      event.appDetails.selectedAppDetails.indexOf(featureName) > -1
    ) {
      return true;
    }
    return false;
  }
});

function updateDos() {
  let image1 = $(
    "#add-destination-modal #dos .dropify-preview .dropify-render img"
  ).attr("src");
  let do1 = $("#dos #destinationDos1").val();
  let do2 = $("#dos #destinationDos2").val();
  let do3 = $("#dos #destinationDos3").val();
  let do4 = $("#dos #destinationDos4").val();
  let dont1 = $("#dos #destinationDonts1").val();
  let dont2 = $("#dos #destinationDonts2").val();
  let dont3 = $("#dos #destinationDonts3").val();
  let dont4 = $("#dos #destinationDonts4").val();
  let destinationName = $("#overview #destination-location").val();

  if (typeof destinationName != "undefined" && destinationName.length > 0) {
    $("#dos #destination_name1").html(destinationName);
  } else {
    $("#dos #destination_name1").html("");
  }
  if (typeof image1 != "undefined" && image1.length > 0) {
    $("#dos_banner").css("background-image", "url(" + image1 + ")");
  } else {
    $("#dos_banner").css("background", "");
  }
  if (typeof do1 != "undefined" && do1.length > 0) {
    $("#dos #do1").html(do1);
  } else {
    $("#dos #do2").html("");
  }
  if (typeof do2 != "undefined" && do2.length > 0) {
    $("#dos #do2").html(do2);
  } else {
    $("#dos #do2").html("");
  }
  if (typeof do3 != "undefined" && do3.length > 0) {
    $("#dos #do3").html(do3);
  } else {
    $("#dos #do3").html("");
  }
  if (typeof do4 != "undefined" && do4.length > 0) {
    $("#dos #do4").html(do4);
  } else {
    $("#dos #do4").html("");
  }
  if (typeof dont1 != "undefined" && dont1.length > 0) {
    $("#dos #dont1").html(dont1);
  } else {
    $("#dos #dont1").html("");
  }
  if (typeof dont2 != "undefined" && dont2.length > 0) {
    $("#dos #dont2").html(dont2);
  } else {
    $("#dos #dont2").html("");
  }
  if (typeof dont3 != "undefined" && dont3.length > 0) {
    $("#dos #dont3").html(dont3);
  } else {
    $("#dos #dont3").html("");
  }
  if (typeof dont4 != "undefined" && dont4.length > 0) {
    $("#dos #dont4").html(dont4);
  } else {
    $("#dos #dont4").html("");
  }
}

// CODE TO SHOW SLIDESHOW
Template.app_preview_slideshow.onRendered(function() {
  this.subscribe("subevents.event", FlowRouter.getParam("id"));
  this.subscribe("event.size.preferences", FlowRouter.getParam("id"));
  this.subscribe("event.food.preferences", FlowRouter.getParam("id"));
  this.subscribe(
    "event.specialassistance.preferences",
    FlowRouter.getParam("id")
  );
  Meteor.setTimeout(function() {
    $(".owl-carousel").owlCarousel({
      items: 1,
      nav: true,
      // autoplay:true,
      loop: true
    });
    updateItineraryPreview();
  }, 500);
});

Template.app_preview_slideshow.helpers({
  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (
      event &&
      event.appDetails &&
      event.appDetails.selectedAppDetails &&
      event.appDetails.selectedAppDetails.indexOf(featureName) > -1
    ) {
      return true;
    }
    return false;
  },

  appPreferencesSettings() {
    return App_General.findOne();
  },

  showFeedbackScreen() {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (event) {
      if (
        event.appDetails &&
        event.appDetails.featureFeedbackType &&
        event.appDetails.featureFeedbackType == "FeedBack"
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  hasSubevents() {
    return SubEvents.find().count() > 0;
  },

  subeventList() {
    return SubEvents.find();
  },

  SubEventDate() {
    let subevent_details = SubEvents.find().fetch();
    if (subevent_details[0].subEventDate) {
      return subevent_details[0].subEventDate;
    } else {
      return "Event Date";
    }
  },

  SubEventName() {
    let subevent_details = SubEvents.find().fetch();
    if (subevent_details[0].subEventTitle) {
      return subevent_details[0].subEventTitle;
    } else {
      return "Event Name";
    }
  },

  SubEventTimings() {
    let subevent_details = SubEvents.find().fetch();
    if (
      subevent_details[0].subEventStartTime ||
      subevent_details[0].subEventEndTime
    ) {
      return (
        subevent_details[0].subEventStartTime +
        " - " +
        subevent_details[0].subEventEndTime
      );
    } else {
      return "Event Timings";
    }
  },

  SubEventTab1Title() {
    let subevent_details = SubEvents.find().fetch();
    if (subevent_details[0].subEventTab1) {
      return subevent_details[0].subEventTab1;
    } else {
      return "Tab 1 Title";
    }
  },

  SubEventTab2Title() {
    let subevent_details = SubEvents.find().fetch();
    if (subevent_details[0].subEventTab2) {
      return subevent_details[0].subEventTab2;
    } else {
      return "Tab 2 Title";
    }
  },

  SubEventTab3Title() {
    let subevent_details = SubEvents.find().fetch();
    if (subevent_details[0].subEventTab3) {
      return subevent_details[0].subEventTab3;
    } else {
      return "Tab 3 Title";
    }
  },

  SubEventTab1Content() {
    let subevent_details = SubEvents.find().fetch();
    if (subevent_details[0].subEventTab1Content) {
      return subevent_details[0].subEventTab1Content;
    } else {
      return "Tab 1 Content";
    }
  },

  SubEventTab2Content() {
    let subevent_details = SubEvents.find().fetch();
    if (subevent_details[0].subEventTab2Content) {
      return subevent_details[0].subEventTab2Content;
    } else {
      return "Tab 2 Content";
    }
  },

  SubEventTab3Content() {
    let subevent_details = SubEvents.find().fetch();
    if (subevent_details[0].subEventTab3Content) {
      return subevent_details[0].subEventTab3Content;
    } else {
      return "Tab 3 Content";
    }
  },

  SubEventDescription() {
    let subevent_details = SubEvents.find().fetch();
    if (subevent_details[0].subEventDescription) {
      return subevent_details[0].subEventDescription;
    } else {
      return "Description";
    }
  },

  SubEventBanner() {
    let subevent_details = SubEvents.find().fetch();
    if (subevent_details[0].subEventImg) {
      return subevent_details[0].subEventImg;
    } else {
      return "Event Image";
    }
  },

  app_setting() {
    return App_General.findOne();
  },
  destinationName() {
    let app_setting = App_General.findOne();

    if (app_setting.destinationDetails[0].basicInfo.destinationName) {
      return app_setting.destinationDetails[0].basicInfo.destinationName;
    } else {
      return "Destination Name";
    }
  },
  aboutDestination() {
    let app_setting = App_General.findOne();
    if (app_setting.destinationDetails[0].basicInfo.aboutDestination) {
      return app_setting.destinationDetails[0].basicInfo.aboutDestination;
    } else {
      return "About Destination / Details";
    }
  },
  mainImage() {
    let app_setting = App_General.findOne();
    if (app_setting.destinationDetails[0].mainImage) {
      return app_setting.destinationDetails[0].mainImage;
    } else {
      return "";
    }
  },
  otherDetailsImage() {
    let app_setting = App_General.findOne();

    if (app_setting.destinationDetails[0].otherDetailsImage) {
      return app_setting.destinationDetails[0].otherDetailsImage;
    } else {
      return "";
    }
  },
  airport() {
    let app_setting = App_General.findOne();

    if (app_setting.destinationDetails[0].otherDetails.destinationAirportName) {
      return app_setting.destinationDetails[0].otherDetails
        .destinationAirportName;
    } else {
      return "";
    }
  },
  weather() {
    let app_setting = App_General.findOne();
    if (
      app_setting.destinationDetails[0].otherDetails.destinationWeatherMax &&
      app_setting.destinationDetails[0].otherDetails.destinationWeatherMin
    ) {
      return (
        "Max ->" +
        app_setting.destinationDetails[0].otherDetails.destinationWeatherMax +
        " C  Min -> " +
        app_setting.destinationDetails[0].otherDetails.destinationWeatherMin +
        " C"
      );
    } else {
      return "Max -> " + 40 + "C   Min ->" + 20 + "C";
    }
  },
  currency1() {
    let app_setting = App_General.findOne();

    if (
      app_setting.destinationDetails[0].otherDetails.destinationCurrency[0]
        .from &&
      app_setting.destinationDetails[0].otherDetails.destinationCurrency[0]
        .to &&
      app_setting.destinationDetails[0].otherDetails.destinationCurrency[0].rate
    ) {
      return (
        "1 " +
        app_setting.destinationDetails[0].otherDetails.destinationCurrency[0]
          .from +
        "<-->" +
        app_setting.destinationDetails[0].otherDetails.destinationCurrency[0]
          .rate +
        " " +
        app_setting.destinationDetails[0].otherDetails.destinationCurrency[0].to
      );
    } else {
      return "";
    }
  },
  currency2() {
    let app_setting = App_General.findOne();

    if (
      app_setting.destinationDetails[0].otherDetails.destinationCurrency[1]
        .from &&
      app_setting.destinationDetails[0].otherDetails.destinationCurrency[1]
        .to &&
      app_setting.destinationDetails[0].otherDetails.destinationCurrency[1].rate
    ) {
      return (
        "1 " +
        app_setting.destinationDetails[0].otherDetails.destinationCurrency[1]
          .from +
        "<-->" +
        app_setting.destinationDetails[0].otherDetails.destinationCurrency[1]
          .rate +
        " " +
        app_setting.destinationDetails[0].otherDetails.destinationCurrency[1].to
      );
    } else {
      return "";
    }
  },
  currency3() {
    let app_setting = App_General.findOne();

    if (
      app_setting.destinationDetails[0].otherDetails.destinationCurrency[2]
        .from &&
      app_setting.destinationDetails[0].otherDetails.destinationCurrency[2]
        .to &&
      app_setting.destinationDetails[0].otherDetails.destinationCurrency[2].rate
    ) {
      return (
        "1 " +
        app_setting.destinationDetails[0].otherDetails.destinationCurrency[2]
          .from +
        " <-->" +
        app_setting.destinationDetails[0].otherDetails.destinationCurrency[2]
          .rate +
        " " +
        app_setting.destinationDetails[0].otherDetails.destinationCurrency[2].to
      );
    } else {
      return "";
    }
  },
  timezone() {
    let app_setting = App_General.findOne();

    if (app_setting.destinationDetails[0].otherDetails.destinationTimezone) {
      return app_setting.destinationDetails[0].otherDetails.destinationTimezone;
    } else {
      return "";
    }
  },
  tipsImage() {
    let app_setting = App_General.findOne();

    if (app_setting.destinationDetails[0].tipsImage) {
      return app_setting.destinationDetails[0].tipsImage;
    } else {
      return "";
    }
  },
  dos() {
    let app_setting = App_General.findOne();

    if (app_setting.destinationDetails[0].destinationTips.destinationDos) {
      return app_setting.destinationDetails[0].destinationTips.destinationDos;
    } else {
      return "";
    }
  },

  donts() {
    let app_setting = App_General.findOne();
    if (app_setting.destinationDetails[0].destinationTips.destinationDonts) {
      return app_setting.destinationDetails[0].destinationTips.destinationDonts;
    } else {
      return "";
    }
  },

  places(index) {
    let app_setting = App_General.findOne();
    if (
      app_setting.destinationDetails[0].placesToVisit.destinationPlacesToVisit[
        index
      ]
    ) {
      return app_setting.destinationDetails[0].placesToVisit
        .destinationPlacesToVisit[index];
    } else {
      return "";
    }
  },
  placeImage1() {
    let app_setting = App_General.findOne();
    if (app_setting.destinationDetails[0].placesToVisitImage1) {
      return app_setting.destinationDetails[0].placesToVisitImage1;
    } else {
      return "";
    }
  },
  placeImage2() {
    let app_setting = App_General.findOne();
    if (app_setting.destinationDetails[0].placesToVisitImage2) {
      return app_setting.destinationDetails[0].placesToVisitImage2;
    } else {
      return "";
    }
  },
  placeImage3() {
    let app_setting = App_General.findOne();
    if (app_setting.destinationDetails[0].placesToVisitImage3) {
      return app_setting.destinationDetails[0].placesToVisitImage3;
    } else {
      return "";
    }
  },
  appWelcomeSettings() {
    alert(1);
    return App_General.findOne();
  },

  sizePreference() {
    let preferences = SizePreferences.findOne({
      eventId: FlowRouter.getParam("id")
    });
    return preferences
      ? preferences
      : {
          sizePreferences: ["", "", ""]
        };
  },

  foodPreference() {
    let preferences = FoodPreferences.findOne({
      eventId: FlowRouter.getParam("id")
    });
    return preferences
      ? preferences
      : {
          foodPreferences: ["", "", ""]
        };
  },

  assistanceData() {
    let ass = SpecialAssistancePreferences.findOne();
    if (ass) {
      let options = ass.assistanceOptions;
      while (options.length < 3) {
        options.push("");
      }
      ass.assistanceOptions = options;
      Meteor.setTimeout(() => {
        Materialize.updateTextFields();
      }, 100);
      return ass;
    }
    return {
      assistanceOptions: ["", "", ""]
    };
  }
});

Template.app_preview_slideshow.events({
  "click .slideshowbtn"(event, template) {
    event.preventDefault();
    let section_id = template.$(event.target).attr("data-section");
    showSlideShow(section_id);
  }
});

function showSlideShow(id) {
  $(".appslideshow").addClass("hide");
  $("#" + id).removeClass("hide");
}

function updateContact() {
  let image1 = $(
    "#app_contact_settings .dropify-preview .dropify-render img"
  ).attr("src");
  let contact_counter = $("#contact_counter").val();
  let title1 = $(".title1").val();
  let number1 = $(".number1").val();
  let title2 = $(".title2").val();
  let number2 = $(".number2").val();
  let title3 = $(".title3").val();
  let number3 = $(".number3").val();
  let title4 = $(".title4").val();
  let number4 = $(".number4").val();
  let title5 = $(".title5").val();
  let number5 = $(".number5").val();

  if (typeof image1 != "undefined" && image1.length > 0) {
    $(".app-setting .app-preview .app-body").css(
      "background-image",
      "url(" + image1 + ")"
    );
  }

  if (
    (typeof title1 != "undefined" && title1.length > 0) ||
    (typeof number1 != "undefined" && number1.length > 0)
  ) {
    $("#setTitle1").text(title1);
    $("#setNumber1").text(number1);
    if ($(".hidden_contact1").hasClass("hide")) {
      $(".hidden_contact1").removeClass("hide");
    }
  } else {
    if (!$(".hidden_contact1").hasClass("hide")) {
      $(".hidden_contact1").addClass("hide");
    }
  }

  if (
    (typeof title2 != "undefined" && title2.length > 0) ||
    (typeof number2 != "undefined" && number2.length > 0)
  ) {
    $("#setTitle2").text(title2);
    $("#setNumber2").text(number2);
    if ($(".hidden_contact2").hasClass("hide")) {
      $(".hidden_contact2").removeClass("hide");
    }
  } else {
    if (!$(".hidden_contact2").hasClass("hide")) {
      $(".hidden_contact2").addClass("hide");
    }
  }

  if (
    (typeof title3 != "undefined" && title3.length > 0) ||
    (typeof number3 != "undefined" && number3.length > 0)
  ) {
    $("#setTitle3").text(title3);
    $("#setNumber3").text(number3);
    if ($(".hidden_contact3").hasClass("hide")) {
      $(".hidden_contact3").removeClass("hide");
    }
  } else {
    if (!$(".hidden_contact3").hasClass("hide")) {
      $(".hidden_contact3").addClass("hide");
    }
  }

  if (
    (typeof title4 != "undefined" && title4.length > 0) ||
    (typeof number4 != "undefined" && number4.length > 0)
  ) {
    $("#setTitle4").text(title4);
    $("#setNumber4").text(number4);
    if ($(".hidden_contact4").hasClass("hide")) {
      $(".hidden_contact4").removeClass("hide");
    }
  } else {
    if (!$(".hidden_contact4").hasClass("hide")) {
      $(".hidden_contact4").addClass("hide");
    }
  }

  if (
    (typeof title5 != "undefined" && title5.length > 0) ||
    (typeof number5 != "undefined" && number5.length > 0)
  ) {
    $("#setTitle5").text(title5);
    $("#setNumber5").text(number5);
    if ($(".hidden_contact5").hasClass("hide")) {
      $(".hidden_contact5").removeClass("hide");
    }
  } else {
    if (!$(".hidden_contact5").hasClass("hide")) {
      $(".hidden_contact5").addClass("hide");
    }
  }
}
