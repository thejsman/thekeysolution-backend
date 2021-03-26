import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Events } from '../../../api/events/events.js'
import { Agencies } from '../../../api/agencies/agencies.js'
import { Guests } from '../../../api/guests/guests.js'
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import echarts from 'echarts';

import './admin_control_landing.html';
import './admin_control_landing.scss';
import { getAdminSummaryDetails } from '../../../api/adminusers/methods.js';
import { Roles } from 'meteor/meteor-roles';

let adminSummary = new ReactiveVar(null);

Template.admin_control_landing.onRendered(function() {
  this.autorun(() => {
    if(Roles.userIsInRole(Meteor.userId(), 'superadmin')) {
      this.subscribe('admin.agency.list');
      this.subscribe('guests.one', FlowRouter.getParam("id"));
      this.$('ul.tabs').tabs();
      getAdminSummaryDetails.call(null, (err, res) => {
	if(err) {

	}
	else {
	  adminSummary.set(res);
	}
      });
    }
    else {
      FlowRouter.go('admin.control.users');
    }
  });
});

Template.admin_control_landing.helpers({
  agenciesList(){
    agenciesC = Agencies.find();
    console.log(agenciesC)
    return agenciesC;
  },

  eventsList() {
    let summary = adminSummary.get();
    return summary ? summary.eventNames : [];
  }
});

Template.admin_chart_users.onRendered(function() {
  this.initialized = false;
  let userChart = echarts.init(document.getElementById('user-chart'));
  this.autorun(() => {
    if(this.initialized) return;
    let summary = adminSummary.get();
    console.log(summary);
    if(!summary)  {
      return;
    }
    let { invited, agencies } = summary;

    let option = {
      tooltip: {
	trigger: 'item',
	formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      series: [
	{
	  color: ["#f05b4f", "#d70206"],
	  name:'App Users',
	  type:'pie',
	  radius: ['50%', '70%'],
	  avoidLabelOverlap: false,
	  label: {
	    normal: {
	      show: false,
	      position: 'center'
	    },
	    emphasis: {
	      show: true,
	      formatter: "{c}\n{b}",
	      textStyle: {
		fontSize: '10',
		fontWeight: 'bold'
	      }
	    }
	  },
	  labelLine: {
	    normal: {
	      show: false
	    }
	  },
	  data:[
	    {value:invited, name:'Inactive'},
	    {value:agencies, name:'Active'}
	  ]
	}
      ]
    };

    userChart.setOption(option);
    this.initialized = true;
  });

});

Template.admin_chart_guests.onRendered(function() {
  this.subscribe('admin.agency.list');
  var guestcount = Agencies.find().fetch();

  this.initialized = false;
  let userChart = echarts.init(document.getElementById('guest-chart'));
  this.autorun(() => {
    if(this.initialized) return;
    let summary = adminSummary.get();
    console.log(summary);
    if(!summary)  {
      return;
    }
    let { events, closedEvents } = summary;

    let option = {
      tooltip: {
	trigger: 'item',
	formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      series: [
	{
	  color: ["#f00c4f","#f4c63d"],
	  name:'App Users',
	  type:'pie',
	  radius: ['50%', '70%'],
	  avoidLabelOverlap: false,
	  label: {
	    normal: {
	      show: false,
	      position: 'center'
	    },
	    emphasis: {
	      show: true,
	      formatter: "{c}\n{b}",
	      textStyle: {
		fontSize: '10',
		fontWeight: 'bold'
	      }
	    }
	  },
	  labelLine: {
	    normal: {
	      show: false
	    }
	  },
	  data:[
	    {value:events - closedEvents, name:'Active'},
	    {value:closedEvents, name:'Closed'}
	  ]
	}
      ]
    };

    userChart.setOption(option);
    this.initialized = true;
  });

});

Template.admin_chart_hotels.onRendered(function() {
  var roomChartEl = document.getElementById("room-chart").getContext("2d");
  var roomChart = new Chart(roomChartEl).Doughnut(
	// Datas
  [
    {
      value: 100,
      color:"#d70206",
      highlight: "#d70206",
      label: "Occupied"
    },
    {
      value: 150,
      color: "#f05b4f",
      highlight: "#f05b4f",
      label: "Available"
    }
  ],
  // Options
  {
    segmentShowStroke : true,
    segmentStrokeColor : "#fff",
    segmentStrokeWidth : 2,
    percentageInnerCutout : 60,
    animationSteps : 80,
    animationEasing : "easeOutBounce",
    animateRotate : true,
    animateScale : false,
    responsive: false,
    maintainAspectRatio: false,
    showScale: true,
    animateScale: true

  });
});

Template.admin_chart_flights.onRendered(function() {
  var flightChartEl = document.getElementById("flight-chart").getContext("2d");
  var flightChart = new Chart(flightChartEl).Doughnut(
	// Datas
  [
    {
      value: 150,
      color:"#d70206",
      highlight: "#d70206",
      label: "Booked"
    },
    {
      value: 100,
      color: "#f05b4f",
      highlight: "#f05b4f",
      label: "Available"
    }
  ],
  // Options
  {
    segmentShowStroke : true,
    segmentStrokeColor : "#fff",
    segmentStrokeWidth : 2,
    percentageInnerCutout : 60,
    animationSteps : 80,
    animationEasing : "easeOutBounce",
    animateRotate : true,
    animateScale : false,
    responsive: false,
    maintainAspectRatio: false,
    showScale: true,
    animateScale: true

  });
});
