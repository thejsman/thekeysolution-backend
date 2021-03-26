import { Template } from 'meteor/templating';
import './events_hotel_udpate_room_remarks.html';
import { UpdateRoomRemarks } from '../../../../api/hotels/methods.js';

Template.event_update_hotel_room_remarks.events({
  'submit .update-room-remarks'(event, template) {
    event.preventDefault();
    console.log(template.data.room);
    var data = {
      bookingId: template.data.room._id,
      roomRemarks: template.$("#room_remarks").val(),
      hotelRoomId: template.data.room.hotelRoomInfo.hotelRoomId
    };
    UpdateRoomRemarks.call(data, (err, res) => {
      if(!err) {
	console.log("Updated Room Remarks");
	template.$(event.target)[0].reset();
      }
    });
  }
});
