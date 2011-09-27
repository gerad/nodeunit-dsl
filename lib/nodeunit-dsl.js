(function() {
  var afters, befores, bold, green, nodeunit, red, sys, tests;
  sys = require('sys');
  nodeunit = require('nodeunit');
  red = function(str) {
    return "\033[31m" + str + "\033[39m";
  };
  green = function(str) {
    return "\033[32m" + str + "\033[39m";
  };
  bold = function(str) {
    return "\033[1m" + str + "\033[22m";
  };
  tests = {};
  exports.test = function(name, fn) {
    return tests[name] = fn;
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
      sys.puts(bold("\n" + name));
      return nodeunit.runModule(name, tests, {
        name: name,
        testStart: function() {
          var fn, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = befores.length; _i < _len; _i++) {
            fn = befores[_i];
            _results.push(fn());
          }
          return _results;
        },
        testDone: function(name, assertions) {
          var assertion, failures, fn, _i, _j, _len, _len2, _results;
          failures = typeof assertions.failures === "function" ? assertions.failures() : assertion.failures;
          for (_i = 0, _len = afters.length; _i < _len; _i++) {
            fn = afters[_i];
            fn();
          }
          if (!failures) {
            return sys.puts("✔ " + name);
          } else {
            sys.puts(red("✖ " + name));
            _results = [];
            for (_j = 0, _len2 = assertions.length; _j < _len2; _j++) {
              assertion = assertions[_j];
              if (assertion.failed()) {
                _results.push(sys.puts(assertion.error.stack + "\n"));
              }
            }
            return _results;
          }
        },
        moduleDone: function(name, assertions) {
          var failures;
          failures = typeof assertions.failures === "function" ? assertions.failures() : assertion.failures;
          if (failures) {
            return sys.puts(bold(red(("\nFAILURES " + failures + " / " + assertions.length + " ") + (" assertions failed (" + assertions.duration + " ms)"))));
          } else {
            return sys.puts(bold(green("\nOK: " + assertions.length + " assertions(" + assertions.duration + " ms)")));
          }
        }
      }, (function() {}));
    });
  };
}).call(this);
