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
  database) aren't deterministic.
* **tests should be written in code** - `assert` makes just as much sense as
  `should`
* **javascript tests should never call wait** - Having wait with a timeout
  period is slow and nondeterministic (what if a callback takes longer than
  expected?).You don't need it in your code, why have in tests?
* **tests and setup should be independent** - you often want to test the same
  functionality in different contexts or use similar contexts for different
  tests.
* **setup can be nested, but tests shouldn't** - for the same reason as above,
  and you often want to run just one test

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

    when('initial', function() {
      has('an apple', function() {
        this.apple = new Apple();
      });
      its('not ripe', function() {
        return !this.apple.isRipe();
      });
      its('not tasty', function() {
        return !this.apple.isTasty();
      });
      its('not fresh', function() {
        return !this.apple.isFresh();
      });
    });

    when('seasons', function() {
      has('an apple');

      function hasSeason(season) {
        has(season + ' season', function() { Season = season; });
      }

      when('spring', function() {
        hasSeason('spring');
        its('not ripe');
        its('not fresh');
      });

      when('summer', function(summer) {
        hasSeason(summer);
        its('ripe', function() {
          return this.apple.isRipe();
        });
        its('fresh', function() {
          return this.apple.isFresh();
        });
      });

      when('winter', 'fall', function(season) {
        hasSeason(season);
        its('ripe');
        its('not fresh');
      });
    });

    when('no hunger', function() {
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

    if (module.id === '.') run();
    else exports.tests = suite();

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
      apple.tests.has('no hunger');
      apple.tests.has('summer season');
      apple.tests.its('tasty');
    });

    if (module.id === '.') run();
    else exports.tests = suite();

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