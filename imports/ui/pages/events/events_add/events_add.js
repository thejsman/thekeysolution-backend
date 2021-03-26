import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { updateEventBasicDetails, updateEventHostDetails, updateEventFeatureDetails, updateEventAppDetails, updateEventImages } from '../../../../api/events/methods.js';

import {
  insertDraftEvent,
  addHostDetails,
  addFeatureDetails,
  addAppDetails,
  addUploadedFiles
} from '../../../../api/draftevents/methods.js';

import { insertEvent, fetchEventData } from '../../../../api/events/methods.js';

import { uploadFile } from '../../../components/upload/uploadFile.js';
import _ from 'lodash';

import '../../../components/preloader/preloaders.js';
import './events_add.scss';
import './events_add.html';

let baseObj = {
};

var collapsible = null;
var sections = null;
var overallData = new ReactiveVar({});
var existingId = new ReactiveVar();
var isLoading = new ReactiveVar(false);
var isEditing = new ReactiveVar(false);

function disableAll() {
  sections.addClass('disabled');
}

function enableSection(index) {
  disableAll();
  sections.eq(index).removeClass('disabled');
  collapsible.collapsible('open', index);
}

function doubleEnable(index) {
  enableSection(index);
  enableSection(index);
}

function setData(data, key) {

  var dataObj = overallData.get();
  dataObj[key] = data;
  overallData.set(dataObj);
}

function SetLoading(val) {
  isLoading.set(val);
}

function FinalizeEventData() {
  if (isEditing.get()) {
    FlowRouter.go('events.summary', { id: FlowRouter.getQueryParam("eventId") });
  }
  else {
    insertEvent.call(existingId.get(), (err, res) => {
      if (err) {
        showError(err);
      }
      else {
        FlowRouter.go('events.list');
      }
    });
  }
}

let selects = {
  'event-type': 'basicDetails,eventType',
  'subevent-sorting': 'basicDetails,eventSubeventSorting',
  'featureRSVPOption': 'featureDetails,featureRSVPOption'
};

Template.events_add.onRendered(function () {
  this.$('.tooltipped').tooltip({ delay: 50 });
  collapsible = this.$('.collapsible').collapsible();
  sections = this.$('.page');
  overallData.set(baseObj);
  existingId.set(false);
  let editing = FlowRouter.getQueryParam("eventId");
  isEditing.set(!!editing);
  if (editing) {
    fetchEventData.call(editing, (err, res) => {
      if (err) return;
      overallData.set(res);
      _.each(selects, (s, key) => {
        let vals = s.split(',');
        this.$('#' + key).val(res[vals[0]][vals[1]]);
      });
      Meteor.setTimeout(() => {
        Materialize.updateTextFields();
        this.$('select').material_select();
        let destinations = res.basicDetails.eventDestination.map(d => {
          return {
            tag: d
          }
        });
        this.$('.destination-chips').material_chip({
          data: destinations
        });
      }, 100);
    });
  }
  else {
    this.$('.destination-chips').material_chip();
  }
});

Template.events_add.helpers({
  overallData() {
    return overallData.get();
  },

  isLoading() {
    return isLoading.get() ? "disabled" : "";
  }
});

Template.events_add_basic_details.onRendered(function () {
  this.$('.datepicker').pickadate({
    selectMonths: true,
    selectYears: 15,
    today: 'Today',
    clear: 'Clear',
    close: 'Ok',
    min: new Date(),
    closeOnSelect: false,
    onStart: function () {
      var date = new Date()
      this.set('select', [date.getFullYear(), date.getMonth(), date.getDate()])
    }
  });
  let self = this;
  this.$('#event_start').on('change', function () {
    let val = self.$(this).val();
    self.$('#event_end').val(val)
    self.$('#event_end').pickadate('picker').set('min', val);
  });
  this.$('select').material_select();
});

Template.events_add_basic_details.helpers({
  data() {
    let p = overallData.get();
    if (p.basicDetails) {
      return p.basicDetails;
    }
    return {};
  }
});

