
import './events_guest_list.html';


Template.guest_edit_modal.onRendered(function() {
  this.$('select').material_select();
});