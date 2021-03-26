import "./poll.html";

import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { FlowRouter } from "meteor/kadira:flow-router";
import { Polls } from "../../../../api/polls/polls";
import {
  showError,
  showSuccess
} from "../../../components/notifs/notifications";
import { deletePoll } from "../../../../api/polls/methods";

Template.events_poll_view.onCreated(function() {
  this.eventId = FlowRouter.getParam("id");
  this.pollId = FlowRouter.getParam("pollId");
  this.poll = new ReactiveVar([]);

  this.autorun(() => {
    this.subscribe("polls.one", { eventId: this.eventId, pollId: this.pollId });
  });
});

Template.events_poll_view.helpers({
  poll: () => {
    const instance = Template.instance();
    const eventId = instance.eventId;
    const pollId = instance.pollId;
    if (!eventId || !pollId) {
      return false;
    }

    const poll = Polls.findOne({ eventId: eventId, _id: pollId });
    return poll;
  },

  editLink: () => {
    const instance = Template.instance();
    const eventId = instance.eventId;
    const pollId = instance.pollId;
    if (!eventId || !pollId) {
      return "#";
    }
    return FlowRouter.path("events.poll.update", { id: eventId, pollId: pollId });
  }
});

Template.events_poll_view.events({
  "click .js_delete_poll": (event, tmpl) => {
    event.preventDefault();
    const eventId = tmpl.eventId;
    const pollId = tmpl.pollId;

    if (!eventId || !pollId) {
      return "#";
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
        FlowRouter.go('events.poll', { id: eventId });
      }
    });
  },
});
