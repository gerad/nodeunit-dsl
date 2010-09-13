(function() {
  var _a, after, assert, before, run, states, test;
  assert = require('assert');
  _a = require('nodeunit-dsl');
  test = _a.test;
  before = _a.before;
  after = _a.after;
  run = _a.run;
  states = [];
  before(function() {
    return states.push('before');
  });
  test("during", function(t) {
    t.equals(1, states.length);
    states.push('during');
    return t.done();
  });
  after(function() {
    return states.push('after');
  });
  process.on('exit', function() {
    return assert.deepEqual(['before', 'during', 'after'], states);
  });
  if ((typeof module === "undefined" || module == undefined ? undefined : module.id) === '.') {
    run(__filename);
  }
})();
