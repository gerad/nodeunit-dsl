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
    Season = null;
    I.amHungry = null;

    Apple = function() {};
    Apple.prototype = {
      isRipe: function() { return Season === 'summer' || Season === 'fall'; },
      isTasty: function() { return this.isRipe() && I.amHungry; }
    };

    FugiApple = function() {};
    FugiApple.prototype = new Apple();
    FugiApple.prototype.isTasty = function() { return this.isRipe(); }

    with('an apple', function() {
      this.apple = new Apple();

      with("fall", function() {
        Season = 'fall';
        test('the apple is ripe', function(is) {
          is.ok(this.apple.isRipe());
        });

        with('hunger', function() {
          I.amHungry = true;
          test('the apple is not tasty', function(is) {
            is.ok(!this.apple.isTasty());
          });
        });
      });

      with("summer", function() {
        Season = 'summer';
        test('the apple is ripe'); // predefined test
        with('hunger', function() { // predefined context
          test('the apple is tasty', function(is) { // new test
            is.ok(this.apple.isTasty());
          });
        });
        with('no hunger', function() { // new context
          I.amHungry = false;
          test('the apple is not tasty'); // predefined test
        })
      });
    });

    with('a fugi apple', function() {
      this.apple = new FugiApple();
      with('no hunger', function(){
        test('the apple is tasty');
      });
    });

Feedback appreciated.

Future Command Line
-------------------

You can run all the tests:

    > nodeunit-dsl apples.js --test "the apple is tasty"
    with an apple
      with summer
        with hunger
          the apple is tasty
    with a fugi apple
      with no hunger
        the apple is tasty

Or run all the matching contexts:

    > nodeunit-dsl apples.js --with "no hunger"
    with an apple
      with summer
        with no hunger
          the apple is not tasty
    with a fugi apple
      with no hunger
        the apple is tasty

Or do both:

    > nodeunit-dsl apples.js --with "no hunger" --test "the apple is tasty"
    with a fugi apple
      with no hunger
        the apple is tasty

How 'bout them apples? `:-)`
