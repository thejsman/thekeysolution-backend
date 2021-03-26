import { Template } from 'meteor/templating';
import { Events } from '../../../../api/events/events.js';
import { Guests } from '../../../../api/guests/guests.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';

import Chart from 'chart.js';
import 'chartjs-plugin-datalabels';
import './events_summary.html';
import './events_summary.scss';
import eventSummary from './eventsExportSummary.js';
import { getGuestSummary, getRSVPSummary, getGuestSummary1 } from '../../../../api/guests/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import _ from 'lodash';

let userSummaryData = new ReactiveVar(null);
let rsvpSummary = new ReactiveVar(null);
let loading = new ReactiveVar(true);

let doughnutChartOptions = {
  legend: {
    display: false
  },
  cutoutPercentage: 80,
  tooltips: {
    callbacks: {
      title: function (tooltipItem, data) {
        return data['labels'][tooltipItem[0]['index']];
      },
      label: function (tooltipItem, data) {
        return data['datasets'][0]['data'][tooltipItem['index']];
      },
    },
    backgroundColor: '#ddd',
    titleFontSize: 12,
    titleFontColor: '#000',
    bodyFontColor: '#000',
    bodyFontSize: 12,
    displayColors: false,
  }
};

// Disable datalables by default
Chart.defaults.global.plugins.datalabels.display = false;

let barChartOptions = {
  stacked: true,
  legend: {
    display: false
  },
  tooltips: {
    backgroundColor: '#ddd',
    titleFontSize: 12,
    titleFontColor: '#000',
    bodyFontColor: '#000',
    bodyFontSize: 12,
    displayColors: false
  },
  scales: {
    xAxes: [{
      stacked: true,
      display: false,
      gridLines: { display: false }
    }],
    yAxes: [{
      stacked: true,
      barThickness: 15,
      gridLines: { display: false },
      ticks: {
        beginAtZero: true,
        fontSize: 10
      }
    }]
  }
};

// total datalabel plugin
const totalizer = {
  id: 'totalizer',
  beforeUpdate: chart => {
    let totals = {}
    let utmost = 0
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      if (chart.isDatasetVisible(datasetIndex)) {
        utmost = datasetIndex
        dataset.data.forEach((value, index) => {
          totals[index] = (totals[index] || 0) + value
        })
      }
    })
    chart.$totalizer = {
      totals: totals,
      utmost: utmost
    }
  }
}

let barChartHotel = {
  stacked: true,
  legend: {
    display: false
  },
  tooltips: {
    backgroundColor: '#ddd',
    titleFontSize: 12,
    titleFontColor: '#000',
    bodyFontColor: '#000',
    bodyFontSize: 12,
    displayColors: false,
    callbacks: {
      label: function (tooltipItem, data) {
        var corporation = data.datasets[tooltipItem.datasetIndex].label;
        var valor = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        var total = 0;
        for (var i = 0; i < data.datasets.length; i++)
          total += data.datasets[i].data[tooltipItem.index];
        if (tooltipItem.datasetIndex != data.datasets.length - 1) {
          return corporation + " :" + valor;
        } else {
          return [corporation + " :" + valor, "Total : " + total];
        }
      }
    }
  },
  layout: {
    padding: {
      left: 0,
      right: 30,
      top: 0,
      bottom: 0
    }
  },
  scales: {
    xAxes: [{
      stacked: true,
      display: false,
      gridLines: { display: false },
    }],
    yAxes: [{
      stacked: true,
      gridLines: { display: false },
      barThickness: 15,
      ticks: {
        beginAtZero: true
      }
    }]
  },
  plugins: {
    datalabels: {
      formatter: (value, ctx) => {
        const total = ctx.chart.$totalizer.totals[ctx.dataIndex]
        return total
      },
      align: 'end',
      anchor: 'end',
      display: function (ctx) {
        return ctx.datasetIndex === ctx.chart.$totalizer.utmost
      }
    }
  }
};
// Color options for graphs
var negativeColor = "#29244e";
var positiveColor = "#54b1aa";
var neutralColor = "#7e7e7e";

// Host Info
Template.events_host_info.helpers({
  hostInfo() {
    var event = Events.findOne();
    if (event) {
      return event.hostDetails;
    }
    return false;
  }
});

Template.events_summary.onRendered(function () {
  this.subscribe('events.one', FlowRouter.getParam("id"));

  getRSVPSummary.call(FlowRouter.getParam("id"), (err, res) => {
    if (err) {
      console.log('getRSVPSummary Error', err)
    }
    else {
      loading.set(false)
      rsvpSummary.set(res)
    }
  });

  // getGuestSummary1.call(FlowRouter.getParam("id"), (err, res) => {
  //   if (err) {
  //     console.log('Guest Summary err', err)
  //   }
  //   else {
  //     loading.set(false)
  //   }
  // });

  getGuestSummary.call(FlowRouter.getParam("id"), (err, res) => {
    if (err) {
      console.log('getGuestSummary Error :: ', err)
      showError("Unable to retrieve event summary");
    }
    else {
      userSummaryData.set(res);
    }
  });
});

