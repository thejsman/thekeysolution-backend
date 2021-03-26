import "./polls.html";
import "./styles.scss";
import "./form";
import "./poll";

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Polls } from "../../../../api/polls/polls";
import { showError, showSuccess } from '../../../components/notifs/notifications';
import { deletePoll } from "../../../../api/polls/methods";

Template.events_polls.onCreated(function() {
  // Template data
  this.pollType = new ReactiveVar('all');
  this.polls = new ReactiveVar([]);
  this.eventId = FlowRouter.getParam("id");
  this.autorun(() => {
    this.subscribe('polls.event', this.eventId);
  });
});

Template.events_polls.helpers({
  newPoll: () => {
    const eventId = FlowRouter.getParam("id");
    return FlowRouter.path('events.poll.add', { id : eventId });
  },
  
  polls: () => {
    const eventId = FlowRouter.getParam("id");
    const polls = Polls.find({eventId});
    return polls;
  },

  isLoading: () => {
    return false;
    // return Template.instance().subscriptionsReady() ? false : true;
  },
  viewPoll: (pollId) => {
    const instance = Template.instance();
    const eventId = instance.eventId.get();
    FlowRouter.path('events.poll.view',{ id: eventId, pollId });
  }
});

Template.poll_card.events({
  'click .delete-item': (event, template) => {
    event.preventDefault();
    const poll = template.data.poll;
    const pollId = poll && poll._id;

    if(!pollId) {
      showError('Poll not found.');
      return false;
    }

    mbox.confirm('Are you sure? You can not un-done this.', function(yes) {
      if (yes) {
        deletePoll.call(pollId, (err, res) => {
          if(err) {
            console.log(err);
            showError(err);
            return;
          }
        })
        showSuccess('Poll deleted.');
        FlowRouter.go('events.poll', { id: FlowRouter.getParam("id") });
      }
    });
  },

  'click .edit-item': (event, template) => {
    event.preventDefault();
    const poll = template.data.poll;
    const pollId = poll && poll._id;

    if(!pollId) {
      showError('Poll not found.');
      return false;
    }

    FlowRouter.go('events.poll.update', { id: FlowRouter.getParam("id"), pollId });
  },
  
  'click .js_link_view_poll': (event, template) => {
    event.preventDefault();
    const poll = template.data.poll;
    const pollId = poll && poll._id;
    if(!pollId) {
      showError('Poll not found.');
      return false;
    }

    FlowRouter.go('events.poll.view',{ id: FlowRouter.getParam("id"), pollId });
  }
});