Template.events_add_basic_details.events({
  'submit #event-basic-details'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();

    if (existingId.get()) {
      data.eventId = existingId.get();
    }
    let destinationList = template.$('.destination-chips').material_chip('data').map(d => d.tag);
    data.eventDestination = destinationList;
    SetLoading(true);
    let cb = (err, res) => {
      SetLoading(false);
      if (err) {
        showError(err);
      }
      else {
        existingId.set(res);
        setData(data, 'basicDetails');
        enableSection(1);
      }
    };
    if (isEditing.get()) {
      data.eventId = FlowRouter.getQueryParam("eventId");
      updateEventBasicDetails.call(data, cb);
    }
    else {
      insertDraftEvent.call(data, cb);
    }
  }
});

Template.events_add_host_details.helpers({
  data() {
    let p = overallData.get();
    return p ? p.hostDetails : {};
  }
});

Template.events_add_host_details.events({
  'submit #event-host-details'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    data.eventId = existingId.get();
    SetLoading(true);
    let cb = (err, res) => {
      SetLoading(false);
      if (err) {
        showError(err);
      }
      else {
        setData(data, 'hostDetails');
        enableSection(2);
      }
    };
    if (isEditing.get()) {
      data.eventId = FlowRouter.getQueryParam("eventId");
      updateEventHostDetails.call(data, cb);
    }
    else {
      addHostDetails.call(data, cb);
    }
  }
});

let featureSelectAll = new ReactiveVar(false);
Template.events_add_feature_details.onRendered(function () {
  this.$('.datepicker').pickadate({
    selectMonths: true,
    selectYears: 15,
    today: 'Today',
    clear: 'Clear',
    close: 'Ok',
    closeOnSelect: false
  });
  this.autorun(() => {
    let selectAll = featureSelectAll.get();
    Meteor.setTimeout(() => {
      this.$('select').material_select();
    }, 100);
  });

  this.autorun(() => {
    let p = overallData.get();
    let featureDetails = p.featureDetails;
    if (featureDetails && featureDetails.selectedFeatures && featureDetails.selectedFeatures.length > 0) {
      featureDetails.selectedFeatures.forEach(f => {
        this.$(`[value="${f}"]`).prop('checked', true);
      });

      this.$('#featurePreferences').val(featureDetails.selectedFeatures);
      this.$('#featureRSVPOption').val(featureDetails.featureRSVPOption);
    }
    else {
      this.$('input').prop('checked', false);
      this.$('#featurePreferences').val(null);
      this.$('#featureRSVPOption').val(null);
    }
  });
});

Template.events_add_feature_details.events({
  'submit #event-feature-details'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    data.eventId = existingId.get();
    data.selectedFeatures = data.selectedFeatures ? data.selectedFeatures : [];
    let cb = (err, res) => {
      SetLoading(false);
      if (err) {
        showError(err);
      }
      else {
        setData(data, 'featureDetails');
        enableSection(3);
      }
    }
    SetLoading(true);
    if (isEditing.get()) {
      data.eventId = FlowRouter.getQueryParam("eventId");
      updateEventFeatureDetails.call(data, cb);
    }
    else {
      addFeatureDetails.call(data, cb);
    }
  },

  'click #selectAll'(event, template) {
    template.$('input:checkbox').not(this).prop('checked', event.target.checked);
    template.$('#featurePreferences option').prop('selected', event.target.checked);
    featureSelectAll.set(event.target.checked);
  }
});

let featureSelectAllApp = new ReactiveVar(false);
Template.events_add_app_details.onRendered(function () {
  this.autorun(() => {
    let selectAll = featureSelectAllApp.get();
    Meteor.setTimeout(() => {
      this.$('select').material_select();
    }, 100);
  });
  this.autorun(() => {
    let p = overallData.get();
    console.log(p);
    let featureDetails = p.appDetails;
    if (featureDetails && featureDetails.selectedAppDetails && featureDetails.selectedAppDetails.length > 0) {
      featureDetails.selectedAppDetails.forEach(f => {
        this.$(`[value="${f}"]`).prop('checked', true);
      });

      Meteor.setTimeout(() => {
        this.$('#featureFeedBackOrWishList').val(featureDetails.featureFeedbackType);
        this.$('#featureGuestInfo').val(featureDetails.selectedAppGuestInfo);
        this.$('#featureSocialMedia').val(featureDetails.selectedAppSocialDetails);
        this.$('#featurePreferences').val(featureDetails.selectedAppPreferences);
        this.$('select').material_select();
      }, 100);
    }
    else {
      this.$('input').prop('checked', false);
      this.$('#featureFeedBackOrWishList').val(null);
      this.$('#featureSocialMedia').val(null);
      this.$('#featurePreferences').val(null);
    }
  });

});

