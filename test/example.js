// tests/example.js
var dsl = require('nodeunit-dsl'),
  test = dsl.test, run = dsl.run,
  before = dsl.before, after = dsl.after;

if (module.id === '.') run(__filename);

before(function() {
  // do something before each test
});

test("it worked", function(t) {
  t.expect(1);
  t.ok('it worked');
  t.done();
});

after(function() {
  // do something after each test
});