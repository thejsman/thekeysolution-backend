import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { downloadActivityExcel } from '../../../../api/activity_record/methods.js';
import XLSX from 'xlsx';
import FileSaver from 'file-saver';
import './activity_export.html';
import './activity_export.scss';
import moment from 'moment';

Template.activity_export.onRendered(function () {
  this.$('.modal').modal();
});

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

Template.activity_export.events({
  'submit #export-activity-form'(event, template) {
    event.preventDefault();
    var jq = template.$(event.target);
    var extraInfo = jq.serializeObject();
    if (extraInfo.start_date == '' || extraInfo.end_date == '') {
      showError('Start Date and End Date cant be null');
    }
    else {
      console.log('extraInfo', extraInfo);
      let time = moment().format('YYYY-MM-DD-HH-mm');
      downloadActivityExcel.call({ extraInfo }, (err, wb) => {
        if (wb == 'N') {
          showError('No record exist in this time period!');
        }
        else if (!wb) {
          showError('Error while creating sheet!');
          return;
        } else {
          var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
          var wbout = XLSX.write(wb, wopts);
          FileSaver.saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), `ActivityData-${time}.xlsx`);
        }
      });
    }
  }
});