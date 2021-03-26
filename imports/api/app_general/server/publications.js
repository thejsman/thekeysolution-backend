import { Meteor } from 'meteor/meteor';
import { App_General } from '../app_general.js';

Meteor.publish('appgeneral.event', function(id) {
  return App_General.find({
    eventId: id
  });
});
