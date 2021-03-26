import FileSaver from "file-saver";
import moment from "moment";
import Excel from "../../../extras/client/excel.js";
import _ from "lodash";
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
let headingCells = ["A3", "B3", "C3", "D3", "E3", "F3", "G3", "H3", "I3"];

const fillData = (sheet, data) => {
  sheet.getColumn(3).width = 20;
  sheet.getColumn(4).width = 10;
  sheet.getColumn(5).width = 25;
  sheet.getColumn(6).width = 25;
  sheet.getColumn(8).width = 25;
  sheet.getColumn(9).width = 20;

  sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
  sheet.getCell("A1").font = {
    name: "Calibri",
    family: 2,
    size: 14,
    bold: true,
    underline: true
  };
  sheet.getCell("A1").value = "Event Meal Preference Report";

  sheet.mergeCells("A1:I1");

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
  sheet.getCell("D3").value = "Is Primary";
  sheet.getCell("E3").value = "Email";
  sheet.getCell("F3").value = "Contact Number";
  sheet.getCell("G3").value = "Gender";
  sheet.getCell("H3").value = "Meal Preference";
  sheet.getCell("I3").value = "Meal Remark";

  let baseCount = 4;
  let logedInCount = 0;

  data.forEach((d, index) => {
    const time = d.appLoginTime ? moment.unix(new Date(d.appLoginTime)) : "";
    if (d.appLoginTime) {
      logedInCount++;
    }
    sheet.getCell(`A${baseCount + index}`).value = d.folioNumber;
    sheet.getCell(`B${baseCount + index}`).value = d.guestFamilyID;
    sheet.getCell(`C${baseCount + index}`).value =
      d.guestTitle + " " + d.guestFirstName + " " + d.guestLastName;
    sheet.getCell(`D${baseCount + index}`).value = d.guestIsPrimary
      ? "Yes"
      : "No";

    sheet.getCell(`E${baseCount + index}`).value = d.guestPersonalEmail;
    sheet.getCell(`F${baseCount + index}`).value =
      d.guestPhoneCode + "-" + d.guestContactNo;
    sheet.getCell(`G${baseCount + index}`).value =
      d.guestGender === "male" ? "Male" : "Female";
    sheet.getCell(`H${baseCount + index}`).value = d.foodPreference;
    sheet.getCell(`I${baseCount + index}`).value = d.foodPreferencesRemark;
  });
  let displaySummary = "";
  const mealSummary = _(data)
    .groupBy("foodPreference")
    .map((items, name) => ({ name, count: items.length }))
    .value()
    .filter(el => el.name !== "undefined");
  mealSummary.map(el => (displaySummary += el.name + ": " + el.count + " | "));

  sheet.getCell(
    "A2"
  ).value = `Total Guests: ${data.length} | Meal Peferences: ${displaySummary}`;

  sheet.mergeCells("A2:N2");
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
      `Guest-Meal-Preference-Report.xlsx`
    );
  });
};
