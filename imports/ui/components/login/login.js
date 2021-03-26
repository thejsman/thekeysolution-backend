import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { showError, showSuccess } from '../../components/notifs/notifications.js';

import './login.html';
const trimInput = function (val) {
  return val.replace(/^\s*|\s*$/g, "");
}

// Overriding Console.log on production 
if(Meteor.settings.public.autoFillForm == false) {
  console.log = function(){};
} 





Template.login.onRendered(function () {
  this.$('.modal').modal();
});
Template.login.events({
  'submit #signin-form'(event, template) {
    event.preventDefault();
    var jq = template.$(event.target);
    var data = jq.serializeObject();
    Meteor.loginWithPassword(data.user, data.password, function (err) {
      //console.log(err);
      if (err) {
        if (err.message === 'User not found [403]') {
          showError('User not found - Please check that you are using correct email ID.');
        } else if (err.message === 'Incorrect password [403]') {
          showError('Password incorrect - Please check your password.');
        } else {
          showError('Unable to login, please check your username and password.');
        }
      }

    });
  },

  'submit #forgotPasswordForm'(e, template) {
    e.preventDefault();
    var forgotPasswordForm = template.$(e.currentTarget),
      email = trimInput(forgotPasswordForm.find('#forgotPasswordEmail').val().toLowerCase());
    if (email && email !== '') {
      template.$('.modal').modal('close');
      Accounts.forgotPassword({ email: email }, function (err) {
        //console.log(err);
        if (err) {
          if (err.message === 'User not found [403]') {
            showError(err.message);
          } else {
            showError('We are sorry but something went wrong.');
          }
        } else {
          showSuccess('Email Sent. Check your mailbox.');
        }
      });
    }
  }
});
