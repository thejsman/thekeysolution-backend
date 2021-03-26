import FileSaver from "file-saver";
import Excel from "../../../extras/client/excel.js";
import moment from "moment";

let fillColorHeading = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF4D03F" }
};
let cellFont = {
  name: "Calibri",
  size: 11,
  bold: true
};

let cellAlignmentCenter = { vertical: "middle", horizontal: "center" };
let headingCells = [
  "A3",
  "B3",
  "C3",
  "D3",
  "E3",
  "F3",
  "G3",
  "H3",
  "I3",
  "J3",
  "K3",
  "L3",
  "M3"
];

const fillData = (sheet, data) => {
  sheet.getColumn(3).width = 20;
  sheet.getColumn(4).width = 20;
  sheet.getColumn(5).width = 20;
  sheet.getColumn(7).width = 20;
  sheet.getColumn(8).width = 20;
  sheet.getColumn(9).width = 12;
  sheet.getColumn(10).width = 16;
  sheet.getColumn(11).width = 16;
  sheet.getColumn(12).width = 20;
  sheet.getColumn(13).width = 20;

  sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
  sheet.getCell("A1").font = {
    name: "Calibri",
    family: 2,
    size: 14,
    bold: true,
    underline: true
  };
  sheet.getCell("A1").value = "Event Hotels Report";

  sheet.mergeCells("A1:M1");

  //Single cells heading
  _.each(headingCells, e => {
    sheet.getCell(e).fill = fillColorHeading;
    sheet.getCell(e).font = cellFont;
    sheet.getCell(e).alignment = cellAlignmentCenter;
  });

  let row = sheet.getRow(1);
  row.height = 25;

  sheet.getCell("A3").value = "Folio No";
  sheet.getCell("B3").value = "Family ID";
  sheet.getCell("C3").value = "Guest Name";
  sheet.getCell("D3").value = "Email";
  sheet.getCell("E3").value = "Contact Number";
  sheet.getCell("F3").value = "Gender";
  sheet.getCell("G3").value = "Hotel Name";
  sheet.getCell("H3").value = "Room Category";
  sheet.getCell("I3").value = "Bed Type";
  sheet.getCell("J3").value = "Check-in Date";
  sheet.getCell("K3").value = "Check-out Date";
  sheet.getCell("L3").value = "Placeholder Room No.";
  sheet.getCell("M3").value = "Display Room No.";

  let baseCount = 4;
  let logedInCount = 0;
  data.forEach((d, index) => {
    const time = d.appLoginTime ? moment(d.appLoginTime) : "";
    if (d.appLoginTime) {
      logedInCount++;
    }
    sheet.getCell(`A${baseCount + index}`).value = d.folioNumber;
    sheet.getCell(`B${baseCount + index}`).value = d.guestFamilyID;
    sheet.getCell(`C${baseCount + index}`).value =
      d.guestTitle + " " + d.guestFirstName + " " + d.guestLastName;
    sheet.getCell(`D${baseCount + index}`).value = d.guestPersonalEmail;
    sheet.getCell(`E${baseCount + index}`).value =
      d.guestPhoneCode + "-" + d.guestContactNo;
    sheet.getCell(`F${baseCount + index}`).value =
      d.guestGender === "male" ? "Male" : "Female";

    if (d.hotelBookings.length === 1) {
      d.hotelBookings.forEach(h => {
        sheet.getCell(`G${baseCount + index}`).value = h.hotelName;
        sheet.getCell(`H${baseCount + index}`).value = h.roomCategory;
        sheet.getCell(`I${baseCount + index}`).value = h.bedType;

        sheet.getCell(`J${baseCount + index}`).value = h.checkInDate;
        sheet.getCell(`K${baseCount + index}`).value = h.checkOutDate;
        sheet.getCell(`L${baseCount + index}`).value = h.placeHolderRoomNo;
        sheet.getCell(`M${baseCount + index}`).value = h.displayRoom;
      });
    } else if (d.hotelBookings.length === 2) {
      sheet.getCell(`G${baseCount + index}`).value =
        d.hotelBookings[0].hotelName;
      sheet.getCell(`H${baseCount + index}`).value =
        d.hotelBookings[0].roomCategory;
      sheet.getCell(`I${baseCount + index}`).value = d.hotelBookings[0].bedType;
      sheet.getCell(`J${baseCount + index}`).value =
        d.hotelBookings[0].checkInDate;
      sheet.getCell(`K${baseCount + index}`).value =
        d.hotelBookings[0].checkOutDate;
      sheet.getCell(`L${baseCount + index}`).value =
        d.hotelBookings[0].placeHolderRoomNo;
      sheet.getCell(`M${baseCount + index}`).value =
        d.hotelBookings[0].displayRoom;

      sheet.getCell(`N${baseCount + index}`).value =
        d.hotelBookings[1].hotelName;
      sheet.getCell(`O${baseCount + index}`).value =
        d.hotelBookings[1].roomCategory;
      sheet.getCell(`P${baseCount + index}`).value = d.hotelBookings[1].bedType;
      sheet.getCell(`Q${baseCount + index}`).value =
        d.hotelBookings[1].checkInDate;
      sheet.getCell(`R${baseCount + index}`).value =
        d.hotelBookings[1].checkOutDate;
      sheet.getCell(`S${baseCount + index}`).value =
        d.hotelBookings[1].placeHolderRoomNo;
      sheet.getCell(`T${baseCount + index}`).value =
        d.hotelBookings[1].displayRoom;
      hotelOne(sheet);
    } else if (d.hotelBookings.length === 3) {
      sheet.getCell(`G${baseCount + index}`).value =
        d.hotelBookings[0].hotelName;
      sheet.getCell(`H${baseCount + index}`).value =
        d.hotelBookings[0].roomCategory;
      sheet.getCell(`I${baseCount + index}`).value = d.hotelBookings[0].bedType;
      sheet.getCell(`J${baseCount + index}`).value =
        d.hotelBookings[0].checkInDate;
      sheet.getCell(`K${baseCount + index}`).value =
        d.hotelBookings[0].checkOutDate;
      sheet.getCell(`L${baseCount + index}`).value =
        d.hotelBookings[0].placeHolderRoomNo;
      sheet.getCell(`M${baseCount + index}`).value =
        d.hotelBookings[0].displayRoom;

      sheet.getCell(`N${baseCount + index}`).value =
        d.hotelBookings[1].hotelName;
      sheet.getCell(`O${baseCount + index}`).value =
        d.hotelBookings[1].roomCategory;
      sheet.getCell(`P${baseCount + index}`).value = d.hotelBookings[1].bedType;
      sheet.getCell(`Q${baseCount + index}`).value =
        d.hotelBookings[1].checkInDate;
      sheet.getCell(`R${baseCount + index}`).value =
        d.hotelBookings[1].checkOutDate;
      sheet.getCell(`S${baseCount + index}`).value =
        d.hotelBookings[1].placeHolderRoomNo;
      sheet.getCell(`T${baseCount + index}`).value =
        d.hotelBookings[1].displayRoom;

      sheet.getCell(`U${baseCount + index}`).value =
        d.hotelBookings[2].hotelName;
      sheet.getCell(`V${baseCount + index}`).value =
        d.hotelBookings[2].roomCategory;
      sheet.getCell(`W${baseCount + index}`).value = d.hotelBookings[2].bedType;
      sheet.getCell(`X${baseCount + index}`).value =
        d.hotelBookings[2].checkInDate;
      sheet.getCell(`Y${baseCount + index}`).value =
        d.hotelBookings[2].checkOutDate;
      sheet.getCell(`Z${baseCount + index}`).value =
        d.hotelBookings[2].placeHolderRoomNo;
      sheet.getCell(`AA${baseCount + index}`).value =
        d.hotelBookings[2].displayRoom;
      hotelTwo(sheet);
    }
  });
};
function hotelOne(sheet) {
  sheet.getCell("N3").value = "Hotel Name";
  sheet.getCell("O3").value = "Room Category";
  sheet.getCell("P3").value = "Bed Type";
  sheet.getCell("Q3").value = "Check-in Date";
  sheet.getCell("R3").value = "Check-out Date";
  sheet.getCell("S3").value = "Placeholder Room No.";
  sheet.getCell("T3").value = "Display Room No.";

  _.each(["N3", "O3", "P3", "Q3", "R3", "S3", "T3"], e => {
    sheet.getCell(e).fill = fillColorHeading;
    sheet.getCell(e).font = cellFont;
    sheet.getCell(e).alignment = cellAlignmentCenter;
  });
}
function hotelTwo(sheet) {
  hotelOne(sheet);

  sheet.getCell("U3").value = "Hotel Name";
  sheet.getCell("V3").value = "Room Category";
  sheet.getCell("W3").value = "Bed Type";
  sheet.getCell("X3").value = "Check-in Date";
  sheet.getCell("Y3").value = "Check-out Date";
  sheet.getCell("Z3").value = "Placeholder Room No.";
  sheet.getCell("AA3").value = "Display Room No.";
  _.each(["U3", "V3", "W3", "X3", "Y3", "Z3", "AA3"], e => {
    sheet.getCell(e).fill = fillColorHeading;
    sheet.getCell(e).font = cellFont;
    sheet.getCell(e).alignment = cellAlignmentCenter;
  });
}

export default data => {
  var workbook = new Excel.Workbook();
  var sheet = workbook.addWorksheet("Event Summary", {
    properties: { showGridLines: false }
  });
  fillData(sheet, data);

  workbook.xlsx.writeBuffer().then(function(data) {
    FileSaver.saveAs(
      new Blob([data], { type: "application/octet-stream" }),
      `Guest-loggedin.xlsx`
    );
  });
};
