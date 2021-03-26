import XLSX from 'xlsx';
import { Meteor } from 'meteor/meteor';
import { PwaActivityRecords as ActivityRecords } from '../../pwa_activity_record/activity_record.js';
import _ from 'lodash';

export const getActivityExcel = (eventId, extraInfo) => {
  let activity_record = ActivityRecords.find();
  let activityStartDate = extraInfo.start_date;
  let activityEndDate = extraInfo.end_date;
  let activityeSearchTerm = extraInfo.searchTerm;
  let activityEventId = '';
  let lookupObject = {};
  if (extraInfo.activityEventId) {
    lookupObject = {
      ...lookupObject,
      'activityEventId': extraInfo.activityEventId,
    }
  }

  if (extraInfo.searchTerm && extraInfo.searchTerm !== '') {
    lookupObject = {
      ...lookupObject,
      $or: [
        {
          "activityGuestInfo.name": new RegExp('^'+activityeSearchTerm +'.*', "i")
        }
      ]
    };
  }

  if (activityStartDate && activityEndDate) {
    let from_date = new Date(activityStartDate);
    let to_date = new Date(activityEndDate);
    // from_date.setHours(0);
    // from_date.setMinutes(0);
    // from_date.setSeconds(0);
    // to_date.setHours(23);
    // to_date.setMinutes(59);
    // to_date.setSeconds(59);
    lookupObject = {
      ...lookupObject,
      'activityeDateTime': { $gte: from_date, $lte: to_date }//new RegExp('^.*'+searchModule+'.*$', "i")
    }
  }

  activityList = ActivityRecords.find(lookupObject, { sort: { activityeDateTime: -1 } }).fetch();
  let activityInfo = {};
  let activityListFinal = [];
  if (activityList.length == 0) {
    return 'N';
  }
  else {
    let i = 0;
    _.each(activityList, (e) => {
      let sub = {
    //    ['Activity Id']: e._id,
        ['S. No'] : ++i,
        ['Module']: e.activityModule,
        ['Sub Module']: e.activitySubModule,
        ['Event']: e.activityEvent,
        ['Message']: e.activityMessage,
      //  ['Guest Id']: e.activityGuestInfo.id,
        ['Guest Name']: e.activityGuestInfo.name,
        ['Guest Email']: e.activityGuestInfo.email,
        ['Date']: e.activityeDateTime.toLocaleDateString({timeZone:'Asia/Kolkata'}) ,
        ['Time']: e.activityeDateTime.toLocaleTimeString({timeZone:'Asia/Kolkata'})
      };
      activityListFinal.push(sub);
    });

    const ws = XLSX.utils.json_to_sheet(activityListFinal);
    const wb = { SheetNames: ["Sheet1"], Sheets: { Sheet1: ws } };
    return wb;
  }

};
