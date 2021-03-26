import { Template } from 'meteor/templating';

import './apipage.html';


Template.api_template.onRendered(function(){

  console.log('hello welcome');

/*  Meteor.call('fetch.event', '52xdCdhrZuz4SZZrm', function(err, val){
    if(err){
      console.log('i m error  ', err);
    }else{
      console.log('i m meteor call val',val);
    }
  });  */



/*  var data = [{subeventId : 'pnBYeCYszmfPQSBz5',status: 'noo'},
              {subeventId : 'XWdjqfL6xAMkfzNEc',status: 'noo'},
              {subeventId : 'giHXduNoLkKhTveXQ',status: 'noo'},
              {subeventId : 'K3dt2bdsWb55vHfPm',status: 'yess'},
              {subeventId : 'in3ieXhhvKWLqTEM5',status: 'noo'}]

   Meteor.call('guest.rsvp.upsert', 'iPj6gEeA8n4BgpNXF', data ,function(err, val){
    if(err){
      console.log('i m error  ', err);
    }else{
      console.log('i m meteor call val',val);
    }
  });  */

//guestId, serviceId, serviceDate, serviceTime

  var data = [{guestId : 'iPj6gEeA8n4BgpNXF',serviceId: '3SfvEPhbTdxwBndq2', serviceDate: '29 March, 2018', serviceTime: '07:00pm'},//not done
              {guestId : '2ry7u6SLZgP4ETDBE',serviceId: '3SfvEPhbTdxwBndq2', serviceDate: '29 March, 2018', serviceTime: '07:00pm'},//done
              {guestId : 'iPj6gEeA8n4BgpNXF',serviceId: '3SfvEPhbTdxwBndq2', serviceDate: '29 March, 2018', serviceTime: '12:30am'},
              {guestId : 'iPj6gEeA8n4BgpNXF',serviceId: '3SfvEPhbTdxwBnda1', serviceDate: '29 March, 2018', serviceTime: '06:00pm'},
              {guestId : 'bkNLK4628qsad4tPL',serviceId: 'RYSp8GgJzwJca9bsp', serviceDate: '21 March, 2018', serviceTime: '02:40pm'},
              {guestId : 'myyuJBAjqfTJTij9B',serviceId: '3SfvEPhbTdxwBndq2', serviceDate: '29 March, 2018', serviceTime: '06:30pm'},]

   Meteor.call('book.services', data ,function(err, val){
    if(err){
      console.log('i m error  ', err);
    }else{
      console.log('i m meteor call val',val);
    }
  });



});