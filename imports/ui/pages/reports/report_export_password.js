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
let headingCells = ["A3", "B3", "C3", "D3", "E3", "F3", "G3"];

const fillData = (sheet, data) => {
  sheet.getColumn(1).width = 15;
  sheet.getColumn(2).width = 15;
  sheet.getColumn(3).width = 25;
  sheet.getColumn(4).width = 15;
  sheet.getColumn(5).width = 20;
  sheet.getColumn(6).width = 25;
  sheet.getColumn(7).width = 10;
  sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
  sheet.getCell("A1").font = {
    name: "Calibri",
    family: 2,
    size: 14,
    bold: true,
    underline: true
  };
  sheet.getCell("A1").value = "Event Password Report";

  sheet.mergeCells("A1:G1");

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
  sheet.getCell("D3").value = "Gender";
  sheet.getCell("E3").value = "Contact Number";
  sheet.getCell("F3").value = "Email";
  sheet.getCell("G3").value = "Password";

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
    sheet.getCell(`D${baseCount + index}`).value =
      d.guestGender === "male" ? "Male" : "Female";
    sheet.getCell(`E${baseCount + index}`).value =
      d.guestPhoneCode + "-" + d.guestContactNo;
    sheet.getCell(`F${baseCount + index}`).value = d.guestPersonalEmail;
    sheet.getCell(`G${baseCount + index}`).value = d.accessCode;
  });

  sheet.getCell("A2").value = `Total Guests: ${data.length} `;

  sheet.mergeCells("A2:D2");
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
      `Guest-password-report.xlsx`
    );
  });
};
