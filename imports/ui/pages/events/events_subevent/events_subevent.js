import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Events } from '../../../../api/events/events.js';
import { SubEvents } from '../../../../api/subevents/subevents.js';
import { insertSubevent, updateSubevent, deleteSubevent } from '../../../../api/subevents/methods.js';
import { UploadFiles } from '../../../../api/upload/S3Uploads.js';
import _ from 'lodash';
import { App_General } from '../../../../api/app_general/app_general.js';
import moment, { now } from 'moment';
import { activityRecordInsert } from '../../../../api/activity_record/methods';
import './events_subevent.scss';
import '../events_app/events_app.scss';
import './events_subevent.html';
import './events_subevent_add.html';

let editing = new ReactiveVar(false)
let editData = new ReactiveVar({})
let previewData = new ReactiveVar({})
let editingId = new ReactiveVar("")
let imageHolder = null;


Template.events_subevent.onRendered(function () {
  this.subscribe('subevents.event', FlowRouter.getParam("id"));
  this.$('.tooltipped').tooltip({ delay: 50 });
  this.$('.tooltip-icon').tooltip({ delay: 50 });
  this.$('input#subevent_name').characterCounter();

  Meteor.setTimeout(() => {
    Materialize.updateTextFields();
  }, 100);
  let dr = this.$('.dropify').dropify({
    messages: {
      'default': 'Sub event Image <br>Size: 1200px X 520px <br>Format: JPG Only',
      'replace': 'Drag and drop or click to replace <br>Size: 1200px X 520px <br>Format: JPEG',
      'remove': 'Remove Sub event Image',
      'error': 'Ooops, something wrong happended.'
    }
  });
  imageHolder = dr.data('dropify');
  this.autorun(() => {
    var event = Events.find().count();
    if (event > 0) {
      var thisEvent = Events.findOne();
      var eventStartDate = thisEvent.basicDetails.eventStart;
      Meteor.setTimeout(() => {
        let d = Date.parse(eventStartDate);
        let o = this.$('.datepicker').pickadate('picker');
        if (o) {
          o.set('select', d);
        }
      }, 1000);
    }
  });

  var picker = this.$('.datepicker').pickadate({
    closeOnSelect: true,
    selectYears: 20,
    today: 'Today'
  });

  this.$('.timepicker').pickatime({
    default: 'now',
    fromnow: 0,
    twelvehour: true,
    donetext: 'OK',
    cleartext: 'Clear',
    canceltext: 'Cancel',
    autoclose: false,
    ampmclickable: true,
    onStart(o) {
      console.log(o);
    },
    onSet(o) {
      console.log(o);
      Materialize.updateTextFields();
    }
  });

  this.autorun(() => {
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    }, 100);
  });
 
});

Template.events_subevent.helpers({
  hasSubevents() {
    return SubEvents.find().count() > 0;
  },
  subeventList() {
    return SubEvents.find({}).fetch().sort((a, b) => {
      let aTime = moment(a.subEventDate + ' ' + a.subEventStartTime, 'DD MMMM, YYYY HH:mm a');
      let bTime = moment(b.subEventDate + ' ' + b.subEventStartTime, 'DD MMMM, YYYY HH:mm a');
      return aTime.valueOf() - bTime.valueOf();
    });
  },
  eventInfo() {
    var event = Events.findOne();
    if (event) {
      return event.basicDetails;
    }
    return false;
  },
  addSubEventPath() {
    return FlowRouter.path('events.subevents.add', { id: FlowRouter.getParam("id") });
  }
});

Template.events_subevent_add.onRendered(function () {
  this.subscribe('subevents.event', FlowRouter.getParam("id"));
  this.$('textarea#subEventDescription').characterCounter();
  this.$('.datepicker').pickadate({
    selectMonths: true,
    selectYears: 15
  });

// Chrome date & time flicker issue
  this.$('.timepicker').on('mousedown', (event) => event.preventDefault())
  

  this.$('.timepicker').pickatime({
    default: 'now',
    fromnow: 0,
    twelvehour: true,
    donetext: 'OK',
    cleartext: 'Clear',
    canceltext: 'Cancel',
    autoclose: false,
    ampmclickable: true,
    onSet: function (o) {
      console.log(o);
    }
  });
  this.$('.dropify').dropify({
    maxHeight: 701,
    maxWidth: 1273,
    messages: {
      'default': 'Event Image <br>Size: 1200px x 520px<br>Format: JPEG'
    }
  });
  if (FlowRouter.current().route.name === 'events.subevents.edit') {
    let selects = ['subEventTab1', 'subEventTab2', 'subEventTab3', 'subEventDestination'];
    let ev = SubEvents.findOne(editingId.get());
    editData.set(ev);
    previewData.set(editData.get())
    updatePreview()
    selects.forEach(s => {
      this.$(`#${s}`).val(editData.get()[s]);
    });
  } else {
    editing.set(false)
    editData.set('')
    previewData.set('')
    updatePreview()
  }
  this.$('.tab-select').material_select();
  this.autorun(() => {
    let event = Events.findOne();
    if (event) {
      Meteor.setTimeout(() => {
        this.$('#subEventDestination').material_select();
        var file = $('#input-file-now').attr('data-default-file');
        if (typeof file != 'undefined' && file.length > 0) {
          $('.dropify-render').html('<img src="' + file + '">');
          $('.dropify-wrapper .dropify-preview').css('display', 'block');
        }
        $('select').material_select();
      }, 500);
    }
  });
});

