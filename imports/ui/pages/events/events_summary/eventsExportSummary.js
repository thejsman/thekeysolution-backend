import FileSaver from 'file-saver';
import Excel from '../../../../extras/client/excel.js';
let fillColor =  {
  type: 'pattern',
  pattern:'solid',
  fgColor:{argb:'FFF4F6F6'}
//  bgColor:{argb:'FF0000FF'}
};
let fillColorHeading = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: {argb: 'FFF4D03F'}
}
let fillColorSubheading = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: {argb:'FFC0C0C0'}
}
let fontSubheading = {
  name: 'Calibri',
  size: 11,
  italic: true
}
let cellFont = {
  name: 'Calibri',
  size: 11,
  bold: true
};
let cellAlignment = { vertical: 'middle', horizontal: 'left' };
let cellAlignmentCenter = {vertical: 'middle', horizontal: 'center'};

let cells = ["B47", "B48", "B49","B34", "B35", "B36","B40", 
            "B47", "B48", "B49",
            "B53", "B54", "B55",
            "B59", "B50", "B61",
            "B65", "B66", "B67",
            "B79", "B80", "B81",
            "B41", "B42", "B6", 
            "B7","B8","B9","B14", "B60","B15","B16","B2",
            "B3","B4","B21","B22","B23","B28","B29","B30","E21","E21","E22","E23"];
let mergeCells = [["B12","C12"],["E12","F12"],["B19","C19"],['E19','F19'],['E70','F70'],['B70','C70'], ['B77','C77']];
let subHeadingCells = ["B70","C70","B13","C13","B20","C20","B71","C71","E13","F13","E20","F20","E71","F71", "B27","B33","B39","B46","B52","B58","B64","B78","C78"];
let headingCells = ["B26", "B32", "B38", "B45", "B51","B57", "B63", "B77"];

// function s2ab(s) {
//   var buf = new ArrayBuffer(s.length);
//   var view = new Uint8Array(buf);
//   for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
//   return buf;
// }

const basicInfo = (sheet, event) => {
  var dobCol = sheet.getColumn(2);
  dobCol.width = 25;
  
  
  _.each(cells, (e)=>{
    sheet.getCell(e).fill = fillColor;
    sheet.getCell(e).font = cellFont;
    sheet.getCell(e).alignment = cellAlignment;
   
  });
  
// Subheading
  _.each(subHeadingCells, (e)=>{
    sheet.getCell(e).fill = fillColorSubheading;
    sheet.getCell(e).font = fontSubheading;
    sheet.getCell(e).alignment = cellAlignmentCenter;
  });

 // sheet.mergeCells('B12:C12');
  sheet.mergeCells('A1:H1');
  sheet.getCell('A1').alignment =  { vertical: 'middle', horizontal: 'center' };
  sheet.getCell('A1').font = {  name: 'Calibri', family: 2, size: 14, bold: true, underline: true  };
  sheet.getCell('A1').value = "Event Summary Sheet";
  
  _.each(mergeCells, (e) =>{
    let cell1, cell2;
    _.each(e, (f, key) =>{
      if(key === 0 ) {
        cell1 = f;
      } else {
        cell2 = f;
      }
     
    })
    // console.log("Merge Cells3: ", cell1, cell2);
    sheet.mergeCells(`'${cell1}:${cell2}'`);
    sheet.getCell(cell1).alignment = cellAlignmentCenter;
    sheet.getCell(cell1).font = cellFont;
    sheet.getCell(cell1).fill = fillColorHeading;
  });

//Single cells heading
  _.each(headingCells,(e) => {
    sheet.getCell(e).fill = fillColorHeading;
      sheet.getCell(e).font = cellFont;
      sheet.getCell(e).alignment = cellAlignmentCenter;
  });


// borders
  let cellBorder = {
    top: {style:'thin'},
    left: {style:'thin'},
    bottom: {style:'thin'},
    right: {style:'thin'}
};


  let row = sheet.getRow(1);
  row.height = 40;

  sheet.getCell("B2").value = "Event Name";
  sheet.getCell("C2").value = event.basicDetails.eventName;

  sheet.getCell("B3").value = "Location";
  sheet.getCell("C3").value = event.basicDetails.eventDestination.join(',');

  sheet.getCell("B4").value = "Date";
  sheet.getCell("C4").value = event.basicDetails.eventStart;

  sheet.getCell("B6").value = "Host Name";
  sheet.getCell("C6").value = event.hostDetails.eventHostName;

  sheet.getCell("B7").value = "Contact Person Name";
 // sheet.getCell("B7").cellComments = "This is  a comment";
  sheet.getCell("C7").value = event.hostDetails.eventHostContact;

  sheet.getCell("B8").value = "Contact Person Number";
  sheet.getCell("C8").value = event.hostDetails.eventHostContactNumber;

  sheet.getCell("B9").value = "Event/Host Email";
  sheet.getCell("C9").value = event.hostDetails.eventHostContactEmail;
};

