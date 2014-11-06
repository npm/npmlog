'use strict'

var test = require('tap').test
var log = require('../log.js')

var actions = []
log.gauge = {
  enable: function () {
    actions.push(['enable'])
  },
  disable: function () {
    actions.push(['disable'])
  },
  hide: function () {
    actions.push(['hide'])
  },
  show: function (name, completed) {
    actions.push(['show', name, completed])
  },
  pulse: function (name) {
    actions.push(['pulse', name])
  }
}

function didActions(t, msg, output) {
  var tests = []
  for (var ii = 0; ii < output.length; ++ ii) {
    for (var jj = 0; jj < output[ii].length; ++ jj) {
      tests.push({cmd: ii, arg: jj})
    }
  }
  t.is(actions.length, output.length, msg)
  tests.forEach(function (test) {
    t.is(actions[test.cmd] ? actions[test.cmd][test.arg] : null, 
         output[test.cmd][test.arg],
         msg + ': ' + output[test.cmd] + (test.arg ? ' arg #'+test.arg : ''))
  })
  actions = []
}


test('enableProgress', function (t) {
  t.plan(6)
  log.enableProgress()
  didActions(t, 'enableProgress', [ [ 'enable' ], [ 'show', undefined, 0 ] ])
  log.enableProgress()
  didActions(t, 'enableProgress again', [])
})

test('disableProgress', function (t) {
  t.plan(4)
  log.disableProgress()
  didActions(t, 'disableProgress', [ [ 'hide' ], [ 'disable' ] ])
  log.disableProgress()
  didActions(t, 'disableProgress again', [])
})

test('showProgress', function (t) {
  t.plan(5)
  log.showProgress('foo')
  didActions(t, 'showProgress disabled', [])
  log.enableProgress()
  actions = []
  log.showProgress('foo')
  didActions(t, 'showProgress', [ [ 'show', 'foo', 0 ] ])
})

test('clearProgress', function (t) {
  t.plan(3)
  log.clearProgress()
  didActions(t, 'clearProgress', [ [ 'hide' ] ])
  log.disableProgress()
  actions = []
  log.clearProgress()
  didActions(t, 'clearProgress disabled', [ ])
})