Template.events_summary.helpers({
  loading() {
    return loading.get()
  },
  guestRoute() {
    return FlowRouter.path('events.guest', { id: FlowRouter.getParam("id") });
  },

  subeventRoute() {
    return FlowRouter.path('events.subevents', { id: FlowRouter.getParam("id") });
  },

  eventInfo() {
    let event = Events.findOne();
    if (event) {
      return event.basicDetails;
    }
    return false
  },

  rsvpChart() {
    let event = Events.findOne();
    let sortingType = event && event.basicDetails.eventSubeventSorting;
    return sortingType;
  },

  hasHotels() {
    let event = Events.findOne();
    if (event && event.featureDetails && event.featureDetails.selectedFeatures) {
      if (event.featureDetails.selectedFeatures.indexOf("Hotel Booking") > -1) {
        let res = userSummaryData.get();
        if (!res) {
          return;
        }
        let { hotelInfo } = res;
        if (hotelInfo.length > 0) {
          return true;
        }
      }
    }
    return false;
  },
  hasFoodPreference() {
    let res = userSummaryData.get();
    try {
      let { foodPreferences } = res;
      if (foodPreferences !== null || foodPreferences !== undefined) {
        if (foodPreferences.length > 0) {
          return true;
        }
      }
    } catch (err) {
      console.log("TRY-CATCH-Food: ", err);
    }

    return false;
  },
  hasSizePreferece() {
    let res = userSummaryData.get();
    try {
      let { sizePreferences } = res;
      if (sizePreferences !== null || sizePreferences !== undefined) {
        if (sizePreferences.length > 0) {
          return true;
        }
      }
    } catch (err) {
      console.log("TRY-CATCH-Size: ", err);
    }
    return false;
  },
  hasSpecailAssistance() {
    let res = userSummaryData.get();
    try {
      let { specialPreferences } = res;
      if (specialPreferences !== null || typeof specialPreferences !== undefined) {
        if (specialPreferences.length > 0) {
          return true;
        }
      }
    } catch (err) {
      console.log("TRY-CATCH-Assistance: ", err)
    }
    return false;
  },
  showPreferences() {
    let res = userSummaryData.get();
    try {
      let { foodPreferences, specialPreferences, sizePreferences } = res;

      return (specialPreferences.length > 0 || foodPreferences.length > 0 || sizePreferences.length > 0)
    }
    catch (err) {
      return false;
    }
  },
  hasService() {
    let res = userSummaryData.get();
   try {
    let { serviceInfo } = res;
    if(serviceInfo !== null || serviceInfo !== undefined) {
      if(serviceInfo.length > 0) {
        return true;
      } 
    }   
     } catch(err) {
       console.log("Service info error", err);
     }
   return false;
  },
  hasPaidHotels() {
    let event = Events.findOne();
    if (event && event.featureDetails && event.featureDetails.selectedFeatures) {
      if (event.featureDetails.selectedFeatures.indexOf("Hotel Booking Paid") > -1) {
        return true;
      }
    }
    return false;
  },

  hasFlights() {
    let event = Events.findOne();
    if (event && event.featureDetails && event.featureDetails.selectedFeatures) {
      if (event.featureDetails.selectedFeatures.indexOf("Flight Booking") > -1) {
        let res = userSummaryData.get();
        if (!res) {
          return;
        }
        let { flightInfo } = res;
        if (flightInfo.length > 0) {
          return true;
        }
      }
    }
    return false;
  },

  hasPaidFlights() {
    let event = Events.findOne();
    if (event && event.featureDetails && event.featureDetails.selectedFeatures) {
      if (event.featureDetails.selectedFeatures.indexOf("Flight Booking Paid") > -1) {
        return true;
      }
    }
    return false;
  },

  hostInfo() {
    var event = Events.findOne();
    if (event) {
      return event.hostDetails;
    }
    return false;
  },
  guestInfo() {
    var guest = Guests.findOne();
    if (guest) {
      return guest;
    }
    return false;
  }
});

Template.event_summary.helpers({
  featuresInfo() {
    {
      var event = Events.findOne();
      if (event) {
        return event.featureDetails;
      }
      return false;
    }

  },

  editEventPath() {
    return FlowRouter.path('events.add', {}, {
      eventId: FlowRouter.getParam('id')
    });
  }
});

Template.event_summary.events({
  'click #exportSummary': function () {
    eventSummary(Events.findOne(), userSummaryData.get());
  }
});