const appLoggedInfo = (sheet, event, details) => {

  let { total, registered } = details;

  sheet.getCell("B12").value = "App Users";
  sheet.getCell("B12").width = 80;

  sheet.getCell("B13").value = "Particulars";
  sheet.getCell("C13").value = "Quantity";

  sheet.getCell("B14").value = "Total";
  sheet.getCell("C14").value = total;

  // sheet.getCell("B15").value = "Downloaded";
  // sheet.getCell("C15").value = total;

  sheet.getCell("B15").value = "Logged-in";
  sheet.getCell("C15").value = registered;

  sheet.getCell("B16").value = "Pending";
  sheet.getCell("C16").value = total - registered;
}

const demographicsInfo = (sheet, event, details) => {

  let { total, registered } = details;
  // console.log("Totals : ", total);
  // console.log("Details: ", details);
  sheet.getCell("E12").value = "Guest Demographics";
  sheet.getCell("E12").width = 80;

  sheet.getCell("E13").value = "Particulars";
  sheet.getCell("F13").value = "Quantity";

  sheet.getCell("E14").value = "Male";
  sheet.getCell("E14").fill = fillColor;
  sheet.getCell("E14").font = cellFont;


  sheet.getCell("F14").value = details.male;

  sheet.getCell("E15").value = "Female";
  sheet.getCell("E15").fill = fillColor;




  //sheet.getCell("E15").cellComments = ['atEnd', 'asDisplayed', 'None'];
  sheet.getCell("F15").value = details.female;

  sheet.getCell("E16").value = "Child"; 
  sheet.getCell("E16").fill = fillColor;
  sheet.getCell("F16").value = details.child;
}

const guestInvitedInfo = (sheet, event, details) => {

  let { primaryGuests, totalGuests } = details;

  sheet.getCell("B19").value = "Guest Invited";
  sheet.getCell("B19").width = 80;

  sheet.getCell("B20").value = "Particulars";
  sheet.getCell("C20").value = "Quantity";

  sheet.getCell("B21").value = "Total";
  sheet.getCell("C21").value = totalGuests;

  sheet.getCell("B22").value = "Primary";
  sheet.getCell("C22").value = primaryGuests;

  sheet.getCell("B23").value = "Secondary";
  sheet.getCell("C23").value = totalGuests - primaryGuests;
}

const rsvpTotalsInfo = (sheet, event, details) => {

  let { rsvpsYes, rsvpsNo, totalGuests } = details;

  sheet.getCell("E19").value = "RSVP Totals";
  sheet.getCell("E19").width = 80;

  sheet.getCell("E20").value = "Particulars";
  sheet.getCell("F20").value = "Quantity";

  sheet.getCell("E21").value = "Attending";
  sheet.getCell("F21").value = rsvpsYes;

  sheet.getCell("E22").value = "Regret";
  sheet.getCell("F22").value = rsvpsNo;

  sheet.getCell("E23").value = "Not Responded";
  sheet.getCell("F23").value = totalGuests - rsvpsYes - rsvpsNo;
}

function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

const rsvpByDateInfo = (sheet, event, details) => {

  let { rsvpByDate, totalGuests } = details;

  let rsvpsYes = rsvpByDate.map(r => r.rsvpYes);
  let rsvpsNo = rsvpByDate.map(r => r.rsvpNo);
  let rsvpsMaybe = rsvpsYes.map((r, index) => {
    return totalGuests - r - rsvpsNo[index];
  });

  let dates = rsvpByDate.map(r => r.subEventDate);


  sheet.getCell("B26").value = "RSVP By Date";
  sheet.getCell("B26").width = 80;

  sheet.getCell("B27").value = "Date";
  sheet.getCell("B27").width = 80;

  let baseDate = 'C';
  dates.forEach(d => {
    sheet.getCell(baseDate+'27').value = d;
    sheet.getCell(baseDate+'27').fill = fillColorSubheading;
    sheet.getCell(baseDate+'27').font = fontSubheading;
    sheet.getCell(baseDate+'27').alignment = cellAlignmentCenter;
    baseDate = nextChar(baseDate);
  });

  sheet.getCell("B28").value = "Attending";
  sheet.getCell("B29").value = "Regret";
  sheet.getCell("B30").value = "Not Responded";

  baseDate = 'C';
  dates.forEach((d,index) => {
    sheet.getCell(baseDate+'28').value = rsvpsYes[index];
    sheet.getCell(baseDate+'29').value = rsvpsNo[index];
    sheet.getCell(baseDate+'30').value = rsvpsMaybe[index];
    baseDate = nextChar(baseDate);
  });
}

