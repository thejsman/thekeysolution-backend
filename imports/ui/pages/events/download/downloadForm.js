import "./downloadForm.html";

import { FlowRouter } from 'meteor/kadira:flow-router';
import { insertDownloadSection, updateDownloadSection, getDownload } from "../../../../api/downloads/methods";
import { Downloads } from "../../../../api/downloads/download";
import { ReactiveDict } from "meteor/reactive-dict";
import _ from "lodash";
import { showError, showSuccess } from "../../../components/notifs/notifications";
import { Random } from 'meteor/random';

// === === === === === === === === === === === === === === === //
// === === === === ===  Download Form === === === === === === //
// === === === === === === === === === === === === === === === //

Template.downloadForm.onCreated(function(){
  const subsection = [{
    _id: '',
    index : 0,
    name: ''
  }];
  const info = [{
    downloadId: '',
    name: '',
    description: ''
  }];
  this.state = new ReactiveDict();
  this.state.set('data', info);
  this.state.set('editing', false);

  this.sections = new ReactiveVar(subsection)

  this.autorun(() => {
    const downloadId = FlowRouter.getParam("downloadId");
    if(downloadId) {

      Meteor.subscribe('one.download', downloadId);
      this.state.set('editing', true);

      getDownload.call(downloadId, (err, res) => {
        if(err){
          console.log('Errors :: ', err);
          return;
        }
        res.map(data => {
          this.state.set('data', data);
          this.sections.set(data.sections)
        })
      });
    }
  });
});

Template.downloadForm.onRendered(function(){
  this.autorun(() => {
    // Initialize subsections to empty and disable edit mode
    const subsection = [];
    const info = [];
    // const downloadId = FlowRouter.getParam("downloadId");
    if(this.state.get('editing')){
      // If editing updated subsections from database
      const downloadSection = Downloads.findOne({});
      subsection.push(downloadSection.subsections);
      info.push({
        downloadId: downloadSection._id,
        name: downloadSection.name,
        description: downloadSection.description
      })
    } else {
      // Empty subsections
      subsection.push({
        index: 0,
        _id: Random.id(),
        name : ''
      })
      info.push({
        downloadId: '',
        name: '',
        description: ''
      })
    }
    // Update subsections for render
    this.sections.set(subsection)
    this.state.set('data', info);
  });
});

Template.downloadForm.helpers({
  // Go back to download section link
  backLink: () => {
    return FlowRouter.path('events.download',{ id: FlowRouter.getParam("id")});
  },
  // Find all subsections to render
  subsections: () => {
    const subsections = Template.instance().sections.get();
    return subsections.map(section => {
      return {
        id: section._id,
        index: section.index,
        name: section.name
      }
    });
  },

  title: () => {
    const editing = Template.instance().state.get('editing');
    return editing ? "Edit Download" : "Add New Section";
  },

  info: () => {
    return Template.instance().state.get('data');
  }  
});

Template.downloadForm.events({

  // Add new sub section button
  // User inputs: sub section name
  // Task: Validate user input and add to sub sections
  // TODO: Add validation
  'click .btn-action': (event, template) => {
    event.preventDefault();
    const subsection = _.clone(template.sections.get());
    subsection.push({
      index : subsection.length, _id: Random.id(), name : ''
    })
    template.sections.set(subsection);
  },

  // Change on Subsections Input Field
  'keyup #inputSubsection input': (event, template) => {
    event.preventDefault();
    const subsections = _.clone(template.sections.get());
    const index = event.target.dataset.index;
    const name = event.target.value;
    subsections[index].name = name;
    template.sections.set(subsections);
  },

  // Remove subsection id
  'click .deleteSubSection': (event, template) => {
    event.preventDefault();
    const index = event.target.dataset.index;
    const subsections = _.clone(template.sections.get());
    const newList = subsections.filter(item => item.index != index)
    template.sections.set(newList);
  },

  // Submit download form
  // User inputs: section name, description and sub sections
  // Task: Validate and send user input date to server
  // TODO: Add validation
  'submit #downloadForm': (event, template) => {
    event.preventDefault();
    const editing = template.state.get("editing");
    const sections = template.sections.get();
    const name = event.target.name.value;
    const description = event.target.description.value;
    const eventId = FlowRouter.getParam('id');
    const downloadId = FlowRouter.getParam("downloadId");
    const data = {
      eventId: eventId,
      name: name,
      description: description,
      sections: sections
    }
    // console.log('data', data)
    if(editing) {
      updateDownloadSection.call({ ...data, downloadId }, (error, response) => {
        if(error) {
          showError(error);
        } else {
          showSuccess('Section Updated');
          FlowRouter.go('events.download', { id: FlowRouter.getParam("id")});
        }
      });
    } else {
      insertDownloadSection.call({ ...data }, (error, response) => {
        if(error) {
          showError(error);
        } else {
          showSuccess('Section Added');
          FlowRouter.go('events.download', { id: FlowRouter.getParam("id")});
        }
      });
    }
  }
});