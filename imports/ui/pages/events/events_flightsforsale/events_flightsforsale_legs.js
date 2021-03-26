// Time-stamp: 2018-02-12
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_flights_add_leg.js
// Original Author    : saurabh@ Abalone Technologies Pvt Limited
// Description        :
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import moment from 'moment';
import _ from 'lodash';
import './events_flightsforsale.scss';
import './events_flightsforsale_legs.html';


Template.events_flightsforsale_legs.helpers({

  layover(index) {
    if(index >= this.legs.length - 1) {
      return false;
    }
    return true;
  },

  layoverTime(leg, index) {
    let next = this.legs[index + 1];
    let arrivalTime = moment(leg.flightArrivalTime, "YYYY-MM-DD HH:mm a");
    let departureTime = moment(next.flightDepartureTime, "YYYY-MM-DD HH:mm a");
    let duration = moment.duration(departureTime.diff(arrivalTime));
    let hours = duration.humanize();
    return hours;
  }

});

Template.events_flightsforsale_legs.events({
  'click .delete-button'(event, template) {
    let legs = template.data.legsVar.get();
    _.remove(legs, leg => {
      return leg._id === event.target.id;
    });
    template.data.legsVar.set(legs);
  }
});
