import { Meteor } from 'meteor/meteor';
import { Polls } from '../polls';

// Publish all polls for event
Meteor.publish('polls.event', function(eventId) {
  return Polls.find({ eventId });
});

// Publish single poll
Meteor.publish('polls.one', function({pollId }) {
  const poll = Polls.find({ pollId });
  return poll;
});