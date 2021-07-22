const t = require('tap')
const log = require('../')
const stream = require('stream')

const result = []
const logEvents = []
const logInfoEvents = []
const logPrefixEvents = []

const resultExpect = [
  '\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[7msill\u001b[0m \u001b[0m\u001b[35msilly prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[34;40mverb\u001b[0m \u001b[0m\u001b[35mverbose prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[32minfo\u001b[0m \u001b[0m\u001b[35minfo prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[32;40mtiming\u001b[0m \u001b[0m\u001b[35mtiming prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[32;40mhttp\u001b[0m \u001b[0m\u001b[35mhttp prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[34;40mnotice\u001b[0m \u001b[0m\u001b[35mnotice prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[30;43mWARN\u001b[0m \u001b[0m\u001b[35mwarn prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[31;40mERR!\u001b[0m \u001b[0m\u001b[35merror prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[32minfo\u001b[0m \u001b[0m\u001b[35minfo prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[32;40mtiming\u001b[0m \u001b[0m\u001b[35mtiming prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[32;40mhttp\u001b[0m \u001b[0m\u001b[35mhttp prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[34;40mnotice\u001b[0m \u001b[0m\u001b[35mnotice prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[30;43mWARN\u001b[0m \u001b[0m\u001b[35mwarn prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[31;40mERR!\u001b[0m \u001b[0m\u001b[35merror prefix\u001b[0m x = {"foo":{"bar":"baz"}}\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[31;40mERR!\u001b[0m \u001b[0m\u001b[35m404\u001b[0m This is a longer\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[31;40mERR!\u001b[0m \u001b[0m\u001b[35m404\u001b[0m message, with some details\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[31;40mERR!\u001b[0m \u001b[0m\u001b[35m404\u001b[0m and maybe a stack.\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u001b[31;40mERR!\u001b[0m \u001b[0m\u001b[35m404\u001b[0m \n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u0007noise\u001b[0m\u001b[35m\u001b[0m LOUD NOISES\n',
  '\u001b[0m\u001b[37;40mnpm\u001b[0m \u001b[0m\u0007noise\u001b[0m \u001b[0m\u001b[35merror\u001b[0m erroring\n',
  '\u001b[0m',
]

