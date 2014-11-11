import InputSimBrowser from './index.js';

if (typeof define === 'function' && define.amd) {
  define(function() { return InputSimBrowser; });
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputSimBrowser;
} else if (typeof window !== 'undefined') {
  window.InputSimBrowser = InputSimBrowser;
} else {
  this.InputSimBrowser = InputSimBrowser;
}
