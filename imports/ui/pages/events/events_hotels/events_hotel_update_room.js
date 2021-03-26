import { Template } from 'meteor/templating';
import './events_hotel_update_room.html';
import { UpdateRoomNumber } from '../../../../api/hotels/methods.js';

Template.event_update_hotel_room_number.events({
  'submit .update-room-number'(event, template) {
    event.preventDefault();
    console.log(template.data);
    var data = {
      bookingId: template.data.room._id,
      roomNumber: template.$("#room_number").val(),
      hotelRoomId: template.data.room.hotelRoomInfo.hotelRoomId
    };
    
    UpdateRoomNumber.call(data, (err, res) => {
      if(!err) {
    	console.log("Updated Room Number");
    	template.$(event.target)[0].reset();
      }
      else {
	console.log(err);
      }
    });
  }
});
