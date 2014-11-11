(function() {
    "use strict";
    var $$index$$$__Object$defineProperties = Object.defineProperties;
    var $$index$$$__Object$defineProperty = Object.defineProperty;
    var $$index$$$__Object$create = Object.create;
    var $$index$$$__Object$getPrototypeOf = Object.getPrototypeOf;
    var $$index$$jsdom = require('jsdom').jsdom;
    var $$index$$InputSim = require('input-sim').Input;
    var $$index$$Promise = require('promise');
    var $$index$$isFirstInFirstOut = false;

    var $$index$$document = $$index$$jsdom();
    var $$index$$window = $$index$$document.defaultView;

    function $$index$$dispatchEvent(target, type) {
      var document = target.ownerDocument;
      var window = document.defaultView;
      var Event = window.Event;

      var event;

      if (Event) {
        event = new Event(type);
      } else {
        event = document.createEvent('UIEvents');
      }

      event.initEvent(type, true, true);

      target.dispatchEvent(event);
    }

    function $$index$$checkFirstInFirstOut() {
      var input = $$index$$jsdom('<input />').getElementsByTagName('input')[0];
      var _isFirstInFirstOut = null;
      var interval;
      var firstIn = function(event) {
        if(event._preventDefault) _isFirstInFirstOut = false;
        event.preventDefault();
      };
      var secondIn = function (event) {
        if(event._preventDefault) _isFirstInFirstOut = true;
        event.preventDefault();
      };
      input.addEventListener('keypress', firstIn);
      input.addEventListener('keypress', secondIn);

      $$index$$dispatchEvent(input, 'keypress');

      return new $$index$$Promise(function (resolve, reject) {
        interval = setInterval(function() {
          if(_isFirstInFirstOut !== null) {
            clearInterval(interval);
            input.removeEventListener('keypress', firstIn);
            input.removeEventListener('keypress', secondIn);
            resolve(_isFirstInFirstOut);
          }
        }, 100);
      });
    }

    var $$index$$InputSimBrowser = function($__super) {
      "use strict";

      function InputSimBrowser(_options, ready) {
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
        $$index$$$__Object$getPrototypeOf(InputSimBrowser.prototype).constructor.call(this, this.ops.value);

        if(ready) {
          $$index$$checkFirstInFirstOut().then( function(_isFirstInFirstOut) {
            $$index$$isFirstInFirstOut = _isFirstInFirstOut;
            this.addBrowser();
            ready();
          }.bind(this));
        }
      }

      InputSimBrowser.__proto__ = ($__super !== null ? $__super : Function.prototype);
      InputSimBrowser.prototype = $$index$$$__Object$create(($__super !== null ? $__super.prototype : null));

      $$index$$$__Object$defineProperty(InputSimBrowser.prototype, "constructor", {
        value: InputSimBrowser
      });

      $$index$$$__Object$defineProperties(InputSimBrowser.prototype, {
        setText: {
          value: function(value) {
            this.input.value = value;
            $$index$$$__Object$getPrototypeOf(InputSimBrowser.prototype).setText.call(this, value);
          },

          enumerable: false,
          writable: true
        },

        makeInput: {
          value: function() {
            var attrString = '';
            var extraString = '';
            for(var key in this.ops.extra) {
              if(this.ops.extra.hasOwnProperty(key)) {
                extraString += " " + key + "=\"" + this.ops.extra[key] + "\"";
              }
            };
            for(var key in this.ops) {
              if(this.ops.hasOwnProperty(key) && this.ops[key] !== '' && key !== 'extra') {
                attrString += " " + key + "=\"" + this.ops[key] + "\"";
              } else if(key === 'extra') {
                attrString += extraString;
              }
            };

            this.input = $$index$$jsdom("<input " + attrString + " />").getElementsByTagName('input')[0];
            Object.defineProperty(this.input, 'inputSim', {
              value: this
            });
          },

          enumerable: false,
          writable: true
        },

        addBrowser: {
          value: function() {
            this.augemntAddListener();

            this.input.addEventListener('keypress', function(event) {
              if(!event._preventDefault) {
                if(event.charCode === 0) {
                  var action = this.handleEvent(event);
                }
                if(!action && event.charCode !== 0) {
                  event.preventDefault();
                  var charCode = event.charCode || event.keyCode;
                  this.insertText(String.fromCharCode(charCode));
                }
              }
            }.bind(this), undefined, undefined, true);

            this.input.addEventListener('keydown', function(event) {
              if(!event._preventDefault) {
                var action = this.handleEvent(event);
              }
            }.bind(this), undefined, undefined, true);
          },

          enumerable: false,
          writable: true
        },

        augemntAddListener: {
          value: function() {
            var window = this.input.ownerDocument.defaultView;
            var HTMLInputElement = window.HTMLInputElement.prototype;

            if(typeof HTMLInputElement == 'undefined' || !HTMLInputElement) {
              console.warn('cannot use InputSimBrowser without a DOM and HTMLInputElement');
            }

            var original_Input_addEventListener = HTMLInputElement.addEventListener,
                original_Input_removeEventListener = HTMLInputElement.removeEventListener,
                nonTerminalListeners = [],
                terminalListeners = [];

            HTMLInputElement.addEventListener = function _Input_addEventListener(event, listener, useCapture, wantsUntrusted, terminal) {
              var $__arguments0 = arguments;
              var $__arguments = $__arguments0;
              if(terminal) {
                terminalListeners.push($__arguments);
                original_Input_addEventListener.apply(this, [].slice.call($__arguments));

                if(!$$index$$isFirstInFirstOut && nonTerminalListeners.length) {
                  for(var i = 0; i < nonTerminalListeners.length; i++) {
                    var args = nonTerminalListeners[i];
                    HTMLInputElement.removeEventListener.apply(this, [].slice.call(args));
                    HTMLInputElement.addEventListener.apply(this, [].slice.call(args));
                  }
                }
              } else if($$index$$isFirstInFirstOut && terminalListeners.length) {
                // If it's not terminal but we have a listen that is we need to make sure
                // our terminal event listener fires last
                HTMLInputElement.removeEventListener.apply(this, [].slice.call(terminalListeners[0]));
                original_Input_addEventListener.apply(this, [].slice.call($__arguments));
                original_Input_addEventListener.apply(this, [].slice.call(terminalListeners[0]));
              } else {
                // No terminals present, "Nothing To See Here, Move Along"
                nonTerminalListeners.push($__arguments);
                original_Input_addEventListener.apply(this, [].slice.call($__arguments));
              }
            };

            HTMLInputElement.removeEventListener = function _Input_removeEventListener(event, listener, useCapture, terminal) {
              var $__arguments1 = arguments;
              var $__arguments = $__arguments1;
              if(terminal) {
                for(var i = 0; i < terminalListeners.length; i++) {
                  if($__arguments[0] === terminalListeners[i][0] && $__arguments[1] === terminalListeners[i][1]) {
                    terminalListeners.splice(i,1);
                    return original_Input_removeEventListener.apply(this, [].slice.call($__arguments));
                  }
                }
              } else {
                // Not terminal, "Nothing To See Here, Move Along"
                for(var i = 0; i < nonTerminalListeners.length; i++) {
                  if($__arguments[0] === nonTerminalListeners[i][0] && $__arguments[1] === nonTerminalListeners[i][1]) {
                    nonTerminalListeners.splice(i,1);
                    return original_Input_removeEventListener.apply(this, [].slice.call($__arguments));
                  }
                }
              }
            };
          },

          enumerable: false,
          writable: true
        }
      });

      return InputSimBrowser;
    }($$index$$InputSim);

    var $$index$$default = $$index$$InputSimBrowser;

    if (typeof define === 'function' && define.amd) {
      define(function() { return $$index$$default; });
    } else if (typeof module !== 'undefined' && module.exports) {
      module.exports = $$index$$default;
    } else if (typeof window !== 'undefined') {
      window.InputSimBrowser = $$index$$default;
    } else {
      this.InputSimBrowser = $$index$$default;
    }
}).call(this);

//# sourceMappingURL=index.js.map