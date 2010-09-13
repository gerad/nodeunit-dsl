(function() {
  var afters, befores, bold, green, nodeunit, red, sys, tests;
  sys = require('sys');
  nodeunit = require('nodeunit');
  red = function(str) {
    return "\033[31m" + (str) + "\033[39m";
  };
  green = function(str) {
    return "\033[32m" + (str) + "\033[39m";
  };
  bold = function(str) {
    return "\033[1m" + (str) + "\033[22m";
  };
  tests = {};
  exports.test = function(name, fn) {
    console.log(exports);
    return (tests[name] = fn);
  };
  befores = [];
  exports.before = function(fn) {
    return befores.push(fn);
  };
  afters = [];
  exports.after = function(fn) {
    return afters.push(fn);
  };
  exports.run = function(name) {
    return process.nextTick(function() {
      sys.puts(bold(("\n" + (name))));
      return nodeunit.runModule(tests, {
        name: name,
        testStart: function() {
          var _a, _b, _c, _d, fn;
          _a = []; _c = befores;
          for (_b = 0, _d = _c.length; _b < _d; _b++) {
            fn = _c[_b];
            _a.push(fn());
          }
          return _a;
        },
        testDone: function(name, assertions) {
          var _a, _b, _c, _d, _e, _f, _g, assertion, fn;
          _b = afters;
          for (_a = 0, _c = _b.length; _a < _c; _a++) {
            fn = _b[_a];
            fn();
          }
          if (!assertions.failures) {
            return sys.puts(("✔ " + (name)));
          } else {
            sys.puts(red(("✖ " + (name))));
            _d = []; _f = assertions;
            for (_e = 0, _g = _f.length; _e < _g; _e++) {
              assertion = _f[_e];
              assertion.failed() ? _d.push(sys.puts(assertion.error.stack + "\n")) : null;
            }
            return _d;
          }
        },
        moduleDone: function(name, assertions) {
          return assertions.failures ? sys.puts(bold(red(("\nFAILURES " + (assertions.failures) + " / " + (assertions.length) + " ") + (" assertions failed (" + (assertions.duration) + " ms)")))) : sys.puts(bold(green(("\nOK: " + (assertions.length) + " assertions(" + (assertions.duration) + " ms)"))));
        }
      });
    });
  };
})();
