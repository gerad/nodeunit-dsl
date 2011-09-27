var dsl = require('nodeunit-dsl'),
	  test = dsl.test,
	  run = dsl.run;

if (module.id === '.') run(__filename);

test('the total number of failures is evaluated correctly', function(t) {
	t.ok(true);
	t.done();
});

