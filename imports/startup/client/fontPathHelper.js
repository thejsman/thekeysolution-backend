import { Template } from 'meteor/templating';
import { PathToFont } from '../../api/app_general/fonts.js';
import { fontName } from '../../api/app_general/fonts.js';

Template.registerHelper('fontPath', (fontName) => {
  return PathToFont(fontName);
});

Template.registerHelper('fontActualName', (nm) => {
  let fnt = fontName[nm];
  return fnt ? fnt.name : "";
});

Template.registerHelper('fontActualWeight', (nm) => {
  let fnt = fontName[nm];
  return fnt ? fnt.fontWeight : 300;
});
