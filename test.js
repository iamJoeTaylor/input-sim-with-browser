var Input = require('./index.js');
var Keysim = require('keysim');
var keyboard = Keysim.Keyboard.US_ENGLISH;
var chai = require('chai');
var expect = chai.expect;

describe('constructor', function() {
  it('creates an input with no value', function(done) {
    var input = new Input({}, function() {
      expect(input.text()).to.equal('');
      done();
    });
  });
  it('creates an input with a value', function(done) {
    var input = new Input({value: 'Totoro'}, function() {
      expect(input.text()).to.equal('Totoro');
      done();
    });
  });
});

describe('handles keyboard events, like', function() {
  var input;
  beforeEach(function(done) {
    input = new Input({value: 'No Face'}, done);
  });

  describe('left selections', function() {
    it('alt+shift+(leftArrow)', function() {
      keyboard.dispatchEventsForAction('alt+shift+left', input.input);
      expect(input.selectedRange()).to.eql({
        start: 3,
        length: 4
      });
    });
    it('meta+shift+(leftArrow)', function() {
      keyboard.dispatchEventsForAction('meta+shift+left', input.input);
      expect(input.selectedRange()).to.eql({
        start: 0,
        length: 7
      });
    });
    it('shift+left', function() {
      keyboard.dispatchEventsForAction('shift+left', input.input);
      expect(input.selectedRange()).to.eql({
        start: 6,
        length: 1
      });
    });
  });

  describe('right selections', function() {
    beforeEach(function() {
      input.setSelectedRange({
        start: 0,
        length: 0
      });
    });

    it('alt+shift+(rightArrow)', function() {
      keyboard.dispatchEventsForAction('alt+shift+right', input.input);
      expect(input.selectedRange()).to.eql({
        start: 0,
        length: 2
      });
    });
    it('meta+shift+(rightArrow)', function() {
      keyboard.dispatchEventsForAction('meta+shift+right', input.input);
      expect(input.selectedRange()).to.eql({
        start: 0,
        length: 7
      });
    });
    it('shift+right', function() {
      keyboard.dispatchEventsForAction('shift+right', input.input);
      expect(input.selectedRange()).to.eql({
        start: 0,
        length: 1
      });
    });
  });

  describe('generic', function() {
    it('meta+a', function() {
      keyboard.dispatchEventsForAction('meta+a', input.input);
      expect(input.selectedRange()).to.eql({
        start: 0,
        length: 7
      });
    });
  });

  describe('input', function() {
    it('inserts at end', function() {
      keyboard.dispatchEventsForInput(' rocks!', input.input);
      expect(input.text()).to.equal('No Face rocks!');
    });
    it('replaces selection', function() {
      keyboard.dispatchEventsForAction('alt+shift+left', input.input);
      keyboard.dispatchEventsForInput('one comes close to Miyazaki.', input.input);
      expect(input.text()).to.equal('No one comes close to Miyazaki.');
    });
    it('deletes one character via backspace', function() {
      keyboard.dispatchEventsForAction('backspace', input.input);
      expect(input.text()).to.equal('No Fac');
    });
  });
});

describe('will not handle events that are canceled with', function() {
  var input;
  beforeEach(function(done) {
    input = new Input({value: 'Spirited Away'}, done);
  });

  it('preventDefault', function() {
    input.input.addEventListener('keypress', function(event) {
      event.preventDefault();
    });
    keyboard.dispatchEventsForInput('\'s sad.', input.input);
    expect(input.text()).to.equal('Spirited Away');
  });

  it('stopPropagation', function() {
    input.input.addEventListener('keypress', function(event) {
      event.stopPropagation();
    });
    keyboard.dispatchEventsForInput('\'s sad.', input.input);
    expect(input.text()).to.equal('Spirited Away');
  });

  it('stopImmediatPropagation', function() {
    input.input.addEventListener('keypress', function(event) {
      event.stopImmediatPropagation();
    });
    keyboard.dispatchEventsForInput('\'s sad.', input.input);
    expect(input.text()).to.equal('Spirited Away');
  });
});
