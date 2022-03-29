import { HTTP } from "meteor/http";
import { Meteor } from "meteor/meteor";
import _ from "lodash";

function startsWith(str, word) {
  return str.toString().lastIndexOf(word.toString(), 0) === 0;
}

export const sendSMS = (numbers, msg, eventId) => {
  let { userName, password, sender } = Meteor.settings.smsSettings;
  let intl = Meteor.settings.intlSMS;
  let senderId = "THEKEY";
  msg = encodeURIComponent(msg);
  if (eventId === "ujGC8KQfRNztz5msX") {
    senderId = "ITCLWS";
  }

  let indiannumbers = [],
    intlnumbers = [];
  numbers.map(a => {
    if (startsWith(a, "+91") || startsWith(a, "91")) {
      a = a.replace("+", "");
      indiannumbers.push(a);
    } else {
      if (startsWith(a, "+")) {
        a = a.replace("+", "");
      }
      intlnumbers.push(a);
    }
  });

  let indianList = _.chunk(indiannumbers, 25);
  let i = 0;

  indianList.map(a => {
    let numberString = a.join();
    if (numberString.length < 12) {
      console.log("Domestic mobile no Less than 10 - ", numberString.length);
    } else {
      let urlbase = `https://bulksms.analyticsmantra.com/sendsms/bulksms.php?username=BlueMT&password=blue123&type=UNICODE&sender=${senderId}&mobile=${numberString}&message=${msg}&PEID=1101687620000016536&HeaderId=1505163050518773137&templateId=1507163188418585641`;
      try {
        HTTP.call("GET", urlbase);
        i++;
      } catch (e) {
        console.log(e);
      }
      console.log("Domestic SMS Sent :: ", urlbase);
    }
  });

  let intlList = _.chunk(intlnumbers, 25);
  let j = 0;
  intlList.map(a => {
    let numberString = a.join();
    let urlbase = `https://api.msg91.com/api/sendhttp.php?mobiles=${numberString}&authkey=203075AXEdh7tX5aaa6c14&route=4&sender=${senderId}&message=${msg}&country=0&PEID=1101687620000016536&HeaderId=1505163050518773137&templateId=1507163188418585641`;
    console.log("International SMS Sent :: ", urlbase);
    try {
      HTTP.call("GET", urlbase);
      j++;
    } catch (e) {
      console.log(e);
    }
  });
  if (i === indianList.length && j === intlList.length) {
    return true;
  }
};
