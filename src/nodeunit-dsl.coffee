# nodeunit-dsl - a simple dsl built on top of nodeunit

sys = require 'sys'
nodeunit = require 'nodeunit'

red   = (str) -> "\033[31m#{str}\033[39m"
green = (str) -> "\033[32m#{str}\033[39m"
bold  = (str) -> "\033[1m#{str}\033[22m"

tests = {}
exports.test = (name, fn) ->
  tests[name] = fn

befores = []
exports.before = (fn) ->
  befores.push fn

afters = []
exports.after = (fn) ->
  afters.push fn

exports.run = (name) ->
  process.nextTick ->
    sys.puts bold "\n#{name}"
    nodeunit.runModule name, tests, {
      name: name
      testStart: ->
        fn() for fn in befores
      testDone: (name, assertions) ->
        failures = if typeof(assertions.failures) is "function" then assertions.failures() else assertion.failures
        fn() for fn in afters
        if not failures
          sys.puts "✔ #{name}"
        else
          sys.puts red "✖ #{name}"
          for assertion in assertions when assertion.failed()
            sys.puts assertion.error.stack + "\n"
      moduleDone: (name, assertions) ->
        failures = if typeof(assertions.failures) is "function" then assertions.failures() else assertion.failures
        if failures
          sys.puts bold(red("\nFAILURES #{failures} / #{assertions.length} " +
            " assertions failed (#{assertions.duration} ms)"))
        else
          sys.puts bold(green("\nOK: #{assertions.length} assertions(#{assertions.duration} ms)"))
    }, (->)
