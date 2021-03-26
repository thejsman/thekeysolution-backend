import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { FileWithFolioNumberSchema, notifyGuestSchema } from "./schema";
import { FileWithFolioNumber } from "./fileWithFolioNumber";
import { Events } from "../events/events";
import _ from "lodash";

export const uploadAllFiles = new ValidatedMethod({
  name: "event.uploadAllFiles",
  validate: null,
  run: async (data) => {
    if(!data.length){
      throw new Error('No record to create');
    }
    const [ {eventId} ] = data;
    const event = await Events.findOne({ _id: eventId });
    if(!event){
      throw new Error('Event not found.');
    }

    const files = []

    const documents = await data.map(async record => {
      record.createdAt = new Date();
      record.updatedAt = new Date();
      const document = await FileWithFolioNumber.insert(record);
      files.push(document)
      return document;
    });

    return documents;
  }
});

export const updateFileWithFolioSection = new ValidatedMethod({
  name: "updateFileDetails",
  validate: FileWithFolioNumberSchema.validator({ clean: true }),
  run: (data) => {
    const { eventId, docId } = data;
    const event = Events.find({ eventId });
    if(!event){
      throw new Error('Event not found.');
    }
    FileWithFolioNumber.update(docId, {$set: data});
  }
});

/**
 * Notify Guests on files addition
 * @method
 * 
 * @param { object } data - Guest Information
 * @param { boolean } sendNotification - send msg by SMS & push notifiction
 * @param { boolean } sendEmail - send msg by email
 */
export const notifyGuests = new ValidatedMethod({
  name: "notifyUserOnUpload",
  validate: null,
  // validate: notifyGuestSchema.validator({ clean: true }),
  run: async ( payload ) => {
    if(!payload){
      throw new Error('No record to create');
    }

    if(Meteor.isServer) {

      require('./server/notifyGuests').notifyGuestServer(payload);
    }
  }
})