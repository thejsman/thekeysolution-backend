import { sendScheduledNotification } from "../methods";

Meteor.startup(() => {
  SyncedCron.add({
    name: "Send Scheduled Notifications ... ",
    schedule: parser => parser.cron("*/15 * * * *"), // run in every 3 minutes
    job: () => sendScheduledNotification.call({}, (err, data) => {
      if(err) {
        console.log('Error while sending scheduled notifications', err)
      } else {
        console.log('Scheduled Notifications Job Finished')
      }
    })
  });
});