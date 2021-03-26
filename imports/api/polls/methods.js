import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Polls } from "./polls";

/**
 * Add new poll method
 *
 *
 */

export const addPoll = new ValidatedMethod({
  name: "events.polls.add",
  validate: null,
  run: async data => {
    const user = Meteor.userId();

    // only allow logged in users
    if (!user) {
      throw new Meteor.Error("User not logged in.");
    }

    const response = await Polls.insert(data, (err, res) => {
      if (err) {
        throw new Meteor.Error("Error while adding new poll to database.");
      }
      return res;
    });

    return response;
  }
});

export const editPoll = new ValidatedMethod({
  name: "events.polls.edit",
  validate: null,
  run: async data => {
    const user = Meteor.userId();

    // only allow logged in users
    if (!user) {
      throw new Meteor.Error("User not logged in.");
    }

    const response = await Polls.update(data._id, {
      $set: data
    }, (err, res) => {
      if (err) {
        throw new Meteor.Error("Error while adding new poll to database.");
      }
      return res;
    });

    return response;
  }
});

export const deletePoll = new ValidatedMethod({
  name: "events.polls.delete",
  validate: null,
  run: async id => {
    const user = await Meteor.userId();
    const poll = await Polls.findOne(id);
    if (!user) {
      throw new Meteor.Error("User not logged in.");
    }

    if (!poll) {
      throw new Meteor.Error("Poll not found");
    }

    Polls.remove(id);
  }
});
