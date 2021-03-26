import moment from "moment";
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import "./datetimepicker.html";
import "./datetimepicker.scss";

Template.datetimepicker.onRendered(function () {
  console.log("datetimepicker", this);
  var self = this;
  let timepicker;
  let datepicker;
  let container = this.$(".outlet");

  timepicker = this.$("#time")
    .pickatime({
      container: container,
      twelvehour: false,
      afterDone() {
        Meteor.setTimeout(function () {
          let timeval = timepicker.input.val();
          $datetime
            .off("focus")
            .val(datepicker.get() + " " + timeval)
            .focus()
            .on("focus", datepicker.open);
        }, 0);
      },
    })
    .data("clockpicker");

  datepicker = this.$("#date")
    .pickadate({
      selectYears: 15,
      selectMonths: true,
      container: container,
      closeOnSelect: false,
      format: "dd mmm yyyy",
      onSet(item) {
        if ("select" in item) {
          Meteor.setTimeout(() => {
            timepicker.show();
          }, 0);
        }
      },
    })
    .pickadate("picker");

  var $datetime = this.$(".datetime")
    .on("focus", datepicker.open)
    .on("click", function (event) {
      event.stopPropagation();
      datepicker.open();
    });
  // on('click .picker__clear picker__clear', function (event) {
  //   event.stopPropagation();
  //   this.value=""
  // });

  this.autorun(() => {
    if (self.data.defaultDate) {
      let defaultDate = self.data.defaultDate.get();
      let m = moment(defaultDate);
      let date = m.isValid() ? m.toDate() : false;
      if (date) {
        datepicker.set("select", [
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ]);
      }
    }
  });
});

Template.datetimepicker.helpers({
  formatDate: function (date) {
    if (!date) {
      return moment(new Date()).format("dddd MMM DD YYYY, h:mm:ss a");
    } else {
      return moment(date).format("dddd MMM DD YYYY, h:mm:ss a");
    }
  },
});
