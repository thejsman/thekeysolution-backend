import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import _ from 'lodash';
import { showError, showSuccess } from '../../../../components/notifs/notifications'
import { UploadFiles } from '../../../../../api/upload/S3Uploads';
import { addAppAboutPages, deleteAppAboutPages, updateAppAboutPages } from '../../../../../api/app_general/methods';
import { Events } from '../../../../../api/events/events';
import { App_General } from '../../../../../api/app_general/app_general';
import '../app_preview/app_navbar';
import './events_app_about.html';
import './events_app_about.scss';
import { activityRecordInsert } from '../../../../../api/activity_record/methods';

let editing = new ReactiveVar(false);
let editingId = new ReactiveVar("");
let imageHolder = null;

function updatePreview() {
  let img = $('.dropify-render img').attr('src');
  let title = $('#aboutPageTitle').val();
  let content = $('#aboutPageContent').val();
  // Set preview
  $('#about_main_banner').css('background-image', 'url(' + img + ')');
  $('center a').html(title);
  $('#about_main_title').html(title);
  $('#about_main_description').html(content);
}

Template.events_app_about.onRendered(function () {
  editing.set(false);
  this.autorun(() => {
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
      this.$('.dropify').dropify();
      this.$('.tooltip-icon').tooltip({ delay: 50 });
      this.$('.tooltipped').tooltip({ delay: 50 });
    }, 10)
  });
})

Template.events_app_about.helpers({
  aboutPageList() {
    let app = App_General.findOne();
    if (app && app.aboutpages) {
      return app.aboutpages;
    }
    else {
      return [];
    }
  },

  hasAboutPages() {
    let app = App_General.findOne();
    if (app && app.aboutpages) {
      return true;
    }
    else {
      return false;
    }
  }
})

Template.events_app_about_card.events({
  'click .edit-page-button'(event, template) {
    editing.set(true);
    editingId.set(template.data.info._id);
    Meteor.setTimeout(() => {
      $('.modal').modal('open');
      setTimeout(function () {
        var file = $('#input-file-now').attr('data-default-file');
        if (typeof file != 'undefined' && file.length > 0) {
          $('.dropify-render').html('<img src="' + file + '">');
          $('.dropify-wrapper .dropify-preview').css('display', 'block');
        }
        // updatePreview();
        $('select').material_select();
      }, 800);
    }, 100);
  },
  'click .click_delete-button'(event, template) {
    mbox.confirm('Are you sure?', (yes) => {
      if (!yes) return;
      let eventId = FlowRouter.getParam("id");
      let pageId = template.data.info._id;
      let pageTitle = template.data.info.aboutPageTitle;
      deleteAppAboutPages.call({ eventId, pageId }, (err, res) => {
        if (err) { showError(err); template.$('button.btn').removeClass('disabled'); }
        else {
          showSuccess("About Page Removed");
          // template.$('button.btn').removeClass('disabled');
          //code to insert data in Activity Record       
          activityInsertData = {
            eventId: eventId,
            activityModule: 'App Settings',
            activitySubModule: 'About',
            event: 'Delete',
            activityMessage: `About page deleted - ${pageTitle}`
          }
          activityRecordInsert(activityInsertData);
        }
      });
    });
  }
})

Template.add_about_page.onRendered(() => {
  this.$('.modal').modal();
  let dr = this.$('.dropify').dropify({
    messages: {
      'default': 'Sub event Image <br>Size: 1200px X 520px <br>Format: JPG Only',
      'replace': 'Drag and drop or click to replace <br>Size: 1200px X 520px <br>Format: JPEG',
      'remove': 'Remove Image',
      'error': 'Ooops, something wrong happended.'
    }
  });
  imageHolder = dr.data('dropify')
})

Template.add_about_page.helpers({
  title() {
    return editing.get() ? "Edit Page" : "Add Page";
  },

  buttonText() {
    return editing.get() ? "Update" : "Add";
  },

  pageInfo() {
    let eId = editingId.get();
    let instance = Template.instance();
    if (eId) {
      let app = App_General.findOne();
      if (app && app.aboutpages) {
        Meteor.setTimeout(() => {
          instance.$('.dropify').dropify();
        })
        let page = _.find(app.aboutpages, p => { return p._id === eId; });
        return page;
      } else {
        return '';
      }
    }
  }
})

Template.add_about_page.events({
  'submit #add-about-page'(event, template) {
    event.preventDefault();
    template.$('button.btn').addClass('disabled');
    let form = template.$(event.target);
    let data = form.serializeObject();
    data.eventId = FlowRouter.getParam('id');
    var fileInputs = template.$('input[type="file"]');
    const imageChanged = fileInputs.val()
    const image = event.target.aboutPageImg.getAttribute('data-default-file')
    if (imageChanged && fileInputs.length > 0) {
      UploadFiles(fileInputs, 1, false).then((fs) => {
        data = Object.assign(data, fs);
        addNewPage(data, form[0], template);
      }).catch(e => {
        showError(e);
        template.$('button.btn').removeClass('disabled');
      });
    }
    else {
      data.aboutPageImg = image;
      addNewPage(data, form[0], template);
      template.$('button.btn').removeClass('disabled');
    }
  },
  'click #update_app_preview'(event) {
    event.preventDefault()
    updatePreview()
  }
})

function addNewPage(data, form, template) {
  let successMessage = editing.get() ? "About Page Updated" : "About Page Added";
  let cb = (err, res) => {
    if (err) {
      showError(err);
      template.$('button.btn').removeClass('disabled');
    }
    else {
      showSuccess(successMessage);
      template.$('button.btn').removeClass('disabled');
      template.$('.modal').modal('close');
      form.reset();
      editing.set(false);
      imageHolder.resetPreview();
      imageHolder.clearElement();

      //code to insert data in Activity Record       
      activityInsertData = {
        eventId: data.eventId,
        activityModule: 'App Settings',
        activitySubModule: 'About',
        event: 'Update',
        activityMessage: successMessage + ' - ' + data.aboutPageTitle
      }
      activityRecordInsert(activityInsertData);

    }
  };

  if (editing.get()) {
    data.aboutPageId = editingId.get()
    updateAppAboutPages.call(data, cb)
  }
  else {
    addAppAboutPages.call(data, cb)
  }
}

Template.app_preview_about_page.helpers({
  appAboutSettings() {
    return App_General.findOne();
  },

  pageInfo() {
    let eId = editingId.get();
    let instance = Template.instance();
    if (eId) {
      let app = App_General.findOne();
      if (app && app.aboutpages) {
        Meteor.setTimeout(() => {
          instance.$('.dropify').dropify();
        })
        let page = _.find(app.aboutpages, p => { return p._id === eId; })
        return page;
      } else {
        return '';
      }
    }
  },

  checkFeature(featureName) {
    let eventId = FlowRouter.getParam("id");
    let event = Events.findOne(eventId);
    if (event && event.appDetails && event.appDetails.selectedAppDetails && event.appDetails.selectedAppDetails.indexOf(featureName) > -1) {
      return true;
    }
    return false;
  },
})