nodeunit-dsl
============

A pretty dsl on top of nodeunit.

Installation
------------

    > git clone http://github.com/gerad/nodeunit-dsl.git
    > npm link nodeunit-dsl

Usage
-----

Create a test file.

    // test/example.js
    
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

Then run it.

    > node tests/example.js

Alternatively, you can run all tests with the provided command line utility.

    > nodeunit-dsl tests/