// App User Chart
Template.events_chart_users.helpers({
  totalUsers() {
    let summary = userSummaryData.get();
    return summary ? summary.total : 0;
  }
});

// TODO : Make data dynamic
Template.events_chart_users.onRendered(function () {
  this.autorun(() => {
    let userChart = document.getElementById('user-chart').getContext("2d");
    if (this.initialized) return;
    let res = userSummaryData.get();
    if (!res) {
      return;
    }
    let { total, registered } = res;
    let others = total - registered;
    others = others >= 0 ? others : 0;
    let data = {
      datasets: [{
        data: [registered, others],
        backgroundColor: [positiveColor, negativeColor]
      }],
      labels: [
        'Logged-in',
        'Pending'
      ]
    };
    var myDoughnutChart = new Chart(userChart, {
      type: 'doughnut',
      data: data,
      options: doughnutChartOptions
    });
  });
});

// Guest type Chart
Template.events_chart_guests.helpers({
  totalGuests() {
    let summary = userSummaryData.get();
    return summary ? summary.totalGuests : 0;
  }
});

// TODO : Make data dynamic
Template.events_chart_guests.onRendered(function () {
  this.autorun(() => {
    let guestChart = document.getElementById('guest-chart').getContext("2d");
    let res = userSummaryData.get();
    if (!res) {
      return;
    }
    let { primaryGuests, totalGuests } = res;

    let others = totalGuests - primaryGuests;
    others = others >= 0 ? others : 0;
    let data = {
      datasets: [{
        // data: [primaryGuests, totalGuests - primaryGuests],
        data: [primaryGuests, others],
        backgroundColor: [positiveColor, negativeColor]
      }],
      labels: [
        'Primary',
        'Secondary',
      ]
    };
    var myDoughnutChartGuest = new Chart(guestChart, {
      type: 'doughnut',
      data: data,
      options: doughnutChartOptions
    });
  });
});


// TODO : Make data dynamic
Template.events_chart_gender.onRendered(function () {
  this.autorun(() => {
    let userChart = document.getElementById('guest-chart-gender').getContext("2d");
    if (this.initialized) return;
    let res = userSummaryData.get();
    if (!res) {
      return;
    }
    let { male, female, child } = res;
    let data = {
      datasets: [{
        data: [male, female, child],
        backgroundColor: [negativeColor, positiveColor, neutralColor]
      }],
      labels: [
        'Male',
        'Female',
        'Child'
      ]
    };
    var myDoughnutChart = new Chart(userChart, {
      type: 'doughnut',
      data: data,
      options: doughnutChartOptions
    });
  });
});

// Total RSVP Chart
Template.events_chart_rsvp.helpers({
  totalGuests() {
    let summary = userSummaryData.get();
    return summary ? summary.totalGuests : 0;
  }
});

Template.events_chart_rsvp.onRendered(function () {
  this.autorun(() => {
    let rsvpChart = document.getElementById('rsvp-chart').getContext("2d");
    let res = userSummaryData.get();
    if (!res) {
      return;
    }
    let { rsvpsYes, rsvpsNo, totalGuests } = res;
    let others = totalGuests - rsvpsYes - rsvpsNo;
    others = others >= 0 ? others : 0;
    let data = {
      datasets: [{
        // data: [primaryGuests, totalGuests - primaryGuests],
        data: [rsvpsYes, rsvpsNo, others],
        backgroundColor: [positiveColor, negativeColor, neutralColor]
      }],
      labels: [
        'Attending',
        'Regret',
        'Maybe'
      ]
    };
    var myDoughnutChartGuest = new Chart(rsvpChart, {
      type: 'doughnut',
      data: data,
      options: doughnutChartOptions
    });
  });
});

