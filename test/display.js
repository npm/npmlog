var tap = require('tap')
var log = require('../')

var actual = ''

// Store and stub log.write, so we can get at
// the actual arguments passed to it on each call.
var write = log.write
log.write = function (msg) {
  actual += msg
}
tap.test('explicitly set new log level display to empty string', function (t) {
  log.addLevel('explicitNoLevelDisplayed', 20000, {}, '')
  log.explicitNoLevelDisplayed('1', '2')
  t.equal(actual.trim(), '1 2')

  actual = ''

  log.explicitNoLevelDisplayed('', '1')
  t.equal(actual.trim(), '1')

  actual = ''
  t.end()
})
tap.test('explicitly set new log level display to 0', function (t) {
  log.addLevel('explicitNoLevelDisplayed', 20000, {}, 0)
  log.explicitNoLevelDisplayed('', '1')
  t.equal(actual.trim(), '0 1')
  t.end()
})

log.write = write
