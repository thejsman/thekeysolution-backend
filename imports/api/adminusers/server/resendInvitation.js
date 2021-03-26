



import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { AdminInvitations } from '../invitations.js';

let prepareEmail = (token, type) => {
  let domain = Meteor.settings.domain;
  let url    = `http://${ domain }/public/invite/${ type }/${ token }`;
  return url;
};

let invitation = (options) => {
  var email = prepareEmail(options.token, options.type);
  Email.send({
    to: options.email,
    from: "THE KEY <admin@thekey.com>",
    subject: "Invitation to THE KEY",
    text: email
  });
};


export const ReSendInvite = invitation;
