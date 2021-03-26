import { ReactiveVar } from "meteor/reactive-var";
import { addPoll , editPoll } from "../../../../api/polls/methods";
import "./form.html";
import { FlowRouter } from "meteor/kadira:flow-router";
import {
  showError,
  showSuccess
} from "../../../components/notifs/notifications";
import { Polls } from "../../../../api/polls/polls";
import _ from "lodash/lodash";

Template.events_polls_form.onCreated(function() {
  // Template level data
  this.pollType = new ReactiveVar(null);
  this.ratingStar = new ReactiveVar(0);
  this.mcqOptions = new ReactiveVar([
    { index: 1, text: ''},
    { index: 2, text: ''},
    { index: 3, text: ''},
  ]);

  this.multipleAnswer = new ReactiveVar(false);
  this.editing = new ReactiveVar(null);
  this.pollId = FlowRouter.getParam("pollId");

  this.autorun(() => {
    const pollId = FlowRouter.getParam("pollId");
    if (pollId) {
      this.subscribe("polls.one", pollId);
      this.editing.set(pollId);
    } else {
      this.editing.set(null);
    }
    $("select").material_select();
  });
});

Template.events_polls_form.events({
  "change #pollType": (event, template) => {
    event.preventDefault();
    const newType = event.target.value;
    if (!newType) {
      return;
    }
    template.pollType.set(newType);
  },
  "click #add-mcq-option": (event, template) => {
    event.preventDefault();
    const options = template.mcqOptions.get();
    if (options.length > 10) {
      throw new Error("more than 10 options can not be added.");
    }
    options.push({ index: options.length + 1, text: '' });
    template.mcqOptions.set(options);
  },

  "submit #eventsPollForm": (event, template) => {
    event.preventDefault();
    const jq = template.$(event.target);
    let data = jq.serializeObject();
    const eventId = FlowRouter.getParam("id");
    const editing = template.editing.get();
    data.options = template.mcqOptions.get();
    data.type = template.pollType.get();
    data.eventId = eventId;

    if(editing && editing !== null) {
      data._id = template.editing.get();
      data.multipleAnswer = data.multipleAnswer ? data.multipleAnswer : false;
      data.active = data.active ? data.active : false;
      
      editPoll.call(data, (err, res) => {
        if (!err) {
          showSuccess("Poll added.");
          FlowRouter.go("events.poll", { id: FlowRouter.getParam("id") });
        }
        showError(err);
      });
    } else {
      addPoll.call(data, (err, res) => {
        if (!err) {
          showSuccess("Poll updated.");
          FlowRouter.go("events.poll", { id: FlowRouter.getParam("id") });
        }
        showError(err);
      });
    }
  },

  "keyup input.mcq_option_text": (event, tmpl) => {
    event.preventDefault();

    const options = tmpl.mcqOptions.get();
    const optionIndex = event.currentTarget.dataset.index;
    const val = event.currentTarget.value;

    const updatedOptions = options.map(option => {
      if(option.index == optionIndex) {
        option.text = val;
      }

      return option;
    })

    tmpl.mcqOptions.set(updatedOptions);
  },

  "click .delete-option": (event, tmpl) => {
    event.preventDefault();

    const options = tmpl.mcqOptions.get();
    const optionIndex = event.currentTarget.dataset.index;

    const remaingOptions = options.filter((option, s) => {
      if (option.index != optionIndex) {
        return {
          index: s+1,
          text: option.text
        }
      }
    });

    const res = remaingOptions.map((option, i) => {
      return {
        index: i+1,
          text: option.text
      }
    })

    tmpl.mcqOptions.set(res);
  },

  "change #multiple-answer": (event, tmpl) => {
    event.preventDefault();
    const multipleAnswer = this.$("#multiple-answer").is(":checked");
    if (multipleAnswer) {
      tmpl.multipleAnswer.set(true);
      return true;
    }

    tmpl.multipleAnswer.set(false);
  }
});

Template.events_polls_form.helpers({
  pollType: text => {
    const instance = Template.instance();
    const type = instance.pollType.get();
    if (text === type) {
      return true;
    }

    return false;
  },

  poll: () => {
    const instance = Template.instance();
    const pollId = instance.editing.get();
    
    if(!pollId || pollId === null) {
      return 'add new';
    }

    const poll = Polls.find(pollId).fetch();
    const currentPoll = poll && poll[0];

    if(currentPoll) {
      instance.pollType.set(currentPoll.type);
      instance.multipleAnswer.set(currentPoll.multipleAnswer);
      if(currentPoll.type == 'mcq') {
        instance.mcqOptions.set(currentPoll.options);
      } else {
        instance.ratingStar.set(currentPoll.ratingStar);
      }
    }
    
    return currentPoll;
  },

  allowFormSubmit: () => {
    const instance = Template.instance();
    const type = instance.pollType.get();
    if (type === "mcq" || type === "rating") {
      return true;
    }

    return false;
  },

  mcqOptions: () => {
    const instance = Template.instance();
    return instance.mcqOptions.get();
  },

  multipleAnswer: () => {
    const instance = Template.instance();
    return instance.multipleAnswer.get();
  },

  pageTitle: () => {
    const instance = Template.instance();
    return instance.editing.get() ? "update poll" : "create poll";
  },

  isEdit: () => {
    const instance = Template.instance();
    return instance.editing.get() ? true : false;
  }
});