// RSVP by date
Template.events_chart_rsvp_date.onRendered(function () {

  this.autorun(function () {
    let res = rsvpSummary.get();
    if (!res) {
      return;
    }

    let rsvpsYes = res.map(r => r.rsvpYes);
    let rsvpsNo = res.map(r => r.rsvpNo);
    let rsvpsMaybe = res.map(r => r.rsvpNotResponded);

    let dates = res.map(r => r.date);
    let dateList = new Array(Math.ceil(dates.length / 4)).fill().map(_ => dates.splice(0, 4));

    const rsvpYesData = new Array(Math.ceil(rsvpsYes.length / 4)).fill().map(_ => rsvpsYes.splice(0, 4));
    const rsvpNoData = new Array(Math.ceil(rsvpsNo.length / 4)).fill().map(_ => rsvpsNo.splice(0, 4));
    const rsvpMaybeData = new Array(Math.ceil(rsvpsMaybe.length / 4)).fill().map(_ => rsvpsMaybe.splice(0, 4));

    const rsvpChart = document.getElementById('rsvp-chart-date-stacked').getContext("2d");
    var rsvpChartDate;
    function drawDateGraph(i) {
      if (rsvpChartDate) {
        rsvpChartDate.destroy();
      }
      var renderChartData = dateList[i];
      let data = {
        labels: renderChartData,
        datasets: [{
          label: 'Attending',
          data: rsvpYesData[i],
          backgroundColor: positiveColor
        },
        {
          label: 'Regret',
          data: rsvpNoData[i],
          backgroundColor: negativeColor
        },
        {
          label: 'Not Responded',
          data: rsvpMaybeData[i],
          backgroundColor: neutralColor
        },
        ]
      };
      rsvpChartDate = new Chart(rsvpChart, {
        type: 'horizontalBar',
        data: data,
        options: barChartOptions
      });
    }
    var i = 0;
    drawDateGraph(i);
    self.$('.rsvpDateGraph.up').bind('click', function (e) {
      e.preventDefault();
      if ((i + 1) < dateList.length) {
        self.$('.rsvpDateGraph.down').removeClass('inactive');
        i++;
        drawDateGraph(i);
      } else {
        self.$('.rsvpDateGraph.up').addClass('inactive');
      }
    });
    self.$('.down').bind('click', function (e) {
      e.preventDefault();
      if (i > 0) {
        self.$('.rsvpDateGraph.up').removeClass('inactive');
        i--;
        drawDateGraph(i);
      } else {
        self.$('.rsvpDateGraph.down').addClass('inactive');
      }
    });
  });
});

// Template.events_chart_rsvp_date.events({
//   'click .up' : function(){
//     // console.log("RSVP by Date Up");
//   },
//   'click .down' : function(){
//     // console.log("RSVP by Date Down");
//   }
// });
// RSVP by sub-events
Template.events_chart_rsvp_se.onRendered(function () {
  let self = this;
  this.autorun(function () {
    let res = rsvpSummary.get();
    if (!res) {
      return;
    }

    let rsvpsYes = res.map(r => r.rsvpYes);
    let rsvpsNo = res.map(r => r.rsvpNo);
    let rsvpsMaybe = res.map(r => r.rsvpNotResponded);
    let events = res.map(r => {
      return r.subEventTitle.replace(/.{10}\S*\s+/g, "$&@").split(/\s+@/);
    });

    let eventList = new Array(Math.ceil(events.length / 4)).fill().map(_ => events.splice(0, 4));
    const rsvpYesData = new Array(Math.ceil(rsvpsYes.length / 4)).fill().map(_ => rsvpsYes.splice(0, 4));
    const rsvpNoData = new Array(Math.ceil(rsvpsNo.length / 4)).fill().map(_ => rsvpsNo.splice(0, 4));
    const rsvpMaybeData = new Array(Math.ceil(rsvpsMaybe.length / 4)).fill().map(_ => rsvpsMaybe.splice(0, 4));

    if (1 > eventList.length) {
      self.$('.rsvpEvent.up').addClass('inactive');
      self.$('.rsvpEvent.down').addClass('inactive');
    }
    const rsvpChart = document.getElementById('rsvp-chart-event-stacked').getContext("2d");
    var rsvpChartEvent;
    function drawEventGraph(i) {
      if (rsvpChartEvent) {
        rsvpChartEvent.destroy();
      }
      let renderChartData = eventList[i];
      let data = {
        labels: renderChartData,
        datasets: [{
          label: 'Attending',
          data: rsvpYesData[i],
          backgroundColor: positiveColor
        },
        {
          label: 'Regret',
          data: rsvpNoData[i],
          backgroundColor: negativeColor
        },
        {
          label: 'Not Responded',
          data: rsvpMaybeData[i],
          backgroundColor: neutralColor
        },
        ]
      };

      
      rsvpChartEvent = new Chart(rsvpChart, {
        type: 'horizontalBar',
        data: data,
        options: barChartOptions
      });
    }
    var i = 0;
    drawEventGraph(i);
    self.$('.rsvpEvent.up').click(function (e) {
      e.preventDefault();
      if ((i + 1) < eventList.length) {
        self.$('.rsvpEvent.down').removeClass('inactive');
        i++;
        drawEventGraph(i);
      } else {
        self.$('.rsvpEvent.up').addClass('inactive');
      }
    });
    self.$('.rsvpEvent.down').click(function (e) {
      e.preventDefault();
      if (i > 0) {
        self.$('.rsvpEvent.up').removeClass('inactive');
        i--;
        drawEventGraph(i);
      } else {
        self.$('.rsvpEvent.down').addClass('inactive');
      }
    });
  });
});