Template.events_subevent_add.helpers({
  destinationList() {
    let event = Events.findOne();
    return event ? event.basicDetails.eventDestination : [];
  },
  title() {
    return editing.get() ? "Edit Subevent" : "Add Subevent";
  },

  buttonText() {
    return editing.get() ? "Update" : "Submit";
  },

  subevent() {
    return SubEvents.findOne({ _id: FlowRouter.getParam('subEventId') })
  }
});

Template.events_subevent_add.events({
  'click #update_app_preview'(event, template) {
    event.preventDefault();
    updatePreview();
  },

  'submit #add-subevent'(event, template) {
    event.preventDefault();
    let form = template.$(event.target);
    let data = form.serializeObject();
    data.eventId = FlowRouter.getParam('id');
    let fileInputs = template.$('input[type="file"]');
    const imageChanged = fileInputs.val()
    const subEventImg = event.target.subEventImg.getAttribute('data-default-file')

    if (imageChanged && fileInputs.length > 0) {
      UploadFiles(fileInputs, 1, true).then((fs) => {
        data = Object.assign(data, fs);
        AddNewEvent(data, form[0], template);
      }).catch(e => {
        showError(e);
      });
    } else {
      data.subEventImg = subEventImg;
      AddNewEvent(data, form[0], template);
    }
  }
});

function AddNewEvent(data, form, template) {

  let successMessage = editing.get() ? "Subevent Updated" : "Subevent Added";
  const activityEvent = editing.get() ? 'Update' : 'Add';
  let cb = (err, res) => {
    if (err) {
      showError(err);
    }
    else {
      showSuccess(successMessage);
      form.reset();
      editing.set(false)
      window.history.back()
      activityInsertData = {
        eventId: data.eventId,
        activityModule: 'App Settings',
        activitySubModule: 'Sub-Event',
        event: activityEvent,
        activityMessage: successMessage + ' - ' + data.subEventTitle
      }
      activityRecordInsert(activityInsertData);
    }
  };

  if (editing.get()) {
    data.subeventId = editingId.get()
    updateSubevent.call(data, cb)
  }
  else {
    insertSubevent.call(data, cb)
  }
}

Template.subevent_card.events({
  'click .edit-subevent-button'(event, template) {
    let eventId = FlowRouter.getParam("id");
    let editId = template.data.info._id;
    editing.set(true);
    editingId.set(editId);
    FlowRouter.go('events.subevents.edit', { id: eventId, subEventId: editId });
  },

  'click .click_delete-subevent'(event, template) {
    mbox.confirm('This cannot be undone', function (yes) {
      if (yes) {
        deleteSubevent.call(template.data.info._id, (err, res) => {
          if (err) {
            showError(err);
          }
          else {
            showSuccess("Subevent deleted");
            activityInsertData = {
              eventId: template.data.info.eventId,
              activityModule: 'App Settings',
              activitySubModule: 'Sub-Event',
              event: 'Delete',
              activityMessage: `Sub-Event deleted - ${template.data.info.subEventTitle}`
            }
            activityRecordInsert(activityInsertData);
          }
        });
      }
    });
  }
});

Template.app_preview_subevent.onRendered(function () {
  this.autorun(() => {
    previewData.set(editData.get());
    updatePreview();
  })
})

Template.app_preview_subevent.helpers({
  appSubeventSettings() {
    return App_General.findOne();
  },
  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (event && event.appDetails && event.appDetails.selectedAppDetails && event.appDetails.selectedAppDetails.indexOf(featureName) > -1) {
      return true;
    }
    return false;
  },
  subEventData() {
    return previewData.get();
  }
});

function updatePreview() {
  let form = $('#add-subevent');
  let data = form.serializeObject();
  data.subEventImg = $('.dropify-render img').attr('src')
  previewData.set(data);
}