Template.events_add_app_details.events({
  'submit #event-app-details'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    data.eventId = existingId.get();
    data.selectedAppDetails = data.selectedAppDetails ? data.selectedAppDetails : [];
    SetLoading(true);
    let cb = (err, res) => {
      SetLoading(false);
      if (err) {
        showError(err);
      }
      else {
        setData(data, 'appDetails');
        enableSection(4);
      }
    };
    if (isEditing.get()) {
      data.eventId = FlowRouter.getQueryParam("eventId");
      updateEventAppDetails.call(data, cb);
    }
    else {
      addAppDetails.call(data, cb);
    }
  },

  'click #selectAllApp'(event, template) {
    template.$('input:checkbox').not(this).prop('checked', event.target.checked);
    template.$('#featureSocialMedia option').prop('selected', event.target.checked);
    template.$('#featurePreferences option').prop('selected', event.target.checked);
    template.$('#featureGuestInfo option').prop('selected', event.target.checked);
    featureSelectAllApp.set(event.target.checked);
  }
});

Template.events_file_uploads.onRendered(function () {
  let eventLogoMsg = {
    messages: {
      'default': 'Event Logo <br>Size: 100px X 100px <br>Format: PNG or JPG Only',
      'replace': 'Drag and drop or click to replace <br>Size: 100px X 100px <br>Format: PNG or JPG Only',
      'remove': 'Remove Event Logo',
      'error': 'Ooops, something wrong happended.'
    },
    maxHeight: 101,
    maxWidth: 101,
    allowedFileExtensions: "png jpg jpeg"
  };

  let eventBackgroundMsg = {
    messages: {
      'default': 'Event Background <br>Size: 300px X 190px<br>Format: PNG or JPG Only',
      'replace': 'Drag and drop or click to replace <br>Size: 300px X 190px<br>Format: PNG or JPG Only',
      'remove': 'Remove Event Banner',
      'error': 'Ooops, something wrong happended.'
    },
    maxHeight: 191,
    maxWidth: 301,
    allowedFileExtensions: "png jpg jpeg"
  };
  this.initialized = false;
  let editing = FlowRouter.getQueryParam("eventId");;
  if (!!editing) {
    this.autorun(() => {
      if (this.initialized) return;
      let p = overallData.get();
      if (p && p.basicDetails) {
        console.log(p.uploadedData);
        if (p.uploadedData && p.uploadedData.uploadedURLS) {
          if (p.uploadedData.uploadedURLS.eventLogo) {
            eventLogoMsg.defaultFile = p.uploadedData.uploadedURLS.eventLogo;
            this.$('.file-eventLogo').dropify(eventLogoMsg);
          }
          if (p.uploadedData.uploadedURLS.eventBackground) {
            eventBackgroundMsg.defaultFile = p.uploadedData.uploadedURLS.eventBackground;
            this.$('.file-eventBanner').dropify(eventBackgroundMsg);
          }
          this.initialized = true;
        }
        else {
          this.$('.file-eventLogo').dropify(eventLogoMsg);
          this.$('.file-eventBanner').dropify(eventBackgroundMsg);
          this.initialized = true;
        }
      }
    });
  }
  else {
    this.$('.file-eventLogo').dropify(eventLogoMsg);
    this.$('.file-eventBanner').dropify(eventBackgroundMsg);
    this.initialized = true;
  }
});



// The following function simply replicates the default behavior.
function fileUploadName(f, name) {
  if (!f) {
    return "";
  }
  var extension = f.type.split("/")[1];
  return name + "." + extension;
}