// RSVP by destination
// Bar Graph
Template.events_chart_rsvp_location.onRendered(function () {
  this.autorun(() => {
    let res = rsvpSummary.get();
    if (!res) {
      return;
    }
    var rsvpsYes = res.map(r => r.rsvpYes);
    var rsvpsNo = res.map(r => r.rsvpNo);
    var rsvpsMaybe = res.map(r => r.rsvpNotResponded);
    var location = res.map(r => r.destination);
    let locationList = new Array(Math.ceil(location.length / 4)).fill().map(_ => location.splice(0, 4));

    const rsvpYesData = new Array(Math.ceil(rsvpsYes.length / 4)).fill().map(_ => rsvpsYes.splice(0, 4));
    const rsvpNoData = new Array(Math.ceil(rsvpsNo.length / 4)).fill().map(_ => rsvpsNo.splice(0, 4));
    const rsvpMaybeData = new Array(Math.ceil(rsvpsMaybe.length / 4)).fill().map(_ => rsvpsMaybe.splice(0, 4));

    const rsvpChart = document.getElementById('rsvp-chart-location-stacked').getContext("2d");
    var rsvpChartLocation;
    function drawLocationGraph(i) {
      if (rsvpChartLocation) {
        rsvpChartLocation.destroy();
      }
      var renderChartData = locationList[i];
      let data = {
        labels: renderChartData,
        datasets: [{
          label: 'Attending',
          data: rsvpYesData[i],
          backgroundColor: positiveColor
        },
        {
          label: 'Regret',
          data: rsvpNoData[i],
          backgroundColor: negativeColor
        },
        {
          label: 'Not Responded',
          data: rsvpMaybeData[i],
          backgroundColor: neutralColor
        },
        ]
      };
      rsvpChartLocation = new Chart(rsvpChart, {
        type: 'horizontalBar',
        data: data,
        options: barChartOptions
      });
    }
    var i = 0;
    drawLocationGraph(i);
    self.$('.rsvpLocation.up').click(function (e) {
      e.preventDefault();
      // self.$('.down').removeClass('inactive');
      if ((i + 1) < locationList.length) {
        self.$('.rsvpLocation.down').removeClass('inactive');
        i++;
        drawLocationGraph(i);
      } else {
        self.$('.rsvpLocation.up').addClass('inactive');
      }
    });
    self.$('.rsvpLocation.down').click(function (e) {
      e.preventDefault();
      if (i > 0) {
        self.$('.rsvpLocation.down').removeClass('inactive');
        i--;
        drawLocationGraph(i);
      } else {
        self.$('.rsvpLocation.down').addClass('inactive');
      }
    });
  });
});

let featureName = {
  'Hotel Booking': 'Hotel Inventory & Booking',
  'Flight Booking': 'Flight Inventory & Booking',
  'Services': 'Guest Services & Appointments',
  'Passenger Information': 'Guest Information',
  'Transport': 'Guest Logistics',
  'Gifts': 'Giveaways & Gifts',
  'Meal': 'Food Preferences',
  'Size': 'Merchandize Size',
  'Room': 'Room Preferences'
};

Template.event_features.helpers({
  featureDisplayName(feature) {
    let d = featureName[feature];
    return d ? d : feature;
  }
});

Template.events_chart_hotels.helpers({
  totalRooms() {
    // let summary = userSummaryData.get();
    // return summary ? summary.totalRooms : 0;
    return 0;
  }
});

Template.events_chart_hotels.onRendered(function () {
  this.autorun(() => {
    let res = userSummaryData.get();
    if (!res) {
      return;
    }
    let { hotelInfo } = res;
    var totalRooms = hotelInfo.map(h => h.totalRooms);
    var reservedRooms = hotelInfo.map(h => h.occupiedRooms);
    var availableRooms = totalRooms.map((t, index) => {
      let av = t - reservedRooms[index];
      return av >= 0 ? av : 0;
    });
    // var hotel = hotelInfo.map(h => h.hotelName);
    let hotel = hotelInfo.map(h => {
      // return h.hotelName.match(/.{1,10}/g);
      return h.hotelName.replace(/.{10}\S*\s+/g, "$&@").split(/\s+@/);
    });

    let hotelList = new Array(Math.ceil(hotel.length / 4)).fill().map(_ => hotel.splice(0, 4));
    let hotelChart = document.getElementById('hotel-chart').getContext("2d");
    // console.log("Hotel List :"+hotelList.length);
    // if(hotelList.length < 2){
    //   console.log(self.$('.chart-label'));
    //   // hotelChart.hide();
    //   console.log("HELLO");
    //   self.$('.chart-label').addClass('hide');
    // }

    var hotelChartRender;
    function drawFreeHotelGraph(i) {
      if (hotelChartRender) {
        hotelChartRender.destroy();
      }

      var renderChartData = hotelList[i];
      let data = {
        labels: renderChartData,
        datasets: [{
          label: 'Assigned Rooms',
          data: reservedRooms,
          backgroundColor: positiveColor
        },
        {
          label: 'Available Rooms',
          data: availableRooms,
          backgroundColor: negativeColor
        },
        ]
      };
      hotelChartRender = new Chart(hotelChart, {
        type: 'horizontalBar',
        data: data,
        options: barChartHotel,
        plugins: [totalizer]
      });
    }

    var i = 0;
    drawFreeHotelGraph(i);
    self.$('.freeHotelChart.up').bind('click', function (e) {
      e.preventDefault();
      if ((i + 1) < hotelList.length) {
        self.$('.freeHotelChart.down').removeClass('inactive');
        i++;
        drawFreeHotelGraph(i);
      } else {
        self.$('.freeHotelChart.up').addClass('inactive');
      }
    });
    self.$('.freeHotelChart.down').bind('click', function (e) {
      e.preventDefault();
      if (i > 0) {
        self.$('.freeHotelChart.up').removeClass('inactive');
        i--;
        drawFreeHotelGraph(i);
      } else {
        self.$('.freeHotelChart.down').addClass('inactive');
      }
    });

  });
});

