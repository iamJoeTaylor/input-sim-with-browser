var jsdom = require('jsdom').jsdom;
var InputSim = require('input-sim').Input;

class InputSimBrowser extends InputSim {
  constructor(_options) {
    var options = {
      value: '',
      class: '',
      id: '',
      type: 'text', // Only text (and similar) inputs supported
      extra: {} // key:value => attr:value
    };
    for(var key in _options) {
      if(_options.hasOwnProperty(key) && typeof options[key] !== 'undefined') {
        options[key] = _options[key];
      }
    };

    this.ops = options;

    this.makeInput();
    this.addBrowser();

    super(this.ops.value);
  }

  setText(value) {
    this.input.value = value;
    super(value);
  }

  makeInput() {
    var attrString = '';
    var extraString = '';
    for(var key in this.ops.extra) {
      if(this.ops.extra.hasOwnProperty(key)) {
        extraString += ` ${key}="${this.ops.extra[key]}"`;
      }
    };
    for(var key in this.ops) {
      if(this.ops.hasOwnProperty(key) && this.ops[key] !== '' && key !== 'extra') {
        attrString += ` ${key}="${this.ops[key]}"`;
      } else if(key === 'extra') {
        attrString += extraString;
      }
    };

    this.input = jsdom(`<input ${attrString} />`).getElementsByTagName('input')[0];
  }

  addBrowser() {
    this.augemntAddListener();

    this.input.addEventListener('keypress', (event) => {
      console.log(event._preventDefault);
      if(!event._preventDefault) {
        var action = this.handleEvent(event);
        if(!action && event.charCode !== 0) {
          event.preventDefault();
          var charCode = event.charCode || event.keyCode;
          this.insertText(String.fromCharCode(charCode));
        }
      }
    }, undefined, undefined, true);

    this.input.addEventListener('keydown', (event) => {
      if(!event._preventDefault) {
        var action = this.handleEvent(event);
      }
    }, undefined, undefined, true);
  }

  augemntAddListener() {
    var window = this.input.ownerDocument.defaultView;
    var HTMLInputElement = window.HTMLInputElement.prototype;

    if(typeof HTMLInputElement == 'undefined' || !HTMLInputElement) {
      console.warn('cannot use InputSimBrowser without a DOM and HTMLInputElement');
    }

    var original_Input_addEventListener = HTMLInputElement.addEventListener,
        original_Input_removeEventListener = HTMLInputElement.removeEventListener,
        terminalListeners = [];

    HTMLInputElement.addEventListener = function _Input_addEventListener(event, listener, useCapture, wantsUntrusted, terminal) {
      if(terminal) {
        console.log('terminal', event);
        terminalListeners.push(arguments);
        original_Input_addEventListener.apply(this, [].slice.call(arguments));
      } else if(terminalListeners.length) {
        console.log('nonterminal_1', event);
        // If it's not terminal but we have a listen that is we need to make sure
        // our terminal event listener fires last
        HTMLInputElement.removeEventListener.apply(this, [].slice.call(terminalListeners[0]));
        original_Input_addEventListener.apply(this, [].slice.call(arguments));
        original_Input_addEventListener.apply(this, [].slice.call(terminalListeners[0]));
      } else {
        console.log('nonterminal_2', event);
        // No terminals present, "Nothing To See Here, Move Along"
        original_Input_addEventListener.apply(this, [].slice.call(arguments));
      }
    };

    HTMLInputElement.removeEventListener = function _Input_removeEventListener(event, listener, useCapture, terminal) {
      if(terminal) {
        for(var i = 0; i < terminalListeners.length; i++) {
          if(arguments[0] === terminalListeners[i][0] && arguments[1] === terminalListeners[i][1]) {
            terminalListeners.splice(i,1);
            return original_Input_removeEventListener.apply(this, [].slice.call(arguments));
          }
        }
      } else {
        // Not terminal, "Nothing To See Here, Move Along"
        original_Input_removeEventListener.apply(this, [].slice.call(arguments));
      }
    };
  }
}

if (typeof define === 'function' && define.amd) {
  define(function() { return InputSimBrowser; });
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputSimBrowser;
} else if (typeof window !== 'undefined') {
  window.InputSimBrowser = InputSimBrowser;
} else {
  this.InputSimBrowser = InputSimBrowser;
}
