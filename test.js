var Input = require('./index.js');
var input = new Input({value: 'Joe Taylor'});
var Keysim = require('keysim');
var keyboard = Keysim.Keyboard.US_ENGLISH;

console.log(input.text());

input.input.addEventListener('keypress', function(event) {
  console.log('interception');
  event.preventDefault();
});

var altShiftLeft = new Keysim.Keystroke(
  Keysim.Keystroke.ALT | Keysim.Keystroke.SHIFT,
  37
);
keyboard.dispatchEventsForKeystroke(altShiftLeft, input.input);
// keyboard.dispatchEventsForAction('meta+a', input.input);

keyboard.dispatchEventsForInput('rocks!!', input.input);

console.log(input.text());
