import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { showError, showSuccess } from '../../../components/notifs/notifications';
import { uploadFlightExcel, uploadFlightExcelIndividual } from '../../../../api/flights/methods';
import { downloadGuestExcel } from '../../../../api/guests/methods';
import XLSX from 'xlsx';
import FileSaver from 'file-saver';
import './events_flights_bulk_upload.html';

Template.events_flights_bulk_upload.onRendered(() => {

})

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

Template.events_flights_bulk_upload.events({
  'change #xxx'(event, template) {
    var eventId = FlowRouter.getParam("id");
    let file = event.currentTarget.files[0]
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      let wb = XLSX.read(data, { type: 'binary' });
      let bookingdata = XLSX.utils.sheet_to_json(wb.Sheets.Sheet1);
      uploadFlightExcel.call({ bookingdata, eventId }, (err, res) => {
        if(err){
          showError(err)
        } else {
          console.log('Method Response ::: ', res);
          res.map(a => {
            self.$('#flight-upload-errors').append(
              '<p>'+a+'</p>'
            )
          })
          showSuccess("Flights updated sucessesfully, please check status for errors");
        }
      })
    };
    reader.readAsBinaryString(file);
  },

  'change #upload-individual-excel'(event, template) {
    var eventId = FlowRouter.getParam("id");
    let file = event.currentTarget.files[0]
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      let wb = XLSX.read(data, { type: 'binary' });
      let bookingdata = XLSX.utils.sheet_to_json(wb.Sheets.Sheet1);
      uploadFlightExcelIndividual.call({ bookingdata, eventId }, (err, res) => {
        if(err){
          showError(err)
        } else {
          console.log('Method Response ::: ', res);
          res.map(a => {
            self.$('#flight-upload-errors-individual').append(
              '<p>'+a+'</p>'
            )
          })
          showSuccess("Flights updated sucessesfully, please check status for errors");
        }
      })
    };
    reader.readAsBinaryString(file);
    event.target.value = '';
  },

  'click #download-flight-sample'(e){
    event.preventDefault();
    var extraInfo = {
      flight_upload : true
    }
    const eventId = FlowRouter.getParam("id");
    downloadGuestExcel.call({ eventId, extraInfo }, (err, wb) => {
      if (!wb) {
        return;
      }
      var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
      var wbout = XLSX.write(wb, wopts);
      FileSaver.saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), `Guest_Individual_Flights_Upload_${eventId}.xlsx`);
    });
  },

  'click #download-flight-individual-sample'(e){
    event.preventDefault();
    var extraInfo = {
      individual_flight_upload : true,
    }
    const eventId = FlowRouter.getParam("id");
    downloadGuestExcel.call({ eventId, extraInfo }, (err, wb) => {
      if (!wb) {
        return;
      }
      var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
      var wbout = XLSX.write(wb, wopts);
      FileSaver.saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), `GuestFlightsUpload-${eventId}.xlsx`);
    });
  }
});