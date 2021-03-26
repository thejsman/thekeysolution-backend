import { Meteor } from 'meteor/meteor';
import { SetupRoles } from './roles.js';
import BuildServer from '../../api/buildserver/server/buildserver.js';
import admin from 'firebase-admin';
import { Accounts } from 'meteor/accounts-base'


S3.config = Meteor.settings.S3;
let mailSettings = Meteor.settings.mailSettings;
let buildServerSettings = Meteor.settings.buildServer;

Meteor.startup(() => {
  // Cron Job Starts
  SyncedCron.start();
  
  SetupRoles();
  process.env.MAIL_URL = `smtp://${ mailSettings.username }:${ mailSettings.password }@smtp.sendgrid.net:587`;

  //BOC:key of instamojo
   mojo = Instamojo(Meteor.settings.instamojo.api_key, Meteor.settings.instamojo.auth_token,'https://test.instamojo.com/api/1.1/');

  //EOC: key of instamojo
  BuildServer.connect(buildServerSettings.url);

  admin.initializeApp({
    credential: admin.credential.cert(Meteor.settings.firebase)
  });
});

Meteor.onConnection((connection) => {
  // console.log(connection);
});

Accounts.emailTemplates.resetPassword.from = () => 'The Key Admin <admin@keydisruptors.com>';
Accounts.emailTemplates.resetPassword.subject = () =>  'Request to reset password';