const logPrefixEventsExpect = [
  { id: 2,
    level: 'info',
    prefix: 'info prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 11,
    level: 'info',
    prefix: 'info prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 20,
    level: 'info',
    prefix: 'info prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
]

// should be the same.
const logInfoEventsExpect = logPrefixEventsExpect

const logEventsExpect = [
  { id: 0,
    level: 'silly',
    prefix: 'silly prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 1,
    level: 'verbose',
    prefix: 'verbose prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 2,
    level: 'info',
    prefix: 'info prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 3,
    level: 'timing',
    prefix: 'timing prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 4,
    level: 'http',
    prefix: 'http prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 5,
    level: 'notice',
    prefix: 'notice prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 6,
    level: 'warn',
    prefix: 'warn prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 7,
    level: 'error',
    prefix: 'error prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 8,
    level: 'silent',
    prefix: 'silent prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 9,
    level: 'silly',
    prefix: 'silly prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 10,
    level: 'verbose',
    prefix: 'verbose prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 11,
    level: 'info',
    prefix: 'info prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 12,
    level: 'timing',
    prefix: 'timing prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 13,
    level: 'http',
    prefix: 'http prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 14,
    level: 'notice',
    prefix: 'notice prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 15,
    level: 'warn',
    prefix: 'warn prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 16,
    level: 'error',
    prefix: 'error prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 17,
    level: 'silent',
    prefix: 'silent prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 18,
    level: 'silly',
    prefix: 'silly prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 19,
    level: 'verbose',
    prefix: 'verbose prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 20,
    level: 'info',
    prefix: 'info prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 21,
    level: 'timing',
    prefix: 'timing prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 22,
    level: 'http',
    prefix: 'http prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 23,
    level: 'notice',
    prefix: 'notice prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 24,
    level: 'warn',
    prefix: 'warn prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 25,
    level: 'error',
    prefix: 'error prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 26,
    level: 'silent',
    prefix: 'silent prefix',
    message: 'x = {"foo":{"bar":"baz"}}',
    messageRaw: ['x = %j', { foo: { bar: 'baz' } }] },
  { id: 27,
    level: 'error',
    prefix: '404',
    message: 'This is a longer\nmessage, with some details\nand maybe a stack.\n',
    messageRaw: ['This is a longer\nmessage, with some details\nand maybe a stack.\n'] },
  { id: 28,
    level: 'noise',
    prefix: false,
    message: 'LOUD NOISES',
    messageRaw: ['LOUD NOISES'] },
  { id: 29,
    level: 'noise',
    prefix: 'error',
    message: 'erroring',
    messageRaw: ['erroring'] },
]

const Stream = require('stream').Stream
const s = new Stream()
s.write = function (m) {
  result.push(m)
}

s.writable = true
s.isTTY = true
s.end = function () {}

log.stream = s

log.heading = 'npm'

t.test('basic', async t => {
  t.same(log.stream, s, 'stream getter works')
  log.on('log', logEvents.push.bind(logEvents))
  log.on('log.info', logInfoEvents.push.bind(logInfoEvents))
  log.on('info prefix', logPrefixEvents.push.bind(logPrefixEvents))

  console.error('log.level=silly')
  log.level = 'silly'
  log.silly('silly prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.verbose('verbose prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.info('info prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.timing('timing prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.http('http prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.notice('notice prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.warn('warn prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.error('error prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.silent('silent prefix', 'x = %j', {foo: {bar: 'baz'}})

  console.error('log.level=silent')
  log.level = 'silent'
  log.silly('silly prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.verbose('verbose prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.info('info prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.timing('timing prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.http('http prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.notice('notice prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.warn('warn prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.error('error prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.silent('silent prefix', 'x = %j', {foo: {bar: 'baz'}})

  console.error('log.level=info')
  log.level = 'info'
  log.silly('silly prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.verbose('verbose prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.info('info prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.timing('timing prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.http('http prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.notice('notice prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.warn('warn prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.error('error prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.silent('silent prefix', 'x = %j', {foo: {bar: 'baz'}})
  log.error('404', 'This is a longer\n' +
                   'message, with some details\n' +
                   'and maybe a stack.\n')
  log.addLevel('noise', 10000, {beep: true})
  log.noise(false, 'LOUD NOISES')
  log.noise('error', 'erroring')

  t.same(result.join('').trim(), resultExpect.join('').trim(), 'result')
  t.same(log.record, logEventsExpect, 'record')
  t.same(logEvents, logEventsExpect, 'logEvents')
  t.same(logInfoEvents, logInfoEventsExpect, 'logInfoEvents')
  t.same(logPrefixEvents, logPrefixEventsExpect, 'logPrefixEvents')
})

t.test('util functions', async t => {
  t.teardown(() => {
    log.resume()
    log.gauge.enable()
  })

  t.test('enableColor', async t => {
    t.teardown(() => {
      log.disableColor()
    })
    log.enableColor()
    t.same(log.useColor(), true, 'log has color enabled')
    t.match(log.gauge._theme, { hasColor: true }, 'gauge has color enabled')
  })

  t.test('disableColor', async t => {
    log.disableColor()
    t.same(log.useColor(), false, 'color is disabled')
    t.match(log.gauge._theme, { hasColor: false }, 'gauge has color disabled')
  })

  t.test('enableUnicode', async t => {
    t.teardown(() => {
      log.disableUnicode()
    })
    log.enableUnicode()
    t.match(log.gauge._theme, { hasUnicode: true }, 'gauge has unicode enabled')
  })

  t.test('disableUnicode', async t => {
    log.disableUnicode()
    t.match(log.gauge._theme, { hasUnicode: false }, 'gauge has unicode disabled')
  })

  t.test('themes', async t => {
    const _themes = log.gauge._themes
    t.teardown(() => {
      log.setGaugeThemeset(_themes)
    })

    const themes = require('gauge/themes')
    const newThemes = themes.newThemeSet()
    log.setGaugeThemeset(newThemes)
    t.match(log.gauge._themes, newThemes, 'gauge has new theme set')
  })

  t.test('template', async t => {
    const _template = log.gauge._gauge.template
    t.teardown(() => {
      log.gauge._gauge.template = _template
    })
    const template = [{type: 'progressbar', length: 100 }]
    log.setGaugeTemplate(template)
    t.match(log.gauge._gauge.template, template)
  })

  t.test('enableProgress while paused', async t => {
    t.teardown(() => {
      log.enableProgress()
      log.resume()
    })
    log.disableProgress()
    log.pause()
    log.enableProgress()
    t.same(log.gauge.isEnabled(), false, 'gauge is still disabled')
  })

  t.test('pause while progressEnabled', async t => {
    t.teardown(() => {
      log.resume()
    })
    log.pause()
    t.same(log.gauge.isEnabled(), false, 'gauge is disabled')
  })

  t.test('_buffer while paused', async t => {
    t.teardown(() => {
      log.resume()
    })

    // const bufferLength = this._buffer.length
    log.pause()
    log.log('verbose', 'test', 'test log')
    t.equal(log._buffer.length, 1, 'message was buffered')
    log.resume()
    t.equal(log._buffer.length, 0, 'message was unbuffered')
  })
})

t.test('log.log', async t => {
  t.test('emits error on bad loglevel', t => {
    log.once('error', (err) => {
      t.match(err, /Undefined log level: "asdf"/)
      t.end()
    })
    log.log('asdf', 'bad loglevel')
  })

  t.test('resolves stack traces to a plain string', t => {
    log.once('log', (m) => {
      t.match(m.message, 'Error: with a stack trace', 'has error message')
      t.match(m.message, 'at Test', 'has stack info')
      t.end()
    })
    const err = new Error('with a stack trace')
    log.log('verbose', 'oops', err)
  })

  t.test('max record size', async t => {
    const mrs = log.maxRecordSize
    t.teardown(() => {
      log.maxRecordSize = mrs
    })

    log.maxRecordSize = 3
    log.log('verbose', 'test', 'log 1')
    log.log('verbose', 'test', 'log 2')
    log.log('verbose', 'test', 'log 3')
    log.log('verbose', 'test', 'log 4')
    t.equal(log.record.length, 3, 'only maxRecordSize entries in record')
  })
})

t.test('write with no stream', async t => {
  const gauge = log.gauge
  t.teardown(() => {
    log.gauge = gauge
    log.stream = s
  })
  log.gauge = null
  log.stream = null
  log.write('message')
  t.ok('does not throw')
})

t.test('emitLog to nonexistant level', async t => {
  t.teardown(() => {
    log.stream = s
  })
  const badStream = new stream.Writable()
  badStream.on('data', () => {
    throw new Error('should not have gotten data!')
  })
  log.emitLog({ prefix: 'test', level: 'asdf' })
  t.ok('does not throw')
})

t.test('emitLog to nonexistant level', async t => {
  t.teardown(() => {
    log.stream = s
  })
  const badStream = new stream.Writable()
  badStream.on('data', () => {
    throw new Error('should not have gotten data!')
  })
  log.emitLog({ prefix: 'test', level: 'asdf' })
  t.ok('does not throw')
})

t.test('_format with nonexistant stream', async t => {
  const gauge = log.gauge
  t.teardown(() => {
    log.gauge = gauge
    log.stream = s
  })
  log.gauge = null
  log.stream = null
  t.match(log._format('message'), undefined, 'does nothing')
})

t.test('_format', async t => {
  t.teardown(() => {
    log.disableColor()
  })

  t.test('nonexistant stream', async t => {
    const gauge = log.gauge
    t.teardown(() => {
      log.gauge = gauge
      log.stream = s
    })
    log.gauge = null
    log.stream = null
    t.match(log._format('message'), undefined, 'does nothing')
  })

  t.test('fg', async t => {
    log.enableColor()
    const o = log._format('test message', { bg: 'blue' })
    t.match(o, '\u001b[44mtest message\u001b[0m')
  })
  t.test('bg', async t => {
    log.enableColor()
    const o = log._format('test message', { bg: 'white' })
    t.match(o, '\u001b[47mtest message\u001b[0m')
  })
  t.test('bold', async t => {
    log.enableColor()
    const o = log._format('test message', { bold: true })
    t.match(o, '\u001b[1mtest message\u001b[0m')
  })
  t.test('underline', async t => {
    log.enableColor()
    const o = log._format('test message', { underline: true })
    t.match(o, '\u001b[4mtest message\u001b[0m')
  })
  t.test('inverse', async t => {
    log.enableColor()
    const o = log._format('test message', { inverse: true })
    t.match(o, '\u001b[7mtest message\u001b[0m')
  })
})