const rsvpBySubEventInfo = (sheet, event, details) => {

  let { rsvpBySubevent, totalGuests } = details;
  let rsvpsYes = rsvpBySubevent.map(r => r.rsvpYes);
  let rsvpsNo = rsvpBySubevent.map(r => r.rsvpNo);
  let rsvpsMaybe = rsvpsYes.map((r,index) => {
    return totalGuests - r - rsvpsNo[index];
  });

  let events = rsvpBySubevent.map(r => {
    return r.subEventName.match(/.{1,50}/g);
  });


  sheet.getCell("B32").value = "RSVP By Sub-Event";
  sheet.getCell("B32").width = 80;

  sheet.getCell("B33").value = "Sub-Event";
  sheet.getCell("B33").width = 80;

  let baseDate = 'C';
  events.forEach(d => {
    sheet.getCell(baseDate+'33').value = d[0];
    sheet.getCell(baseDate+'33').fill = fillColorSubheading;
    sheet.getCell(baseDate+'33').font = fontSubheading;
    sheet.getCell(baseDate+'33').alignment = cellAlignmentCenter;
    baseDate = nextChar(baseDate);
   
  });

  sheet.getCell("B34").value = "Attending";
  sheet.getCell("B35").value = "Regret";
  sheet.getCell("B36").value = "Not Responded";

  baseDate = 'C';
  events.forEach((d,index) => {
    sheet.getCell(baseDate+'34').value = rsvpsYes[index];
    sheet.getCell(baseDate+'35').value = rsvpsNo[index];
    sheet.getCell(baseDate+'36').value = rsvpsMaybe[index];
    baseDate = nextChar(baseDate);
  });
}

const rsvpByDestinationInfo = (sheet, event, details) => {

  let { rsvpByDestination, totalGuests } = details;
    var rsvpsYes = rsvpByDestination.map(r => r.rsvpYes);
    var rsvpsNo = rsvpByDestination.map(r => r.rsvpNo);
    var rsvpsMaybe = rsvpsYes.map((r,index) => {
      return totalGuests - r - rsvpsNo[index];
    });
  var location = rsvpByDestination.map(r => r.subEventDestination);

  sheet.getCell("B38").value = "RSVP By Destination";
  sheet.getCell("B38").width = 80;

  sheet.getCell("B39").value = "Destination";
  sheet.getCell("B39").width = 80;

  let baseDate = 'C';
  location.forEach(d => {
    sheet.getCell(baseDate+'39').value = d;
    sheet.getCell(baseDate+'39').fill = fillColorSubheading;
    sheet.getCell(baseDate+'39').font = fontSubheading;
    sheet.getCell(baseDate+'39').alignment = cellAlignmentCenter;
    baseDate = nextChar(baseDate);
  });

  sheet.getCell("B40").value = "Attending";
  sheet.getCell("B41").value = "Regret";
  sheet.getCell("B42").value = "Not Responded";

  baseDate = 'C';
  location.forEach((d,index) => {
    sheet.getCell(baseDate+'40').value = rsvpsYes[index];
    sheet.getCell(baseDate+'41').value = rsvpsNo[index];
    sheet.getCell(baseDate+'42').value = rsvpsMaybe[index];
    baseDate = nextChar(baseDate);
  });
}

