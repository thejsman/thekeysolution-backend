import { Meteor } from 'meteor/meteor';
let BuildServer = null;
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin';
if (Meteor.isServer) {
  import BS from '../../api/buildserver/server/buildserver.js';
  BuildServer = BS;
}
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { App_General } from '../app_general/app_general.js';
import { SizePreferences } from '../preferences/sizepreference.js';
import { FoodPreferences } from '../preferences/foodpreference.js';
import { SpecialAssistancePreferences } from '../preferences/specialassistancepreference.js';
import { Roles } from 'meteor/meteor-roles';


export const buildApk = new ValidatedMethod({
  name: 'App.methods.build',
  mixins: [CallPromiseMixin],
  validate: null,
  async run(info) {
    if (BuildServer && Roles.userIsInRole(this.userId, 'superadmin')) {
      let eId = info.eventId;
      if (info.eventId.match(/^\d/)) {
        // starts with a number
        eId = 'e' + info.eventId;
      }
      let app = App_General.findOne({ eventId: info.eventId });
      if (!app.firebaseID || app.firebaseID === '') {
        throw new Meteor.Error("Firebase Id required for build. Use com.thekey." + eId + " as the app id");
      }
      try {
        App_General.upsert({
          eventId: info.eventId
        }, {
            $set: {
              appBuilding: true
            }
          });
        let eventId = info.eventId;
        let preferences = {
          sizePreference: SizePreferences.findOne({ eventId }),
          foodPreference: FoodPreferences.findOne({ eventId }),
          specialPreference: SpecialAssistancePreferences.findOne({ eventId })
        };
        info.preference = preferences;
        let content = await BuildServer.buildApk(info);
        let parsed = JSON.parse(content);
        App_General.upsert({
          eventId: info.eventId
        }, {
            $set: {
              appURL: parsed.uploadedURL,
              appBuilding: false
            }
          });

        return parsed.uploadedURL;
      }
      catch (err) {
        App_General.upsert({
          eventId: info.eventId
        }, {
            $set: {
              appBuilding: false
            }
          });
        console.log(err);
        throw new Meteor.Error(err);
      }
    }
  }
});
