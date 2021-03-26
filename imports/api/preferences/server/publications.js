import { Meteor } from 'meteor/meteor';
import { FoodPreferences } from '../foodpreference.js';
import { SizePreferences } from '../sizepreference.js';
import { SpecialAssistancePreferences } from '../specialassistancepreference.js';

Meteor.publish('event.food.preferences', function(eventId) {
  return FoodPreferences.find({ eventId });
});

Meteor.publish('event.size.preferences', function(eventId) {
  return SizePreferences.find({ eventId });
});

Meteor.publish('event.specialassistance.preferences', function(eventId) {
  return SpecialAssistancePreferences.find({ eventId });
});