const hotelsAllocationInfo = (sheet, event, details) => {

  let { hotelInfo } = details;
  var totalRooms = hotelInfo.map(h => h.totalRooms);
  var reservedRooms = hotelInfo.map(h => h.occupiedRooms);
  var availableRooms = totalRooms.map((t,index) => {
    return t - reservedRooms[index];
  });
  var hotel = hotelInfo.map(h => h.hotelName);


  sheet.getCell("B45").value = "Hotel for Allocation";
  sheet.getCell("B45").width = 80;

  sheet.getCell("B46").value = "Hotel";
  sheet.getCell("B46").width = 80;

  let baseDate = 'C';
  hotel.forEach(d => {
    sheet.getCell(baseDate+'46').value = d;
    sheet.getCell(baseDate+'46').fill = fillColorSubheading;
    sheet.getCell(baseDate+'46').font = fontSubheading;
    sheet.getCell(baseDate+'46').alignment = cellAlignmentCenter;
    baseDate = nextChar(baseDate);
  });

  sheet.getCell("B47").value = "Total";
  sheet.getCell("B48").value = "Sold";
  sheet.getCell("B49").value = "Available";

  baseDate = 'C';
  hotel.forEach((d,index) => {
    sheet.getCell(baseDate+'47').value = totalRooms[index];
    sheet.getCell(baseDate+'48').value = reservedRooms[index];
    sheet.getCell(baseDate+'49').value = availableRooms[index];
    baseDate = nextChar(baseDate);
  });
}

const hotelsSaleInfo = (sheet, event, details) => {

  let { hotelForSaleInfo } = details;

  let totalPaidRooms = hotelForSaleInfo.map(h => h.totalRooms);
  let reservedPaidRooms = hotelForSaleInfo.map(h => h.occupiedRooms);
  let availablePaidRooms = totalPaidRooms.map((t,index) => {
    return t - reservedPaidRooms[index];
  });
  let hotelPaid = hotelForSaleInfo.map(h => [h.hotelName]);


  sheet.getCell("B51").value = "Hotel for Sale";
  sheet.getCell("B51").width = 80;

  sheet.getCell("B52").value = "Hotel";
  sheet.getCell("B52").width = 80;

  let baseDate = 'C';
  hotelPaid.forEach(d => {
    sheet.getCell(baseDate+'52').value = d;
    baseDate = nextChar(baseDate);
  });

  sheet.getCell("B53").value = "Total";
  sheet.getCell("B54").value = "Sold";
  sheet.getCell("B55").value = "Available";

  baseDate = 'C';
  hotelPaid.forEach((d,index) => {
    sheet.getCell(baseDate+'53').value = totalPaidRooms[index];
    sheet.getCell(baseDate+'54').value = reservedPaidRooms[index];
    sheet.getCell(baseDate+'55').value = availablePaidRooms[index];
    baseDate = nextChar(baseDate);
  });
}

const flightsAllocationInfo = (sheet, event, details) => {

  let { flightInfo } = details;
  // Allocation
  let totalSeats = flightInfo.map(f => f.totalSeats);
  let reservedSeats = flightInfo.map(f => f.bookedSeats);
  let availableSeats = totalSeats.map((t,index) => {
    return t - reservedSeats[index];
  });
  let flight = flightInfo.map(f => f.name);


  sheet.getCell("B57").value = "Flights for Assignment";
  sheet.getCell("B57").width = 80;

  sheet.getCell("B58").value = "Flight";
  sheet.getCell("B58").width = 80;

  let baseDate = 'C';
  flight.forEach(d => {
    sheet.getCell(baseDate+'58').value = d;
    sheet.getCell(baseDate+'58').fill = fillColorSubheading;
    sheet.getCell(baseDate+'58').font = fontSubheading;
    sheet.getCell(baseDate+'58').alignment = cellAlignmentCenter;
    baseDate = nextChar(baseDate);
  });

  sheet.getCell("B59").value = "Total";
  sheet.getCell("B60").value = "Assigned";
  sheet.getCell("B61").value = "Available";

  baseDate = 'C';
  flight.forEach((d,index) => {
    sheet.getCell(baseDate+'59').value = totalSeats[index];
    sheet.getCell(baseDate+'60').value = reservedSeats[index];
    sheet.getCell(baseDate+'61').value = availableSeats[index];
    baseDate = nextChar(baseDate);
  });
}

