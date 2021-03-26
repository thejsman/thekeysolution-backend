import './picker.html';
import './picker.scss';

import Picker from "vanilla-picker";
import SimpleSchema from 'simpl-schema';
import { ReactiveDict } from "meteor/reactive-dict";


Template.colorPicker.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    color: Template.currentData().color || '#fff'
  });

  this.autorun(() => {
    new SimpleSchema({
      pickerLabel: String,
      pickerId: String,
      color: String
    }).validate(Template.currentData());
  });
});

Template.colorPicker.helpers({
  color: () => {
    const color = Template.instance().state.get('color');
    return color;
  }
});

Template.colorPicker.onRendered(function() {
  this.pickerId = Template.currentData().pickerId;
  this.parent = $(`.picker-input-${this.pickerId}`)[0],
    this.popup = new Picker(this.parent);

  this.popup.onChange = (color) => {
    this.state.set('color', color.hex)
  };
});