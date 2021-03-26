import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { UploadFiles } from '../../../../../api/upload/S3Uploads.js';
import { ReactiveVar } from 'meteor/reactive-var'
import { mbox } from '../../../../components/mbox/mbox'
import { showError, showSuccess } from '../../../../components/notifs/notifications.js'
import { Speakers } from '../../../../../api/speakers/speakers'
import { insertSpeaker, updateSpeaker, deleteSpeaker } from '../../../../../api/speakers/methods'
import { App_General } from '../../../../../api/app_general/app_general'
import { activityRecordInsert } from '../../../../../api/activity_record/methods';

import './speakers.html'
import './speakers.scss'

let editId = new ReactiveVar(null)
let previewData = new ReactiveVar({})

// All Speakers
Template.app_speakers.onRendered(function () {
  this.subscribe('speakers.event', FlowRouter.getParam("id"))
})

Template.app_speakers.helpers({
  speakers() {
    return Speakers.find({}, { sort: { sequence: 1 } })
  },
  addPath() {
    return FlowRouter.path('events.app.speakers.add', { id: FlowRouter.getParam("id") });
  }
})

// Add add_speaker
Template.add_speaker.onRendered(function () {
  this.$('.dropify').dropify();
  if (FlowRouter.current().route.name === 'events.app.speakers.edit') {
    this.autorun(() => {
      this.subscribe('speakers.item', FlowRouter.getParam("speakerId"))
    })
    editId.set(FlowRouter.getParam("speakerId"))
    let speaker = Speakers.findOne(editId.get())
    previewData.set(speaker)
  } else {
    $('.dropify-preview').hide()
    editId.set(null)
    previewData.set(null)
  }
})

Template.add_speaker.helpers({
  title() {
    if (editId.get()) {
      return 'Edit Speaker Information'
    }
    return 'Add New Speaker Information'
  },
  buttonText() {
    if (editId.get()) {
      return 'Update Speaker'
    }
    return 'Save New Speaker'
  },
  speaker() {
    if (editId.get()) {
      return Speakers.findOne({ _id: editId.get() })
    }
    return ''
  }
})

// Add / Edit Speakers
function updateSpeackers(data, form, template) {
  let successMessage = editId.get() ? "Speaker Updated" : "Speaker Added";
  const eventId = FlowRouter.getParam('id');
  const activityEvent = editId.get() ? 'Update' : 'Add';
  let cb = (err, res) => {
    if (err) {
      showError(err);
    }
    else {
      showSuccess(successMessage);
      form.reset();
      editId.set(null);
      window.history.back();
      //code to insert data in Activity Record       
      activityInsertData = {
        eventId: eventId,
        activityModule: 'App Settings',
        activitySubModule: 'Speakers',
        event: activityEvent,
        activityMessage: successMessage + ' - ' + data.name
      }
      activityRecordInsert(activityInsertData);
    }
  };

  if (editId.get()) {
    data.speakerId = editId.get()
    updateSpeaker.call(data, cb)
  }
  else {
    insertSpeaker.call(data, cb)
  }
}

Template.add_speaker.events({
  'submit #speaker-form'(event, template) {
    event.preventDefault()
    let form = template.$(event.target)
    let data = form.serializeObject()
    data.eventId = FlowRouter.getParam("id")
    let fileInputs = template.$('input[type="file"]')
    const imageChanged = fileInputs.val()
    const image = event.target.image.getAttribute('data-default-file')

    if (imageChanged && fileInputs.length > 0) {
      UploadFiles(fileInputs, 1, false).then((fs) => {
        data = Object.assign(data, fs);
        updateSpeackers(data, form[0], template)
      }).catch(e => {
        showError(e);
      });
    } else {
      data.image = image;
      updateSpeackers(data, form[0], template)
    }
  },
  'click #update_app_preview'(event, template) {
    event.preventDefault()
    let form = $('#speaker-form')
    let data = form.serializeObject()
    previewData.set(data)
  }
})

Template.speaker_card.events({
  'click .click_edit-button'(event, template) {
    event.preventDefault();
    let data = template.data.speaker
    editId.set(data._id)
    FlowRouter.go('events.app.speakers.edit', { id: FlowRouter.getParam("id"), speakerId: editId.get() })
  },
  'click .click_delete-button'(event, template) {
    event.stopPropagation();
    const eventId = FlowRouter.getParam("id");
    mbox.confirm("Are you sure you want to delete this?", (yes) => {
      if (yes) {
        deleteSpeaker.call(template.data.speaker._id, (err, res) => {
          if (!err) {
            showSuccess("Speaker Deleted")
            //code to insert activity record
            activityInsertData = {
              eventId: eventId,
              activityModule: 'App Settings',
              activitySubModule: 'Speaker',
              event: 'Delete',
              activityMessage: 'Speaker deleted' + ' - ' + template.data.speaker.name
            }
            activityRecordInsert(activityInsertData);
          } else {
            showError(err)
          }
        });
      }
    });
  }
})

Template.app_preview_speaker.helpers({
  appGeneralSettings() {
    return App_General.findOne()
  },

  pageInfo() {
    return previewData.get()
  },

  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (event && event.appDetails && event.appDetails.selectedAppDetails && event.appDetails.selectedAppDetails.indexOf(featureName) > -1) {
      return true
    }
    return false
  },
})