Template.events_chart_hotels_paid.onRendered(function () {
  this.autorun(() => {
    let res = userSummaryData.get();
    if (!res) return;
    let { hotelForSaleInfo } = res;

    let totalPaidRooms = hotelForSaleInfo.map(h => h.totalRooms);
    let reservedPaidRooms = hotelForSaleInfo.map(h => h.occupiedRooms);
    let availablePaidRooms = totalPaidRooms.map((t, index) => {
      let av = t - reservedPaidRooms[index];
      return av >= 0 ? av : 0;
    });
    let hotelPaid = hotelForSaleInfo.map(h => {
      // return h.hotelName.match(/.{1,10}/g);
      return h.hotelName.replace(/.{10}\S*\s+/g, "$&@").split(/\s+@/);
    });
    let hotelPaidList = new Array(Math.ceil(hotelPaid.length / 4)).fill().map(_ => hotelPaid.splice(0, 4));

    let hotelPaidChart = document.getElementById('hotel-chart-paid').getContext("2d");

    var hotelChartRender;
    function drawPaidHotelGraph(i) {
      if (hotelChartRender) {
        hotelChartRender.destroy();
      }

      var renderChartData = hotelPaidList[i];
      let data = {
        labels: renderChartData,
        datasets: [
          {
            label: 'Sold Rooms',
            data: reservedPaidRooms,
            backgroundColor: positiveColor
          },
          {
            label: 'Available Rooms',
            data: availablePaidRooms,
            backgroundColor: negativeColor
          },
        ]
      };
      hotelChartRender = new Chart(hotelPaidChart, {
        type: 'horizontalBar',
        data: data,
        options: barChartHotel,
        plugins: [totalizer]
      });
    }

    var i = 0;
    drawPaidHotelGraph(i);
    self.$('.paidHotelChart.up').bind('click', function (e) {
      e.preventDefault();
      if ((i + 1) < hotelPaidList.length) {
        self.$('.paidHotelChart.down').removeClass('inactive');
        i++;
        drawPaidHotelGraph(i);
      } else {
        self.$('.paidHotelChart.up').addClass('inactive');
      }
    });
    self.$('.paidHotelChart.down').bind('click', function (e) {
      e.preventDefault();
      if (i > 0) {
        self.$('.paidHotelChart.up').removeClass('inactive');
        i--;
        drawPaidHotelGraph(i);
      } else {
        self.$('.paidHotelChart.down').addClass('inactive');
      }
    });

  });
});

Template.events_chart_flights.helpers({
  totalFlights() {
    // let summary = userSummaryData.get();
    // return summary ? summary.flightTotalSeats : 0;
    return 0;
  }
});

