import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { UploadFiles } from '../../../../../api/upload/S3Uploads'
import { ReactiveVar } from 'meteor/reactive-var'
import { mbox } from '../../../../components/mbox/mbox'
import { showError, showSuccess } from '../../../../components/notifs/notifications.js'
import { Sponsors } from '../../../../../api/sponsors/sponsors'
import { insertSponsor, updateSponsor, deleteSponsor } from '../../../../../api/sponsors/methods'
import { App_General } from '../../../../../api/app_general/app_general'
import { activityRecordInsert } from '../../../../../api/activity_record/methods';
import './sponsors.html'
import './sponsors.scss'

let editId = new ReactiveVar(null)
let previewData = new ReactiveVar({})
// All Sponsors

Template.app_sponsors.onRendered(function(){
  this.subscribe('sponsors.event', FlowRouter.getParam("id"))
})

Template.app_sponsors.helpers({
  sponsors(){
    return Sponsors.find({})
  },
  addPath(){
    return FlowRouter.path('events.app.sponsors.add',{ id: FlowRouter.getParam("id")});
  }
})

// Add add_sponsor
Template.add_sponsor.onRendered(function(){
  this.$('.dropify').dropify();
  if(FlowRouter.current().route.name === 'events.app.sponsors.edit'){
    this.autorun(() => {
      this.subscribe('sponsors.item', FlowRouter.getParam("sponsorId"))
    })
    editId.set(FlowRouter.getParam("sponsorId"))
    let sponsor = Sponsors.findOne(editId.get())
    previewData.set(sponsor)
  } else {
    $('.dropify-preview').hide()
    editId.set(null)
    previewData.set(null)
  }
})

Template.add_sponsor.helpers({
  title(){
    if(editId.get()){
      return 'Edit Sponsor Information'
    }
    return 'Add New Sponsor Information'
  },
  buttonText(){
    if(editId.get()){
      return 'Update Sponsor'
    }
    return 'Save New Sponsor'
  },
  sponsor(){
    if(editId.get()){
      return Sponsors.findOne({_id : editId.get()})
    }
    return ''
  }
})

// Add / Edit Sponsors
function updateSpeackers(data, form, template) {

  let successMessage = editId.get() ? "Sponsor Updated" : "Sponsor Added";
  const eventId = FlowRouter.getParam("id");
  const activityEvent = editId.get() ? 'Update' : 'Add'
  let cb = (err, res) => {
    if (err) {
      showError(err); 
    }
    else {
      showSuccess(successMessage);
      form.reset();
      editId.set(null);
      window.history.back();
      //code to insert activity record
      activityInsertData = {
        eventId: eventId,
        activityModule: 'App Settings',
        activitySubModule: 'Sponsors',
        event: activityEvent,
        activityMessage: successMessage + ' - ' + data.name
      }
      activityRecordInsert(activityInsertData);
    }
  };

  if (editId.get()) {
    data.sponsorId = editId.get()
    updateSponsor.call(data, cb)
  }
  else {
    insertSponsor.call(data, cb)
  }
}

Template.add_sponsor.events({
  'submit #sponsor-form'(event, template){
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
    let form = $('#sponsor-form')
    let data = form.serializeObject()
    previewData.set(data)
  }
})

Template.sponsor_card.events({
  'click .click_edit-button'(event, template){
    event.preventDefault();
    let data = template.data.sponsor
    editId.set(data._id)
    FlowRouter.go('events.app.sponsors.edit',{ id: FlowRouter.getParam("id"), sponsorId : editId.get()})
  },
  'click .click_delete-button'(event, template) {
    event.stopPropagation();
    const eventId = FlowRouter.getParam("id");
    mbox.confirm("Are you sure you want to delete this?", (yes) => {
      if(yes) {
        deleteSponsor.call(template.data.sponsor._id, (err, res) => {
          if(!err){
            showSuccess("Sponsor Deleted")
            activityInsertData = {
              eventId: eventId,
              activityModule: 'App Settings',
              activitySubModule: 'Sponsors',
              event: 'Delete',
              activityMessage: 'Sponsor deleted' + ' - ' + template.data.sponsor.name
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

Template.app_preview_sponsor.helpers({
  appGeneralSettings() {
    return App_General.findOne()
  },

  pageInfo(){
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