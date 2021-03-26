import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { downloadEventActivityExcel } from '../../../../api/activity_record/methods.js';
import XLSX from 'xlsx';
import FileSaver from 'file-saver';
import './event_activity_export.html';
import './event_activity_export.scss';
import moment from 'moment';

Template.event_activity_export.onRendered(function () {
  this.$('.modal').modal();
  // let xxx = $('#event-activity-export-modal').attr('searchdata');
  // console.log('xxxx', xxx)
});

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

Template.event_activity_export.events({
  'submit #event-export-activity-form'(event, template) {
    event.preventDefault();
    var jq = template.$(event.target);
    var extraInfo = jq.serializeObject();
    let xxx = $('#event-activity-export-modal').attr('searchdata');
    extraInfo.searchTerm = xxx;
    // console.log('xxxx', extraInfo)
    if (extraInfo.start_date == '' || extraInfo.end_date == '') {
      showError('Start Date and End Date cant be null');
    }
    else {
      extraInfo.activityEventId = FlowRouter.getParam('id');
      let time = moment().format('YYYY-MM-DD-HH-mm');
      console.log('EXTRA INFOOO ::::', extraInfo);
      downloadEventActivityExcel.call({ extraInfo }, (err, wb) => {
        // console.log(wb);
        if (wb == 'N') {
          showError('No record exist in this time period!');
        }
        else if (!wb) {
          showError('Error while creating sheet!');
          return;
        }
        else {
          var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
          var wbout = XLSX.write(wb, wopts);
          FileSaver.saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), `Event-activityData-${time}.xlsx`);
        }
      });
    }
  }
});

