import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './events_email.html';
import './events_email.scss';

Template.events_email.onRendered(function() {
  
});