import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { updateUserProfile } from '../../../../api/adminusers/methods';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';

import './admin_user_profile.html';
import './admin_user_profile.scss';

Template.admin_user_profile.onRendered(function(){
  console.log('Admin Profile Page')
});

Template.admin_user_profile.helpers({
  userName(){
    if(Meteor.user()) {
      return Meteor.user().profile.name;
    }
    return "";
  },
  userContact(){
    if(Meteor.user()) {
      return Meteor.user().profile.contact;
    }
    return "";
  },
  userEmail(){
    if(Meteor.user()) {
      return Meteor.user().emails[0].address;
    }
    return "";
  },
});

Template.admin_user_profile_edit.onRendered(function(){
  this.$('.modal').modal();
});

Template.admin_user_profile_edit.helpers({
  userName(){
    if(Meteor.user()) {
      return Meteor.user().profile.name;
    }
    return "";
  },
  userContact(){
    if(Meteor.user()) {
      return Meteor.user().profile.contact;
    }
    return "";
  },
  userEmail(){
    if(Meteor.user()) {
      return Meteor.user().emails[0].address;
    }
    return "";
  },
});

Template.admin_user_profile_edit.events({
  'submit #edit-user-profile-form'(event, template){
    event.preventDefault();
    let jq = template.$(event.target);
    let data = jq.serializeObject();
    updateUserProfile.call(data, (err, res) => {
      if (err) showError(err);
      else {
        showSuccess("Profile Updated !!!");
        template.$('.modal').modal('close');
      }
    });
  }
});

Template.admin_user_update_password.onRendered(function(){
  this.$('.modal').modal();
});

Template.admin_user_update_password.events({
  'submit #edit-user-password-form'(event, template){
    event.preventDefault();
    let jq = template.$(event.target);
    let data = jq.serializeObject();
    const user = Meteor.users.findOne(Meteor.userId());
    if(user){
      if(data.newpass == data.confirmpass){
        Accounts.changePassword(data.oldpass, data.confirmpass, function(err){
          if(err){
            showError(err)
          } else {
            template.$('.modal').modal('close');
            showSuccess('Password Updated.')
          }
        })
      } else {
        showError('Password Confirmation Not Match.')
      }
    } else {
      showError('User Not Found.')
    }
  }
});