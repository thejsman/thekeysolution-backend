import FileSaver from "file-saver";
import moment from "moment";
import Excel from "../../../extras/client/excel.js";
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
  "M3",
  "N3",
  "O3",
  "P3"
];

const fillData = (sheet, data) => {
  sheet.getColumn(4).width = 20;
  sheet.getColumn(5).width = 20;
  sheet.getColumn(7).width = 25;
  sheet.getColumn(8).width = 25;
  sheet.getColumn(9).width = 12;
  sheet.getColumn(10).width = 15;
  sheet.getColumn(15).width = 15;
  sheet.getColumn(16).width = 15;
  sheet.getColumn(13).width = 25;
  sheet.getColumn(14).width = 25;

  sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
  sheet.getCell("A1").font = {
    name: "Calibri",
    family: 2,
    size: 14,
    bold: true,
    underline: true
  };
  sheet.getCell("A1").value = "Event RSVP Info Report";

  sheet.mergeCells("A1:P1");

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
  sheet.getCell("C3").value = "Title";
  sheet.getCell("D3").value = "First Name";
  sheet.getCell("E3").value = "Last Name";
  sheet.getCell("F3").value = "Is Primary";
  sheet.getCell("G3").value = "How to address in the App";
  sheet.getCell("H3").value = "Email";
  sheet.getCell("I3").value = "Country Code";
  sheet.getCell("J3").value = "Mobile No";
  sheet.getCell("K3").value = "Date of Birth";
  sheet.getCell("L3").value = "Gender";
  sheet.getCell("M3").value = "Meal Preference";
  sheet.getCell("N3").value = "Meal Remark";
  sheet.getCell("O3").value = "Login Date";
  sheet.getCell("P3").value = "Login Time";

  let baseCount = 4;
  let logedInCount = 0;
  data.forEach((d, index) => {
    const time = d.appLoginTime ? moment.unix(new Date(d.appLoginTime)) : "";
    if(d.appLoginTime){
      logedInCount++;
    }
    sheet.getCell(`A${baseCount + index}`).value = d.folioNumber;
    sheet.getCell(`B${baseCount + index}`).value = d.guestFamilyID;
    sheet.getCell(`C${baseCount + index}`).value = d.guestTitle;
    sheet.getCell(`D${baseCount + index}`).value = d.guestFirstName;
    sheet.getCell(`E${baseCount + index}`).value = d.guestLastName;
    sheet.getCell(`F${baseCount + index}`).value = d.guestIsPrimary
      ? "Yes"
      : "No";
    sheet.getCell(`G${baseCount + index}`).value = d._id;
    sheet.getCell(`H${baseCount + index}`).value = d.guestPersonalEmail;
    sheet.getCell(`I${baseCount + index}`).value = d.guestPhoneCode;
    sheet.getCell(`J${baseCount + index}`).value = d.guestContactNo;
    sheet.getCell(`K${baseCount + index}`).value = "";
    sheet.getCell(`L${baseCount + index}`).value = d.guestGender;
    sheet.getCell(`M${baseCount + index}`).value = d.guestMealPreference;
    sheet.getCell(`N${baseCount + index}`).value = d.guestMealRemark;
    sheet.getCell(`O${baseCount + index}`).value = time
      ? time.format("MM-DD-YY")
      : "";
    sheet.getCell(`P${baseCount + index}`).value = time
      ? time.format("HH:mm")
      : "";
  });

  sheet.getCell("A2").value = `Total Guests: ${data.length} | Loggedin Guest: ${logedInCount} | Not Loggedin Guest: ${data.length - logedInCount}`;

  sheet.mergeCells("A2:P2");
};

export default data => {
  var workbook = new Excel.Workbook();
  var sheet = workbook.addWorksheet("Event Summary", {
    properties: { showGridLines: false }
  });
  fillData(sheet, data);

  workbook.xlsx.writeBuffer().then(function(data) {
    FileSaver.saveAs(
      new Blob([data], { type: "application/octet-stream" }),
      `Guest-RSVP-Info-Report.xlsx`
    );
  });
};