// TODO : Make data dynamic
Template.events_chart_flights.onRendered(function () {
  this.autorun(() => {
    let res = userSummaryData.get();
    if (!res) return;

    let { flightInfo } = res;
    // Allocation
    let totalSeats = flightInfo.map(f => f.totalSeats);
    let reservedSeats = flightInfo.map(f => f.bookedSeats);
    let availableSeats = totalSeats.map((t, index) => {
      let av = t - reservedSeats[index];
      return av >= 0 ? av : 0;
    });

    // console.log("Free flight reserved seat : "+availableSeats);

    let flight = flightInfo.map(f => f.name);

    let flightList = new Array(Math.ceil(flight.length / 4)).fill().map(_ => flight.splice(0, 4));

    let flightChart = document.getElementById('flight-chart').getContext("2d");

    var flightChartRender;
    function drawFreeFlightGraph(i) {
      if (flightChartRender) {
        flightChartRender.destroy();
      }

      var renderChartData = flightList[i];
      let data = {
        labels: renderChartData,
        datasets: [{
          label: 'Assigned Seats',
          data: reservedSeats,
          backgroundColor: positiveColor
        },
        {
          label: 'Available Seats',
          data: availableSeats,
          backgroundColor: negativeColor
        },
        ]
      };
      flightChartRender = new Chart(flightChart, {
        type: 'horizontalBar',
        data: data,
        options: barChartHotel,
        plugins: [totalizer]
      });
    }

    var i = 0;
    drawFreeFlightGraph(i);
    self.$('.freeFlightChart.up').bind('click', function (e) {
      e.preventDefault();
      if ((i + 1) < flightList.length) {
        self.$('.freeFlightChart.down').removeClass('inactive');
        i++;
        drawFreeFlightGraph(i);
      } else {
        self.$('.freeFlightChart.up').addClass('inactive');
      }
    });
    self.$('.freeFlightChart.down').bind('click', function (e) {
      e.preventDefault();
      if (i > 0) {
        self.$('.freeFlightChart.up').removeClass('inactive');
        i--;
        drawFreeFlightGraph(i);
      } else {
        self.$('.freeFlightChart.down').addClass('inactive');
      }
    });
  });
});

Template.events_chart_flights_paid.onRendered(function () {
  this.autorun(() => {
    let res = userSummaryData.get();
    if (!res) return;
    let { flightForSaleInfo } = res;
    let flightInfo = flightForSaleInfo;
    // Paid
    let totalPaidSeats = flightInfo.map(f => f.totalSeats);
    let reservedPaidSeats = flightInfo.map(f => f.bookedSeats);
    let availablePaidSeats = totalPaidSeats.map((t, index) => {
      let av = t - reservedPaidSeats[index];
      return av >= 0 ? av : 0;
    });

    // console.log("Reserve Paid Seats : "+availablePaidSeats);

    let flightPaid = flightInfo.map(f => f.name);

    let flightPaidList = new Array(Math.ceil(flightPaid.length / 4)).fill().map(_ => flightPaid.splice(0, 4));


    let flightPaidChart = document.getElementById('flight-chart-paid').getContext("2d");

    var flightChartRender;
    function drawPaidFlightGraph(i) {
      if (flightChartRender) {
        flightChartRender.destroy();
      }

      var renderChartData = flightPaidList[i];
      let data = {
        labels: renderChartData,
        datasets: [{
          label: 'Sold Seats',
          data: reservedPaidSeats,
          backgroundColor: positiveColor
        },
        {
          label: 'Available Seats',
          data: availablePaidSeats,
          backgroundColor: negativeColor
        },
        ]
      };
      flightChartRender = new Chart(flightPaidChart, {
        type: 'horizontalBar',
        data: data,
        options: barChartHotel,
        plugins: [totalizer]
      });
    }

    var i = 0;
    drawPaidFlightGraph(i);
    self.$('.paidFlightChart.up').bind('click', function (e) {
      e.preventDefault();
      if ((i + 1) < flightPaidList.length) {
        self.$('.paidFlightChart.down').removeClass('inactive');
        i++;
        drawPaidFlightGraph(i);
      } else {
        self.$('.paidFlightChart.up').addClass('inactive');
      }
    });
    self.$('.paidFlightChart.down').bind('click', function (e) {
      e.preventDefault();
      if (i > 0) {
        self.$('.paidFlightChart.up').removeClass('inactive');
        i--;
        drawPaidFlightGraph(i);
      } else {
        self.$('.paidFlightChart.down').addClass('inactive');
      }
    });

  });
});

Template.food_chart.helpers({
  preferences() {
    let res = userSummaryData.get();
    if (!res) return [];
    let { foodPreferences } = res;
    let colors = ['negative', 'positive', 'neutral']
    return foodPreferences.map((f, index) => {
      return {
        preference: f.preference,
        color: colors[index]
      }
    });
  }
});

Template.food_chart.onRendered(function () {
  this.autorun(() => {
    let res = userSummaryData.get();
    if (!res) return;
    let { foodPreferences } = res;

    let foodChart = document.getElementById('food-chart').getContext("2d");
    let data = {
      datasets: [{
        data: foodPreferences.map(f => f.count),
        backgroundColor: [negativeColor, positiveColor, neutralColor]
      }],
      labels: foodPreferences.map(f => f.preference)
    };
    var myDoughnutChartGuest = new Chart(foodChart, {
      type: 'doughnut',
      data: data,
      options: doughnutChartOptions
    });
  });
});

Template.size_chart.helpers({
  preferences() {
    let res = userSummaryData.get();
    if (!res) return [];
    let { sizePreferences } = res;
    let colors = ['negative', 'positive', 'neutral']
    return sizePreferences.map((f, index) => {
      return {
        preference: f.preference,
        color: colors[index]
      }
    });
  },

  sizeName() {
    let res = userSummaryData.get();
    if (!res) return [];
    let { sizePreferences } = res;
    return res.sizeName;
  }
});

