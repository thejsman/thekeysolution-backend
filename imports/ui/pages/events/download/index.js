import "./download.html";
import "./download.scss";
import "./downloadForm";
import "./viewDownload";
import "./agency";

import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from "meteor/reactive-dict";
import { Downloads } from "../../../../api/downloads/download";
import { fetchDownloads, deleteDownloadSection } from "../../../../api/downloads/methods";
import { showError, showSuccess } from "../../../components/notifs/notifications";
// === === === === === === === === === === === === === === === //
// === === === === ===  Download Section === === === === === === //
// === === === === === === === === === === === === === === === //

Template.downloadSection.onCreated(function(){
  const downloads = [];
  const eventId = FlowRouter.getParam("id");
  this.state = new ReactiveDict();
  this.state.set('sections', downloads);
  this.state.set('loading', true);
  this.autorun(() => {
    fetchDownloads.call(eventId, (err, res) => {
      if(err){
        console.log('Errors :: ', err);
        return;
      }
      this.state.set('sections', res);
      this.state.set('loading', false);
    });
  });
});

Template.downloadSection.onRendered(function(){
  
});

Template.downloadSection.helpers({
  downloads: () => {
    return Template.instance().state.get('sections');
  },
  addNewPath: () => {
    return FlowRouter.path('events.download.add',{ id: FlowRouter.getParam("id")});
  }
});

// === === === === === === === === === === === === === === === //
// === === === === ===  Download Card === === === === === === //
// === === === === === === === === === === === === === === === //

Template.downloadSectionCard.events({
  'click .openDownload': (event, tmpl) => {
    event.preventDefault();
    const eventId = FlowRouter.getParam("id");
    const downloadId = tmpl.data.download._id;
    if(!downloadId) {
      return new Error('Section not Found');
    }
    FlowRouter.go('events.download.view', { id : eventId, downloadId })
  },
  'click .editDownload': (event, tmpl) => {
    event.preventDefault();
    const eventId = FlowRouter.getParam("id");
    const downloadId = tmpl.data.download._id;
    if(!downloadId) {
      return new Error('Section not Found');
    }
    FlowRouter.go('events.download.edit', { id : eventId, downloadId })
  },
  'click .deleteDownload': (event, tmpl) => {
    event.preventDefault();
    const eventId = FlowRouter.getParam("id");
    const downloadId = tmpl.data.download._id;
    mbox.confirm('This cannot be undone', function(yes) {
      if (yes) {
        deleteDownloadSection.call(downloadId, (err, res) => {
          if(err) {
            showError('Error while deleting');
            return;
          }
          showSuccess('Download Section Deleted');
          FlowRouter.go('events.download', { id : eventId})
        });
      }
    });
  }
})