'use strict'

var test = require('tap').test
var Progress = require('are-we-there-yet')
var log = require('../log.js')

var actions = []
log.gauge = {
  enabled: false,
  enable: function () {
    this.enabled = true
    actions.push(['enable'])
  },
  disable: function () {
    this.enabled = false
    actions.push(['disable'])
  },
  isEnabled: function () {
    return this.enabled
  },
  hide: function () {
    actions.push(['hide'])
  },
  show: function () {
    actions.push(['show'].concat(Array.prototype.slice.call(arguments)))
  },
  pulse: function (name) {
    actions.push(['pulse', name])
  },
}

function recursiveMatch (t, actual, expected, desc) {
  if (expected instanceof RegExp)
    return t.match(actual, expected, desc + ' matches')
  else if (typeof expected === 'boolean')
    return t.equal(!!actual, expected, desc + ' exists')
  else if (typeof expected !== 'object' || expected == null)
    return t.equal(actual, expected, desc + ' are equal')
  else {
    if (actual == null)
      actual = {}
    Object.keys(expected).forEach(function (key) {
      recursiveMatch(t, actual && actual[key], expected[key], desc + ':' + key)
    })
    if (Array.isArray(actual)) {
      if (!t.equal(actual.length, expected.length, desc + ' has matching length')) {
        t.comment('    Actual: ', actual)
        t.comment('    Expected: ', expected)
      }
    } else {
      Object.keys(actual).forEach(function (key) {
        if (expected[key] == null)
          t.fail(desc + ':' + key + ' should not be set')
      })
    }
  }
}

function didActions (t, msg, output) {
  t.equal(actions.length, output.length, msg)

  for (var cmd = 0; cmd < output.length; ++cmd)
    recursiveMatch(t, actions[cmd], output[cmd], msg + ':' + output[cmd][0])

  actions = []
}

function resetTracker () {
  log.disableProgress()
  log.tracker = new Progress.TrackerGroup()
  log.enableProgress()
  actions = []
}

test('enableProgress', function (t) {
  t.plan(4)
  resetTracker()
  log.disableProgress()
  actions = []
  log.enableProgress()
  didActions(t, 'enableProgress', [['enable']])
  log.enableProgress()
  didActions(t, 'enableProgress again', [])
})

test('disableProgress', function (t) {
  t.plan(4)
  resetTracker()
  log.disableProgress()
  didActions(t, 'disableProgress', [['disable']])
  log.disableProgress()
  didActions(t, 'disableProgress again', [])
})

test('showProgress', function (t) {
  t.plan(6)
  resetTracker()
  log.disableProgress()
  actions = []
  log.showProgress('foo')
  didActions(t, 'showProgress disabled', [])
  log.enableProgress()
  actions = []
  log.showProgress('foo')
  didActions(t, 'showProgress', [['show', {section: 'foo', completed: 0}]])
})

test('clearProgress', function (t) {
  t.plan(4)
  resetTracker()
  log.clearProgress()
  didActions(t, 'clearProgress', [['hide']])
  log.disableProgress()
  actions = []
  log.clearProgress()
  didActions(t, 'clearProgress disabled', [])
})

test('newItem', function (t) {
  t.plan(21)
  resetTracker()
  actions = []
  var a = log.newItem('test', 10)
  didActions(t, 'newItem', [['show', {
    section: 'test',
    completed: 0,
    subsection: false,
    logline: false,
  }]])
  a.completeWork(5)
  didActions(t, 'newItem:completeWork', [['show', {
    section: 'test',
    completed: 0.5,
    subsection: false,
    logline: false,
  }]])
  a.finish()
  didActions(t, 'newItem:finish', [['show', {
    section: 'test',
    completed: 1,
    subsection: false,
    logline: false,
  }]])
})

// Test that log objects proxy through.
// Test that completion status filters up.
test('newGroup', function (t) {
  t.plan(39)
  resetTracker()
  var a = log.newGroup('newGroup')
  didActions(t, 'newGroup', [['show', {
    section: 'newGroup',
    completed: 0,
    subsection: false,
    logline: false,
  }]])
  a.warn('test', 'this is a test')
  didActions(t, 'newGroup:warn', [['pulse', 'test'], ['hide'], ['show', {
    subsection: 'test',
    logline: /this is a test$/,
    completed: 0,
  }]])
  var b = a.newItem('newGroup2', 10)
  didActions(t, 'newGroup:newItem', [['show', {
    section: 'newGroup2',
    completed: 0,
    subsection: true,
    logline: true,
  }]])
  b.completeWork(5)
  didActions(t, 'newGroup:completeWork', [['show', {
    section: 'newGroup2',
    completed: 0.5,
    subsection: true,
    logline: true,
  }]])
  a.finish()
  didActions(t, 'newGroup:finish', [['show', {
    section: 'newGroup',
    completed: 1,
    subsection: true,
    logline: true,
  }]])
})

test('newStream', function (t) {
  t.plan(22)
  resetTracker()
  var a = log.newStream('newStream', 10)
  didActions(t, 'newStream', [['show', {
    completed: 0,
    section: 'newStream',
    subsection: true,
    logline: true,
  }]])
  a.write('abcde')
  didActions(t, 'newStream', [['show', {
    completed: 0.5,
    section: 'newStream',
    subsection: true,
    logline: true,
  }]])
  a.write('fghij')
  didActions(t, 'newStream', [['show', {
    completed: 1,
    section: 'newStream',
    subsection: true,
    logline: true,
  }]])
  t.equal(log.tracker.completed(), 1, 'Overall completion')
})
