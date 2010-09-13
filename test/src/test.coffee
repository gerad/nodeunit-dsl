assert = require 'assert'
{test, before, after, run} = require 'nodeunit-dsl'

states = []
before ->
  states.push 'before'

test "during", (t) ->
  t.equals(1, states.length)
  states.push 'during'
  t.done()

after ->
  states.push 'after'

process.on 'exit', ->
  assert.deepEqual ['before', 'during', 'after'], states

run(__filename) if module?.id is '.'