function toArray(fileList) {
  return Array.prototype.slice.call(fileList);
}

function AddUploadedImages(files, fileNames, eventId) {
  var data = {
    eventId: eventId,
    uploadedURLS: {}
  };
  _.each(files, (file) => {
    if (file.file["name"] === fileNames.logoFileName) {
      data.uploadedURLS.eventLogo = file.secure_url;
      return;
    }
    else if (file.file["name"] === fileNames.backgroundFileName) {
      data.uploadedURLS.eventBackground = file.secure_url;
      return;
    }
  });


  if (isEditing.get()) {
    let eventId = FlowRouter.getQueryParam("eventId");
    data.eventId = eventId;
    updateEventImages.call(data, (err, res) => {
      SetLoading(false);
      if (err) {
        showError(err);
      }
      else {
        FlowRouter.go('events.summary', { id: eventId });
      }
    });
  }
  else {
    addUploadedFiles.call(data, (err, res) => {
      SetLoading(false);
      console.log(err, res);
      if (err) {
        showError(err);
      }
      else {
        FinalizeEventData();
      }
    });
  }
}

let uploadedFiles = new ReactiveVar([]);
let isUploading = new ReactiveVar(false);
let fileNames = {};
let totalCount = 2;

Template.events_file_uploads.onRendered(function () {
  fileNames = {};
  isUploading.set(false);
  uploadedFiles.set([]);
  this.autorun(() => {
    if (isUploading.get()) {
      if (uploadedFiles.get().length >= totalCount) {
        AddUploadedImages(uploadedFiles.get(), fileNames, existingId.get());
      }
    }
  });
});

Template.events_file_uploads.helpers({
  percentUploaded() {
    var total = 0;
    var files = S3.collection.find();
    files.forEach(file => {
      total += file.percent_uploaded;
    });

    if (files.count() > 0) {
      return (total / files.count()) + "%";
    }
    return "5%";
  },

  uploadedData() {
    let p = overallData.get();
    let editing = FlowRouter.getQueryParam("eventId");
    console.log(p.uploadedData);
    return !!editing || (p && p.uploadedData && p.uploadedData.uploadedURLS ? p.uploadedData.uploadedURLS : false);
  }
});

Template.events_file_uploads.events({
  'submit #event-file-uploads'(event, template) {
    event.preventDefault();
    var fileInputs = template.$('input[type="file"]');
    var fileList = [];
    fileInputs.each((index, element) => {
      var uniqueId = Random.id();
      if (element.files.length < 1) {
        return;
      }
      element.files[0].upload_name = fileUploadName(element.files[0], uniqueId);
      fileList = toArray(fileList).concat(toArray(element.files));
    });

    if (fileList.length > 1) {
      SetLoading(true);
      uploadedFiles.set([]);
      fileNames.logoFileName = fileList[0].upload_name;
      fileNames.backgroundFileName = fileList[1].upload_name;
      isUploading.set(true);

      S3.upload({
        files: fileList,
        path: 'bmtimages',
        unique_name: false
      }, (err, res) => {
        if (err) {
          showError("Uploading Images failed");
          isUploading.set(false);
        }
        else {
          var uploaded = uploadedFiles.get();
          uploaded.push(res);
          uploadedFiles.set(uploaded);
        }
      });
    }
    else {
      FinalizeEventData();
      // showError("Please select both logo and banner images");
    }
  }
});


Template.event_details_change_button.helpers({
  dataExists() {
    return !!this.data;
  },

  enabled() {
    return isLoading.get() ? "disabled" : "";
  }
});

Template.event_details_change_button.events({
  'click .change-button'(event, template) {
    doubleEnable(template.pageNo);
  }
});

Template.event_add_progress.helpers({
  loading() {
    return isLoading.get();
  }
});

Template.event_add_progress_determinate.helpers({
  loading() {
    return isUploading.get();
  },

  type() {
    return "determinate";
  }
});

Template.event_add_submit_button.helpers({
  enabled() {
    return isLoading.get() ? "disabled" : "";
  }
});
