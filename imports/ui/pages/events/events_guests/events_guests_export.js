import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { downloadGuestExcel } from '../../../../api/guests/methods.js';
import XLSX from 'xlsx';
import FileSaver from 'file-saver';
import './events_guests_export.html';
import moment from 'moment';

Template.events_guests_export.onRendered(function () {
  this.$('.modal').modal();
});

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

Template.events_guests_export.events({
  'submit #export-guests-form'(event, template) {
    event.preventDefault();
    var jq = template.$(event.target);
    var extraInfo = jq.serializeObject();
    const eventId = FlowRouter.getParam("id");
    let time = moment().format('YYYY-MM-DD-HH-mm');
    downloadGuestExcel.call({ eventId, extraInfo }, (err, wb) => {
      if (!wb) {
        return;
      }
      var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
      var wbout = XLSX.write(wb, wopts);
      FileSaver.saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), `GuestData-${eventId}-${time}.xlsx`);
    });
  }
});
