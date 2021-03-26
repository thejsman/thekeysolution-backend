import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import "./events_meeting_detail.html";
import { ReactiveVar } from "meteor/reactive-var";
import { Event_Meetings } from "../../../../api/events_meeting/event_meetings";
import "./events_meetings_summary.scss";


Template.events_meetings_details.onRendered(function () {
  this.subscribe("event_meetings.event", FlowRouter.getParam("id"));
  this.subscribe(
    "event_meetings.info",
    FlowRouter.getParam("id"),
    FlowRouter.getParam("meetingId")
  );
  this.$(".tooltipped").tooltip({ delay: 50 });
});

Template.meeting_summary.helpers({
  formatDate: function (date) {
    return moment(date).format("dddd, MMMM Do YYYY, h:mm:ss a");
  },
});

Template.events_meetings_details.helpers({
  meetingAddPath() {
    return FlowRouter.path("addEventMeeting", {
      id: FlowRouter.getParam("id"),
    });
  },
  eventMeetingInfo() {
    const searchQuery = {
      eventId: FlowRouter.getParam("id"),
      meetingId: parseInt(FlowRouter.getParam("meetingId")),
    };
    const eventMeeting = Event_Meetings.findOne(searchQuery);
    return eventMeeting;
  },
});

Template.meeting_summary.events({
  "click #btnDeleteMeeting"(_event, template) {
    deleteId.set(template.data.eventMeeting.meetingId);
    deleteModal.modal("open");
  },

  "click #btnEditMeeting"(_event, template) {
    const meetingId = FlowRouter.getParam("meetingId");
    const eventId = FlowRouter.getParam("id");
    FlowRouter.go("editEventMeeting", {
      id: eventId,
      meetingId,
    });
  },
});
