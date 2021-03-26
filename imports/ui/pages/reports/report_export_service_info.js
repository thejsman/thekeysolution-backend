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

const dynamicColumnChars = cols => {
  const charGroup = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charLength = 26;
  const arr = Array(cols).fill("");
  return arr.map((a, i) => {
    let quotient = i / charLength;
    let floor = Math.floor(i / charLength);
    let reminder = i % charLength;
    if (floor) {
      if (reminder && Number.isInteger(quotient)) {
        return `${charGroup[floor - 1]}${charGroup[charGroup.length - 1]}`;
      }
      return `${charGroup[floor - 1]}${charGroup[reminder]}`;
    } else {
      if (reminder && Number.isInteger(quotient)) {
        return charGroup[charGroup.length - 1];
      }
      return charGroup[reminder];
    }
  });
};

const fillData = (sheet, data, services) => {
  const servicesKeys = Object.keys(services);
  const cols = dynamicColumnChars(7 + servicesKeys.length);
  const headingCells = cols.map(c => `${c}3`);

  sheet.getColumn(1).width = 12;
  sheet.getColumn(2).width = 15;
  sheet.getColumn(3).width = 30; //Full name
  sheet.getColumn(4).width = 15;
  sheet.getColumn(5).width = 40; //Email
  sheet.getColumn(6).width = 20;
  sheet.getColumn(7).width = 15;
  servicesKeys.forEach((k, i) => {
    sheet.getColumn(8 + i).width = 32;
  });

  sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
  sheet.getCell("A1").font = {
    name: "Calibri",
    family: 2,
    size: 14,
    bold: true,
    underline: true
  };
  sheet.getCell("A1").value = "Event Service Info Report";

  sheet.mergeCells(`${cols[0]}1:${cols[cols.length - 1]}1`);

  //Single cells heading
  _.each(headingCells, e => {
    sheet.getCell(e).fill = fillColorHeading;
    sheet.getCell(e).font = cellFont;
    sheet.getCell(e).alignment = cellAlignmentCenter;
  });

  let row = sheet.getRow(1);
  row.height = 25;

  const colTitles = [
    "Folio No",
    "Family ID",
    "Full Name",
    "Is Primary",
    "Email",
    "Mobile No",
    "Gender",
    ...servicesKeys.map(key => services[key].serviceName)
  ];

  cols.forEach((colName, i) => {
    sheet.getCell(`${colName}3`).value = colTitles[i];
  });

  let baseCount = 4;
  let logedInCount = 0;
  data.forEach((d, index) => {
    const colData = [
      d.folioNumber,
      d.guestFamilyID,
      d.guestTitle + " " + d.guestFirstName + " " + d.guestLastName,
      d.guestIsPrimary ? "Yes" : "No",
      d.guestPersonalEmail,
      d.guestPhoneCode + "-" + d.guestContactNo,
      d.guestGender,
      ...servicesKeys.map(key => d.serviceData[key])
    ];

    cols.forEach((colName, i) => {
      sheet.getCell(`${colName}${baseCount + index}`).value = colData[i];
    });
  });

  sheet.getCell("A2").value = `Total Guests: ${data.length} `;

  sheet.mergeCells("A2:I2");
};

export default (data, subEents) => {
  var workbook = new Excel.Workbook();
  var sheet = workbook.addWorksheet("Event Summary", {
    properties: { showGridLines: false }
  });
  fillData(sheet, data, subEents);

  workbook.xlsx.writeBuffer().then(function(data) {
    FileSaver.saveAs(
      new Blob([data], { type: "application/octet-stream" }),
      `Guest-Service-Info-Report.xlsx`
    );
  });
};
