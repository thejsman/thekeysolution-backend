import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";
import { HTTP } from "meteor/http";
import { AdminInvitations } from "../invitations.js";
import { Events } from "../../events/events.js";
import { Guests } from "../../guests/guests.js";
import { App_General } from "../../app_general/app_general.js";
import { sendSMS } from "../../notifications/server/sendSMS.js";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(
  "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"
);

let invitation = (options) => {
  let guest = Guests.findOne(options._id);
  let event = Events.findOne(options.eventId);
  let app = App_General.findOne({ eventId: options.eventId });
  let sendFrom = event.hostDetails.eventHostContact.split(",");
  let footerFrom = sendFrom.join("<br />");
  const templateId = event.hostDetails.eventEmailTemplateId
    ? event.hostDetails.eventEmailTemplateId
    : "d-8b2de57d0722456094d08d5ea8fc06f1";

  const msg = {
    //extract the email details
    to: options.guestPersonalEmail,
    from: `${sendFrom[0]} < ${event.hostDetails.eventHostContactEmail} >`,
    templateId,
    //extract the custom fields
    dynamic_template_data: {
      name: `${guest.guestTitle} ${guest.guestFirstName} ${guest.guestLastName}`,
      guest_email: options.guestPersonalEmail,
      login_link: `${app.appDomain}?e=${options.guestPersonalEmail}/&p=${guest.accessCode}`,
      access_code: options.accessCode,
      app_domain: `${app.appDomain}`,
      app_name: `${event.basicDetails.eventName}`,
      app_short_name: `${app.appShortName}`,
      footer: `${footerFrom},<p>${event.hostDetails.eventHostName}</p>`,
    },
  };

  sgMail.send(msg, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      console.log("That's wassup!");
      console.log(msg);
    }
  });

  if (!app) app = {};
  let mobileno;
  try {
    mobileno = guest.guestContactNo.toString();
  } catch (e) {
    console.log("Error on mobile number", e);
  }

  let finalno = [];
  switch (guest.guestPhoneCode) {
    case "":
      finalno.push("+91" + mobileno);
      break;
    case "undefind":
      finalno.push("+91" + mobileno);
      break;
    default:
      finalno.push(guest.guestPhoneCode + mobileno);
      break;
  }
  let appNameText = app.appName;

  let linkRequest = {
    destination: `${app.appDomain}?e=${options.guestPersonalEmail}&p=${guest.accessCode}`,
    domain: { fullName: "thekey.services" },
  };
  let requestHeaders = {
    "Content-Type": "application/json",
    apikey: "fc50ff8457484888b71bf24c6547aab7",
  };
  HTTP.post(
    "https://api.rebrandly.com/v1/links",
    {
      data: linkRequest,
      headers: requestHeaders,
    },
    (error, result) => {
      if (error) {
        sendSMS(
          [`${finalno}`],
          `You have been invited to ${decodeURIComponent(
            event.basicDetails.eventName
          )}. Click on ${app.appDomain}?e=${options.guestPersonalEmail}/&p=${
            guest.accessCode
          } to login into the App. Your login ID is ${
            options.guestPersonalEmail
          } and your password is ${guest.accessCode}.`,
          options.eventId
        );
        console.log(
          [`${finalno}`],
          `You have been invited to ${decodeURIComponent(
            event.basicDetails.eventName
          )}. Click on ${app.appDomain}?e=${options.guestPersonalEmail}/&p=${
            guest.accessCode
          } to login into the App. Your login ID is ${
            options.guestPersonalEmail
          } and your password is ${guest.accessCode}.`
        );
        console.log("Error fetching shortUrl: ", error);
      }
      const link = `https://${result.data.shortUrl}`;
      sendSMS(
        [`${finalno}`],
        `You have been invited to ${decodeURIComponent(
          event.basicDetails.eventName
        )}. Click on ${link} to login into the App. Your login ID is ${
          options.guestPersonalEmail
        } and your password is ${guest.accessCode}.`,
        options.eventId
      );
      console.log(
        [`${finalno}`],
        `You have been invited to ${decodeURIComponent(
          event.basicDetails.eventName
        )}. Click on ${link} to login into the App. Your login ID is ${
          options.guestPersonalEmail
        } and your password is ${guest.accessCode}.`
      );
    }
  );
};

export const SendGuestInvite = invitation;