const flightsSaleInfo = (sheet, event, details) => {

  let { flightForSaleInfo } = details;
  let flightInfo = flightForSaleInfo;
  // Paid
  let totalPaidSeats = flightInfo.map(f => f.totalSeats);
  let reservedPaidSeats = flightInfo.map(f => f.bookedSeats);
  let availablePaidSeats = totalPaidSeats.map((t,index) => {
    return t - reservedPaidSeats[index];
  });
  let flightPaid = flightInfo.map(f => f.name);


  sheet.getCell("B63").value = "Flights for Sale";
  sheet.getCell("B63").width = 80;

  sheet.getCell("B64").value = "Flight";
  sheet.getCell("B64").width = 80;

  let baseDate = 'C';
  flightPaid.forEach(d => {
    sheet.getCell(baseDate+'64').value = d;
    sheet.getCell(baseDate+'64').fill = fillColorSubheading;
    sheet.getCell(baseDate+'64').font = fontSubheading;
    sheet.getCell(baseDate+'64').alignment = cellAlignmentCenter;
    baseDate = nextChar(baseDate);
  });

  sheet.getCell("B65").value = "Total";
  sheet.getCell("B66").value = "Sold";
  sheet.getCell("B67").value = "Available";

  baseDate = 'C';
  flightPaid.forEach((d,index) => {
    sheet.getCell(baseDate+'65').value = totalPaidSeats[index];
    sheet.getCell(baseDate+'66').value = reservedPaidSeats[index];
    sheet.getCell(baseDate+'67').value = availablePaidSeats[index];
    baseDate = nextChar(baseDate);
  });
}

const foodInfo = (sheet, event, details) => {
  let { foodPreferences } = details;
  let count = foodPreferences.map(f => f.count);
  let labels = foodPreferences.map(f => f.preference);

  sheet.getCell("B70").value = "F&B";
  sheet.getCell("B70").width = 80;

  sheet.getCell("B71").value = "Particulars";
  sheet.getCell("C71").value = "Quantity";

  let baseCount = 72;
  labels.forEach((l,index) => {
    sheet.getCell("B"+(baseCount+index)).value = l;
  });

  count.forEach((c,index) => {
    sheet.getCell("C"+(baseCount+index)).value = c;
  });
};

const sizeInfo = (sheet, event, details) => {
  let { sizePreferences } = details;
  let count = sizePreferences.map(f => f.count);
  let labels = sizePreferences.map(f => f.preference);

  sheet.getCell("E70").value = "Merchandize";
  sheet.getCell("E70").width = 80;

  sheet.getCell("E71").value = "Particulars";
  sheet.getCell("F71").value = "Quantity";

  let baseCount = 72;
  labels.forEach((l,index) => {
    sheet.getCell("E"+(baseCount+index)).value = l;
  });

  count.forEach((c,index) => {
    sheet.getCell("F"+(baseCount+index)).value = c;
  });
};


const specialAssistanceInfo = (sheet, event, details) => {
  let { specialPreferences } = details;
  let count = specialPreferences.map(f => f.count);
  let labels = specialPreferences.map(f => f.preference);

  sheet.getCell("B77").value = "Special Assistance";
  sheet.getCell("B77").width = 80;

  sheet.getCell("B78").value = "Particulars";
  sheet.getCell("C78").value = "Quantity";

  let baseCount = 79;
  labels.forEach((l,index) => {
    sheet.getCell("B"+(baseCount+index)).value = l;
  });

  count.forEach((c,index) => {
    sheet.getCell("C"+(baseCount+index)).value = c;
  });
};

export default (event, summaryData) => {

  var workbook = new Excel.Workbook();
  var sheet = workbook.addWorksheet('Event Summary',{properties: {showGridLines: false}});
  
  basicInfo(sheet, event);
  appLoggedInfo(sheet, event, summaryData);
  demographicsInfo(sheet, event, summaryData);
  guestInvitedInfo(sheet, event, summaryData);
  rsvpTotalsInfo(sheet, event, summaryData);
  rsvpByDateInfo(sheet, event, summaryData);
  rsvpBySubEventInfo(sheet, event, summaryData);
  rsvpByDestinationInfo(sheet, event, summaryData);
  hotelsAllocationInfo(sheet, event, summaryData);
  hotelsSaleInfo(sheet, event, summaryData);
  flightsAllocationInfo(sheet, event, summaryData);
  flightsSaleInfo(sheet, event, summaryData);
  foodInfo(sheet, event, summaryData);
  sizeInfo(sheet, event, summaryData);
  specialAssistanceInfo(sheet, event, summaryData);

  workbook.xlsx.writeBuffer().then(function (data) {
    FileSaver.saveAs(new Blob([data],{type:"application/octet-stream"}), `summary.xlsx`);
  });

  // var workbook = XLSX.utils.book_new();

  // var ws = XLSX.utils.aoa_to_sheet([]);

  // XLSX.utils.book_append_sheet(workbook, ws, "Event Summary");

  // saveFile(workbook);

};
