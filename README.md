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

Philosophy
----------
* **test should be run in series** - otherwise mocks and globals (like your
  database) aren't deterministic (learned from nodeunit).
* **tests should be written in code** - programmers are used to reading and
  writing code. Brevity is better than syntax.
  `expects(code.dsl.easy).not.toBeTruthy()` (learned from jasmine).
* **javascript tests should never call `wait`** - Having wait with a timeout
  period is slow and nondeterministic.  What if a callback takes longer than
  expected? You don't need it in your code, why allow it in tests? (learned
  from unittest.js, qunit)
* **tests and setup should be independent** - you often want to test the same
  functionality in different contexts or use similar contexts for different
  tests. (learned from vows, rspec)
* **setup can be nested, but tests shouldn't** - for the same reason as above,
  and you often want to run just one test. (learned from rspec)

Future API
----------

Here's what I'm thinking.

    // apples.js
    Season = 'spring';
    I.amHungry = false;

    Apple = function() {};
    Apple.prototype = {
      isRipe: function() { return Season !== 'spring' },
      isFresh: function() { return Season === 'summer' },
      isTasty: function() { return this.isRipe() && this.isFresh() && I.amHungry; }
    };

    when('initial', function() {          // <-- use `when` to scope
      has('an apple', function() {        // <-- use `has` to provide context
        this.apple = new Apple();
      });
      its('not ripe', function() {        // <-- use `its` to assert
        return !this.apple.isRipe();
      });
      its('not tasty', function() {       // <-- you can do multiple asserts in a scope
        return !this.apple.isTasty();
      });
      its('not fresh', function() {
        return !this.apple.isFresh();     // <-- asserts should depend only on `this`
      });
    });

    when('seasons', function() {
      has('an apple');                    // <-- you can reuse `has` contexts

      function hasSeason(season) {
        has(season + ' season', function() {
          Season = season;
        });
      }

      when('spring', function() {         // <-- you can nest `when` scopes
        hasSeason('spring');              // <-- gets `has('an apple')` context automatically
        its('not ripe');                  // <-- you can reuse `its` asserts
        its('not fresh');
      });

      when('summer', function(summer) {   // <-- `when` actually iterates over arguments
        hasSeason(summer);
        its('ripe', function() {
          return this.apple.isRipe();
        });
        its('fresh', function() {
          return this.apple.isFresh();
        });
      });

      when('winter', 'fall', function(season) {
        hasSeason(season);                // <-- so you can use it to loop
        its('ripe');
        its('not fresh');
      });
    });

    when('no hunger', function() {        // <-- here are some more examples
      has('an apple');
      has('no hunger', function() {
        I.amHungry = false;
      });
      when('spring', 'summer', 'fall', 'winter', function(season) {
        has(season + ' season');
        its('not tasty');
      });
    });

    when('hunger', function() {
      has('an apple');
      has('hunger', function() {
        I.amHungry = true;
      });

      when('summer', function() {
        has('summer season');
        its('tasty', function() {
          return this.apple.isTasty();
        });
      });

      when('spring', 'fall', 'winter', function(season) {
        has(season + ' season');
        its('not tasty');
      });
    });

    if (module.id === '.') run();         // <-- this is sadly necessary to run tests
    else exports.tests = suite();         // but it lets you just do `node apple.js`

It should be trivial to DRY tests across suites.

    // fugi.js
    var apple = require('apple');

    FugiApple = function() {};
    FugiApple.prototype = new Apple();
    FugiApple.prototype.isTasty = function() { return this.isRipe() && this.isFresh(); }

    when('fugi', function() {
      has('a fugi apple', function() {
        this.apple = new FugiApple();
      });
      apple.tests.has('no hunger');     // <-- uses the `has` contexts defined in apples.js
      apple.tests.has('summer season');
      apple.tests.its('tasty');         // <-- and the `its` asserts
    });

    if (module.id === '.') run();
    else exports.tests = suite();

Asynchronous support will be built in.

    // async.js
    function runsLater(callback() {
      setTimeout(function() {
        callback('itRan');
      }, 100);
    });

    has('run later', function(has) {  //  <-- the passed `has` is just a reference to `this`
      runsLater(function(message) {
        has.message = message;
        has.done();
      });
      return has.wait(2000);          // <-- `2000` is a **timeout** not a delay
    });
    its('finished running', function() {
      return this.message === 'itRan';
    });

Asserts can also be asynchronous when `this.wait()` is returned.  This is **not recommended**
because it usually means you are doing something in your `its` block that should be in a `has`
block.

    // async2.js
    function runsLater(callback() {
      setTimeout(function() {
        callback('itRan');
      }, 100);
    });

    // *WRONG*
    its('run later', function(its) {  //  <-- the passed `its` is just a reference to `this`
      runsLater(function(message) {
        its.done(message === 'itRan');
      });
      return its.wait(2000);          // <-- `2000` is a **timeout** not a delay
    });

Feedback appreciated.

Future Command Line
-------------------

You can run all the tests:

    > nodeunit-dsl *.js --its "tasty"
    apple.js
      an apple
      summer season
      hunger
        ✔ tasty
    fugi.js
      a fugi apple
      summer season
      no hunger
      ✔ tasty

Or run all the matching contexts:

    > nodeunit-dsl *.js --has "no hunger"
    apple.js
      an apple
      no hunger
        summer
          ✔ not tasty
        spring
          ✔ not tasty
        winter
          ✔ not tasty
        fall
          ✔ not tasty
    fugi.js
      a fugi apple
      summer season
      no hunger
      ✔ tasty

Or do both:

    > nodeunit-dsl *.js --has "no hunger" --its "tasty"
    fugi.js
      a fugi apple
      summer season
      no hunger
      ✔ tasty

How 'bout them apples? `:-)`