Template.size_chart.onRendered(function () {
  this.autorun(() => {
    let res = userSummaryData.get();
    if (!res) return;
    let { sizePreferences } = res;
    let foodChart = document.getElementById('size-chart').getContext("2d");
    let data = {
      datasets: [{
        data: sizePreferences.map(s => s.count),
        backgroundColor: [negativeColor, positiveColor, neutralColor]
      }],
      labels: sizePreferences.map(s => s.preference)
    };
    var myDoughnutChartGuest = new Chart(foodChart, {
      type: 'doughnut',
      data: data,
      options: doughnutChartOptions
    });
  });
});

Template.special_assistance_chart.helpers({
  preferences() {
    let res = userSummaryData.get();
    if (!res) return [];
    let { specialPreferences } = res;
    let colors = ['negative', 'positive', 'neutral']
    return specialPreferences.map((f, index) => {
      return {
        preference: f.preference,
        color: colors[index]
      }
    });
  }
});

Template.special_assistance_chart.onRendered(function () {
  this.autorun(() => {
    let res = userSummaryData.get();
    if (!res) return;
    let { specialPreferences } = res;
    let assistanceChart = document.getElementById('assistance-chart').getContext("2d");
    let data = {
      datasets: [{
        data: specialPreferences.map(p => p.count),
        backgroundColor: [negativeColor, positiveColor, neutralColor]
      }],
      labels: specialPreferences.map(p => p.preference)
    };
    var myDoughnutChartGuest = new Chart(assistanceChart, {
      type: 'doughnut',
      data: data,
      options: doughnutChartOptions
    });
  });
});

Template.events_chart_services.helpers({
  serviceList() {
    let res = userSummaryData.get();
    if (!res) return [];
    let { serviceInfo } = res;
    // console.log("service info - ", serviceInfo);
    let serviceList = [];
    serviceInfo.forEach(service => {
      _.each(service.slotsInfo, (value, key) => {
        serviceList.push({
          serviceId : service.serviceId,
          serviceName: service.serviceName + ' - ' + key,
          slotsInfo: value
        });
      });
    });
    return serviceList;
  }
});

Template.events_chart_services_single.helpers({
  serviceName() {
    return this.service.serviceName;
  },
  serviceId() {
    return this.service.serviceId;
  }
});

// Services
Template.events_chart_services_single.onRendered(function () {
  let service = this.data.service;
  let { slotsInfo } = service;
  // chart data
  let slotsAvailable = _.map(slotsInfo, slot => slot.slotAvailable);
  var slotsBooked = _.map(slotsInfo, (slot, key, index) => {
    let av = slot.slotTotal - slot.slotAvailable;
    return av >= 0 ? av : 0;
  });
  var slots = _.map(slotsInfo, s => s.serviceTime);
  let slotList = new Array(Math.ceil(slots.length / 4)).fill().map(_ => slots.splice(0, 4));

  let serviceCanvas = this.$(`.service_chart-${service.serviceId}`)[0];
  if (!serviceCanvas) return;
  let serviceChart = serviceCanvas.getContext('2d');


  var flightChartRender;
  function drawServiceGraph(i) {
    if (flightChartRender) {
      flightChartRender.destroy();
    }

    var renderChartData = slotList[i];
    let data = {
      labels: renderChartData,
      datasets: [{
        label: 'Available Slots',
        data: slotsAvailable,
        backgroundColor: negativeColor
      },
      {
        label: 'Booked Slots',
        data: slotsBooked,
        backgroundColor: positiveColor
      }
      ]
    };
    flightChartRender = new Chart(serviceChart, {
      type: 'horizontalBar',
      data: data,
      options: barChartHotel,
      plugins: [totalizer]
    });
  }

  var i = 0;
  drawServiceGraph(i);
  this.$(`.serviceChart.up.${service.serviceId}`).bind('click', function (e) {
    e.preventDefault();
    if ((i + 1) < slotList.length) {
      self.$(`.serviceChart.down.${service.serviceId}`).removeClass('inactive');
      i++;
      drawServiceGraph(i);
    } else {
      self.$(`.serviceChart.up.${service.serviceId}`).addClass('inactive');
    }
  });
  this.$(`.serviceChart.down.${service.serviceId}`).bind('click', function (e) {
    e.preventDefault();
    if (i > 0) {
      self.$(`.serviceChart.up.${service.serviceId}`).removeClass('inactive');
      i--;
      drawServiceGraph(i);
    } else {
      self.$(`.serviceChart.down.${service.serviceId}`).addClass('inactive');
    }
  });
});
