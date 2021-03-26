import FileSaver from "file-saver";
import moment from "moment";
import _ from "lodash";
import Excel from "../../../extras/client/excel.js";
import { Airports } from "../../../api/airports/airports";
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

let flightBookings = [];
const airports = Airports.find().fetch();

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
  "O3"
];

const fillData = (sheet, data) => {
  sheet.getColumn(3).width = 20;
  sheet.getColumn(4).width = 10;
  sheet.getColumn(5).width = 25;
  sheet.getColumn(6).width = 20;
  sheet.getColumn(8).width = 15;
  sheet.getColumn(9).width = 15;

  sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
  sheet.getCell("A1").font = {
    name: "Calibri",
    family: 2,
    size: 14,
    bold: true,
    underline: true
  };
  sheet.getCell("A1").value = "Event Flights Report";

  sheet.mergeCells("A1:I1");

  //Single cells heading
  _.each(headingCells, e => {
    sheet.getCell(e).fill = fillColorHeading;
    sheet.getCell(e).font = cellFont;
    sheet.getCell(e).alignment = cellAlignmentCenter;
  });

  let row = sheet.getRow(1);
  let legValue = 0;
  row.height = 25;

  sheet.getCell("A3").value = "Folio No";
  sheet.getCell("B3").value = "Family ID";
  sheet.getCell("C3").value = "Guest Name";
  sheet.getCell("D3").value = "Is Primary";
  sheet.getCell("E3").value = "Email";
  sheet.getCell("F3").value = "Contact Number";
  sheet.getCell("G3").value = "Gender";

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

    d.flights.forEach(flight => {
      if (!_.isEmpty(_.find(flightBookings, { guestId: flight.guestId }))) {
        const guestFlightLenght = _.compact(flightBookings, {
          guestId: flight.guestId
        });
        legValue = guestFlightLenght[0].value;
        if (legValue === 1) {
          sheet.getCell(`P${baseCount + index}`).value =
            flight.agencyProvided === true ? "Agency" : "Guest";
          flight.flightLegs.forEach(flightLeg => {
            sheet.getCell(`Q${baseCount + index}`).value =
              flightLeg.airlineIATA;
            sheet.getCell(`R${baseCount + index}`).value = flightLeg.flightNo;
            sheet.getCell(`S${baseCount + index}`).value = flightLeg.pnr;
            sheet.getCell(`T${baseCount + index}`).value =
              flightLeg.departureCity;
            sheet.getCell(`U${baseCount + index}`).value = moment(
              flightLeg.flightDepartureTime
            ).format("DD-MM-YYYY HH:mm");
            sheet.getCell(`V${baseCount + index}`).value =
              flightLeg.arrivalCity;
            sheet.getCell(`W${baseCount + index}`).value = moment(
              flightLeg.flightArrivalTime
            ).format("DD-MM-YYYY HH:mm");
          });
          guestFlightLenght[0].value = 2;
        }

        if (legValue === 2) {
          sheet.getCell(`X${baseCount + index}`).value =
            flight.agencyProvided === true ? "Agency" : "Guest";
          flight.flightLegs.forEach(flightLeg => {
            sheet.getCell(`Y${baseCount + index}`).value =
              flightLeg.airlineIATA;
            sheet.getCell(`Z${baseCount + index}`).value = flightLeg.flightNo;
            sheet.getCell(`AA${baseCount + index}`).value = flightLeg.pnr;
            sheet.getCell(`AB${baseCount + index}`).value =
              flightLeg.departureCity;
            sheet.getCell(`AC${baseCount + index}`).value = moment(
              flightLeg.flightDepartureTime
            ).format("DD-MM-YYYY HH:mm");
            sheet.getCell(`AD${baseCount + index}`).value =
              flightLeg.arrivalCity;
            sheet.getCell(`AE${baseCount + index}`).value = moment(
              flightLeg.flightArrivalTime
            ).format("DD-MM-YYYY HH:mm");
          });
          guestFlightLenght[0].value = 3;
        }
        if (legValue === 3) {
          sheet.getCell(`AF${baseCount + index}`).value =
            flight.agencyProvided === true ? "Agency" : "Guest";
          flight.flightLegs.forEach(flightLeg => {
            sheet.getCell(`AG${baseCount + index}`).value =
              flightLeg.airlineIATA;
            sheet.getCell(`AH${baseCount + index}`).value = flightLeg.flightNo;
            sheet.getCell(`AI${baseCount + index}`).value = flightLeg.pnr;
            sheet.getCell(`AJ${baseCount + index}`).value =
              flightLeg.departureCity;
            sheet.getCell(`AK${baseCount + index}`).value = moment(
              flightLeg.flightDepartureTime
            ).format("DD-MM-YYYY HH:mm");
            sheet.getCell(`AL${baseCount + index}`).value =
              flightLeg.arrivalCity;
            sheet.getCell(`AM${baseCount + index}`).value = moment(
              flightLeg.flightArrivalTime
            ).format("DD-MM-YYYY HH:mm");
          });
          guestFlightLenght[0].value = 4;
        }
        if (legValue === 4) {
          sheet.getCell(`AN${baseCount + index}`).value =
            flight.agencyProvided === true ? "Agency" : "Guest";
          flight.flightLegs.forEach(flightLeg => {
            sheet.getCell(`AO${baseCount + index}`).value =
              flightLeg.airlineIATA;
            sheet.getCell(`AP${baseCount + index}`).value = flightLeg.flightNo;
            sheet.getCell(`${baseCount + index}`).value = flightLeg.pnr;
            sheet.getCell(`AQ${baseCount + index}`).value =
              flightLeg.departureCity;
            sheet.getCell(`AR${baseCount + index}`).value = moment(
              flightLeg.flightDepartureTime
            ).format("DD-MM-YYYY HH:mm");
            sheet.getCell(`AS${baseCount + index}`).value =
              flightLeg.arrivalCity;
            sheet.getCell(`AT${baseCount + index}`).value = moment(
              flightLeg.flightArrivalTime
            ).format("DD-MM-YYYY HH:mm");
          });
          guestFlightLenght[0].value = 5;
        }
        if (legValue === 5) {
          sheet.getCell(`AU${baseCount + index}`).value =
            flight.agencyProvided === true ? "Agency" : "Guest";
          flight.flightLegs.forEach(flightLeg => {
            sheet.getCell(`AV${baseCount + index}`).value =
              flightLeg.airlineIATA;
            sheet.getCell(`AW${baseCount + index}`).value = flightLeg.flightNo;
            sheet.getCell(`${baseCount + index}`).value = flightLeg.pnr;
            sheet.getCell(`AX${baseCount + index}`).value =
              flightLeg.departureCity;
            sheet.getCell(`AY${baseCount + index}`).value = moment(
              flightLeg.flightDepartureTime
            ).format("DD-MM-YYYY HH:mm");
            sheet.getCell(`AZ${baseCount + index}`).value =
              flightLeg.arrivalCity;
            sheet.getCell(`BA${baseCount + index}`).value = moment(
              flightLeg.flightArrivalTime
            ).format("DD-MM-YYYY HH:mm");
          });
          guestFlightLenght[0].value = 6;
        }
      } else {
        sheet.getCell(`H${baseCount + index}`).value =
          flight.agencyProvided === true ? "Agency" : "Guest";
        flight.flightLegs.forEach(flightLeg => {
          sheet.getCell(`I${baseCount + index}`).value = flightLeg.airlineIATA;
          sheet.getCell(`J${baseCount + index}`).value = flightLeg.flightNo;
          sheet.getCell(`K${baseCount + index}`).value = flightLeg.pnr;
          sheet.getCell(`L${baseCount + index}`).value =
            flightLeg.departureCity;
          sheet.getCell(`M${baseCount + index}`).value = moment(
            flightLeg.flightDepartureTime
          ).format("DD-MM-YYYY HH:mm");
          sheet.getCell(`N${baseCount + index}`).value = flightLeg.arrivalCity;
          sheet.getCell(`O${baseCount + index}`).value = moment(
            flightLeg.flightArrivalTime
          ).format("DD-MM-YYYY HH:mm");
        });
        flightBookings.push({ guestId: flight.guestId, value: 1 });
      }
    });
  });

  let displaySummary = "";
  const mealSummary = _(data)
    .groupBy("sizePreference")
    .map((items, name) => ({ name, count: items.length }))
    .value()
    .filter(el => el.name !== "undefined");
  mealSummary.map(el => (displaySummary += el.name + ": " + el.count + " | "));

  sheet.getCell("A2").value = `Total Guests: ${data.length}`;

  sheet.mergeCells("A2:N2");
  const maxValueObj = _.maxBy(_.values(flightBookings), "value");

  if (maxValueObj.value === 1) {
    sheet.getCell("H3").value = "Booking Type";
    sheet.getCell("I3").value = "Airline Code";
    sheet.getCell("J3").value = "Flight No.";
    sheet.getCell("K3").value = "PNR";
    sheet.getCell("L3").value = "From";
    sheet.getCell("M3").value = "Departure";
    sheet.getCell("N3").value = "To";
    sheet.getCell("O3").value = "Arrival";
  }

  if (maxValueObj.value === 2) {
    sheet.getCell("H3").value = "Booking Type";
    sheet.getCell("I3").value = "Airline Code";
    sheet.getCell("J3").value = "Flight No.";
    sheet.getCell("K3").value = "PNR";
    sheet.getCell("L3").value = "From";
    sheet.getCell("M3").value = "Departure";
    sheet.getCell("N3").value = "To";
    sheet.getCell("O3").value = "Arrival";

    sheet.getCell("P3").value = "Booking Type";
    sheet.getCell("Q3").value = "Airline Code";
    sheet.getCell("R3").value = "Flight No.";
    sheet.getCell("S3").value = "PNR";
    sheet.getCell("T3").value = "From";
    sheet.getCell("U3").value = "Departure";
    sheet.getCell("V3").value = "To";
    sheet.getCell("W3").value = "Arrival";

    ["P3", "Q3", "R3", "S3", "T3", "U3", "V3", "W3"].map(key => {
      sheet.getCell(key).fill = fillColorHeading;
      sheet.getCell(key).font = cellFont;
      sheet.getCell(key).alignment = cellAlignmentCenter;
    });
  }

  if (maxValueObj.value === 3) {
    sheet.getCell("H3").value = "Booking Type";
    sheet.getCell("I3").value = "Airline Code";
    sheet.getCell("J3").value = "Flight No.";
    sheet.getCell("K3").value = "PNR";
    sheet.getCell("L3").value = "From";
    sheet.getCell("M3").value = "Departure";
    sheet.getCell("N3").value = "To";
    sheet.getCell("O3").value = "Arrival";

    sheet.getCell("P3").value = "Booking Type";
    sheet.getCell("Q3").value = "Airline Code";
    sheet.getCell("R3").value = "Flight No.";
    sheet.getCell("S3").value = "PNR";
    sheet.getCell("T3").value = "From";
    sheet.getCell("U3").value = "Departure";
    sheet.getCell("V3").value = "To";
    sheet.getCell("W3").value = "Arrival";

    sheet.getCell("X3").value = "Booking Type";
    sheet.getCell("Y3").value = "Airline Code";
    sheet.getCell("Z3").value = "Flight No.";
    sheet.getCell("AA3").value = "PNR";
    sheet.getCell("AB3").value = "From";
    sheet.getCell("AC3").value = "Departure";
    sheet.getCell("AD3").value = "To";
    sheet.getCell("AE3").value = "Arrival";

    [
      "P3",
      "Q3",
      "R3",
      "S3",
      "T3",
      "U3",
      "V3",
      "W3",
      "X3",
      "Y3",
      "Z3",
      "AA3",
      "AB3",
      "AC3",
      "AD3",
      "AE3"
    ].map(key => {
      sheet.getCell(key).fill = fillColorHeading;
      sheet.getCell(key).font = cellFont;
      sheet.getCell(key).alignment = cellAlignmentCenter;
    });
  }

  if (maxValueObj.value === 4) {
    sheet.getCell("H3").value = "Booking Type";
    sheet.getCell("I3").value = "Airline Code";
    sheet.getCell("J3").value = "Flight No.";
    sheet.getCell("K3").value = "PNR";
    sheet.getCell("L3").value = "From";
    sheet.getCell("M3").value = "Departure";
    sheet.getCell("N3").value = "To";
    sheet.getCell("O3").value = "Arrival";

    sheet.getCell("P3").value = "Booking Type";
    sheet.getCell("Q3").value = "Airline Code";
    sheet.getCell("R3").value = "Flight No.";
    sheet.getCell("S3").value = "PNR";
    sheet.getCell("T3").value = "From";
    sheet.getCell("U3").value = "Departure";
    sheet.getCell("V3").value = "To";
    sheet.getCell("W3").value = "Arrival";

    sheet.getCell("X3").value = "Booking Type";
    sheet.getCell("Y3").value = "Airline Code";
    sheet.getCell("Z3").value = "Flight No.";
    sheet.getCell("AA3").value = "PNR";
    sheet.getCell("AB3").value = "From";
    sheet.getCell("AC3").value = "Departure";
    sheet.getCell("AD3").value = "To";
    sheet.getCell("AE3").value = "Arrival";

    sheet.getCell("AF3").value = "Booking Type";
    sheet.getCell("AG3").value = "Airline Code";
    sheet.getCell("AH3").value = "Flight No.";
    sheet.getCell("AI3").value = "PNR";
    sheet.getCell("AJ3").value = "From";
    sheet.getCell("AK3").value = "Departure";
    sheet.getCell("AL3").value = "To";
    sheet.getCell("AM3").value = "Arrival";

    [
      "P3",
      "Q3",
      "R3",
      "S3",
      "T3",
      "U3",
      "V3",
      "W3",
      "X3",
      "Y3",
      "Z3",
      "AA3",
      "AB3",
      "AC3",
      "AD3",
      "AE3",
      "AF3",
      "AG3",
      "AH3",
      "AI3",
      "AJ3",
      "AK3",
      "AL3",
      "AM3"
    ].map(key => {
      sheet.getCell(key).fill = fillColorHeading;
      sheet.getCell(key).font = cellFont;
      sheet.getCell(key).alignment = cellAlignmentCenter;
    });
  }
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
      `Guest-Flights-Master-Report.xlsx`
    );
  });
};
const getAirport = _id => {};
