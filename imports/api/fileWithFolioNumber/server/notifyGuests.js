import { Meteor } from "meteor/meteor";
import { Events } from "../../events/events";
import { Guests } from "../../guests/guests";
import { Downloads } from "../../downloads/download";
import { sendNotificationToEvent } from "../../notifications/server/sendNotification";
import { sendSMS } from "../../notifications/server/sendSMS";
import { sendEmailOnDownloadFileAdd } from "./sendEmail";

export const notifyGuestServer = async payload => {
  // console.log("notifyGuests payload :: ", payload);

  if (!payload) {
    throw new Error("No record to create");
  }

  const { data, sendNotification, sendEmail } = payload;

  //Check if either send email or notification exits
  if (!sendEmail && !sendNotification) {
    throw new Error("sendEmail & sendNotification both are false.");
  }

  const documents = await data.map(async record => {
    const { eventId, guestId, sections, url } = record;
    const guest = await Guests.findOne(
      { _id: guestId },
      {
        folioNumber: 1,
        guestTitle: 1,
        guestFirstName: 1,
        guestLastName: 1,
        guestPersonalEmail: 1
      }
    );
    const section = await Downloads.findOne({ _id: sections });
    const {
      folioNumber,
      guestTitle,
      guestFirstName,
      guestLastName,
      guestPersonalEmail,
      guestPhoneCode,
      guestContactNo
    } = guest;
    const { name: sectionName, sections: allsections } = section;

    let subSectionName = "";

    // Check if subSectionId is present
    if (record.subSectionId) {
      // Find subsection name only if there are sub sections in downloads
      let subsection = _.find(allsections, subsection => {
        return subsection._id === record.subSectionId;
      });

      subSectionName = subsection && subsection.name;
    }

    // prepare message for notification
    const message = {
      notificationTitle: `New document added.`,
      notificationDescription: `New document is added in ${sectionName} ${
        subSectionName.length > 1 ? ", " + subSectionName : ""
      }. You can download this document from ${url}.`
    };

    const contactNumber = [guestPhoneCode + guestContactNo];
    const msg = `New document is added in ${sectionName} ${
      subSectionName.length > 1 ? ", " + subSectionName : ""
    }. You can download this document from ${url}.`;

    // Send notification to user if selected
    if (sendNotification) {
      console.log(
        "This is server sending notification ... :: ",
        eventId,
        msg,
        guestId
      );
      console.info({
        "Ready to send Notification to Guest ": `${guestTitle}. ${guestFirstName} ${guestLastName} - ${folioNumber}`,
        eventId: eventId,
        guestId: guestId,
        msg: msg
      });
      sendNotificationToEvent(eventId, message, guestId);

      sendSMS(contactNumber, msg, eventId);
    }

    // Send email to user if selected
    if (sendEmail) {
      console.info({
        "Ready to send Email to Guest ": `${guestTitle}. ${guestFirstName} ${guestLastName} - ${folioNumber}`,
        guestPersonalEmail: guestPersonalEmail,
        sectionName: sectionName,
        subSectionName: subSectionName,
        url: url
      });
      const options = {
        name: `${guestTitle}. ${guestFirstName} ${guestLastName}`,
        email: guestPersonalEmail,
        sectionName: sectionName,
        subSectionName: subSectionName,
        url: url
      };
      sendEmailOnDownloadFileAdd(options);
    } else {
      console.log("sendEmail is false.");
    }

    return record;
  });

  return documents;
};
