import XLSX from 'xlsx';
import { Meteor } from 'meteor/meteor';
import { ActivityRecords } from '../../activity_record/activity_record.js';
import _ from 'lodash';

export const getActivityExcel = (extraInfo) => {
  let activity_record = ActivityRecords.find();
  let activityStartDate = extraInfo.start_date;
  let activityEndDate = extraInfo.end_date;
  let activityEventId = extraInfo.activityeEventId;
  let activityeSearchTerm = extraInfo.searchTerm;
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
          "activityUserInfo.name": new RegExp('^'+activityeSearchTerm +'.*', "i")
        }
      ]
    };
  }
  if (activityStartDate && activityEndDate) {
    let from_date = new Date(activityStartDate);
    let to_date = new Date(activityEndDate);
    lookupObject = {
      ...lookupObject,
      'activityeDateTime': { $gte: from_date, $lte: to_date }//new RegExp('^.*'+searchModule+'.*$', "i")
    }
  } else {
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
        //   ['Activity Id']: e._id,
        ['S.No']: ++i,
        ['Module']: e.activityModule,
        ['Sub Module']: e.activitySubModule,
        ['Event']: e.activityEvent,
        ['Message']: e.activityMessage,
        //   ['User Id']: e.activityUserInfo.id,
        ['User Name']: e.activityUserInfo.name,
        ['User Email']: e.activityUserInfo.email,
        ['Date']: e.activityeDateTime.toLocaleDateString({timeZone:'Asia/Kolkata'}),
        ['Time']: e.activityeDateTime.toLocaleTimeString({timeZone:'Asia/Kolkata'})
      };
      activityListFinal.push(sub);
    });
    const ws = XLSX.utils.json_to_sheet(activityListFinal);
    const wb = { SheetNames: ["Sheet1"], Sheets: { Sheet1: ws } };
    return wb;
  }
};