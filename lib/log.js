var { EventEmitter } = require('events')
var setBlocking = require('set-blocking')
var consoleControl = require('console-control-strings')
var util = require('util')

setBlocking(true)

var trackerConstructors = ['newGroup', 'newItem', 'newStream']

class Log extends EventEmitter {
  #stream = process.stderr
  #gauge = undefined
  #colorEnabled = false
  #unicodeEnabled = false
  #id = 0
  #tracker = undefined
  #hasColor = undefined
  #hasUnicode = undefined

  constructor () {
    super()

    // default level
    this.level = 'info'
    // we track this separately as we may need to temporarily disable the
    // display of the status bar for our own loggy purposes.
    this.progressEnabled = false
    this._paused = false
    // bind for use in tracker's on-change listener
    this.showProgress = this.showProgress.bind(this)
    this._buffer = []
    this.record = []
    this.maxRecordSize = 10000
    this.log = this.log.bind(this)

    this.prefixStyle = { fg: 'magenta' }
    this.headingStyle = { fg: 'white', bg: 'black' }

    this.style = {}
    this.levels = {}
    this.disp = {}

    this.addLevel('silly', -Infinity, { inverse: true }, 'sill')
    this.addLevel('verbose', 1000, { fg: 'cyan', bg: 'black' }, 'verb')
    this.addLevel('info', 2000, { fg: 'green' })
    this.addLevel('timing', 2500, { fg: 'green', bg: 'black' })
    this.addLevel('http', 3000, { fg: 'green', bg: 'black' })
    this.addLevel('notice', 3500, { fg: 'cyan', bg: 'black' })
    this.addLevel('warn', 4000, { fg: 'black', bg: 'yellow' }, 'WARN')
    this.addLevel('error', 5000, { fg: 'red', bg: 'black' }, 'ERR!')
    this.addLevel('silent', Infinity)

    // allow 'error' prefix
    this.on('error', function () { })

    Object.defineProperty(this, 'tracker', {
      get: () => {
        if (!this.#tracker) {
          const Progress = require('are-we-there-yet')
          this.#tracker = new Progress.TrackerGroup()
        }

        return this.#tracker
      },
      set: (tracker) => {
        this.#tracker = tracker
      },
      enumerable: true,
      configurable: true,
    })
  }

  set stream (newStream) {
    this.#stream = newStream

    if (this.#gauge) {
      this.#gauge.setWriteTo(newStream, newStream)
    }
  }

  get stream () {
    return this.#stream
  }

  get gauge () {
    if (!this.#gauge) {
      const Gauge = require('gauge')
      this.#gauge = new Gauge(this.#stream, {
        enabled: false, // no progress bars unless asked
        theme: {
          hasColor: this.#hasColor !== undefined
            ? this.#hasColor
            : this.useColor(),
          hasUnicode: this.#hasUnicode,
        },
        template: [
          { type: 'progressbar', length: 20 },
          { type: 'activityIndicator', kerning: 1, length: 1 },
          { type: 'section', default: '' },
          ':',
          { type: 'logline', kerning: 1, default: '' },
        ],
      })
    }

    return this.#gauge
  }

  set gauge (newGauge) {
    this.#gauge = newGauge
  }

  // by default, decide based on tty-ness.
  useColor () {
    return this.#colorEnabled != null ? this.#colorEnabled : this.#stream.isTTY
  }

  enableColor () {
    this.#colorEnabled = true
    this.#gaugeSetTheme(this.#colorEnabled, this.#unicodeEnabled)
  }

  disableColor () {
    this.#colorEnabled = false
    this.#gaugeSetTheme(this.#colorEnabled, this.#unicodeEnabled)
  }

  #gaugeSetTheme (hasColor, hasUnicode) {
    if (!this.#gauge) {
      this.#hasColor = hasColor
      this.#hasUnicode = hasUnicode
      return
    }

    this.#gauge.setTheme({
      hasColor,
      hasUnicode,
    })
  }

  enableUnicode () {
    this.#unicodeEnabled = true
    this.#gaugeSetTheme(this.useColor(), this.#unicodeEnabled)
  }

  disableUnicode () {
    this.#unicodeEnabled = false
    this.#gaugeSetTheme(this.useColor(), this.#unicodeEnabled)
  }

  setGaugeThemeset (themes) {
    this.gauge.setThemeset(themes)
  }

  setGaugeTemplate (template) {
    this.gauge.setTemplate(template)
  }

  trackerRemoveAllListeners () {
    if (!this.#tracker) {
      return
    }

    this.#tracker.removeAllListeners()
  }

  enableProgress () {
    if (this.progressEnabled || this._paused) {
      return
    }

    this.progressEnabled = true
    this.tracker.on('change', this.showProgress)
    this.gauge.enable()
  }

  disableProgress () {
    if (!this.progressEnabled) {
      return
    }

    this.progressEnabled = false
    this.tracker.removeListener('change', this.showProgress)
    this.gauge.disable()
  }

  newGroup (groupname, weight) {
    return this.#mixingLog(
      this.tracker.newGroup(groupname, weight)
    )
  }

  newItem (name, todo, weight) {
    return this.#mixingLog(
      this.tracker.newItem(name, todo, weight)
    )
  }

  newStream (name, todo, weight) {
    return this.#mixingLog(
      this.tracker.newStream(name, todo, weight)
    )
  }

  #mixingLog (tracker) {
    // mixin the public methods from log into the tracker
    // (except: conflicts and one's we handle specially)
    Object.keys(this).forEach((P) => {
      if (P[0] === '_') {
        return
      }

      if (trackerConstructors.filter(function (C) {
        return C === P
      }).length) {
        return
      }

      if (tracker[P]) {
        return
      }

      if (typeof this[P] !== 'function') {
        return
      }

      var func = this[P]
      tracker[P] = (...args) => {
        return func.apply(this, args)
      }
    })

    const Progress = require('are-we-there-yet')
    // if the new tracker is a group, make sure any subtrackers get
    // mixed in too
    if (tracker instanceof Progress.TrackerGroup) {
      trackerConstructors.forEach((C) => {
        var func = tracker[C]
        tracker[C] = (...args) => {
          return this.#mixingLog(func.apply(tracker, args))
        }
      })
    }

    return tracker
  }

  clearProgress (cb) {
    if (!this.progressEnabled) {
      return cb && process.nextTick(cb)
    }

    this.gauge.hide(cb)
  }

  showProgress (name, completed) {
    if (!this.progressEnabled) {
      return
    }

    var values = {}
    if (name) {
      values.section = name
    }

    var last = this.record[this.record.length - 1]
    if (last) {
      values.subsection = last.prefix
      var disp = this.disp[last.level]
      var logline = this._format(disp, this.style[last.level])
      if (last.prefix) {
        logline += ' ' + this._format(last.prefix, this.prefixStyle)
      }

      logline += ' ' + last.message.split(/\r?\n/)[0]
      values.logline = logline
    }
    values.completed = completed || this.tracker.completed()
    this.gauge.show(values)
  }

  pause () {
    this._paused = true
    if (this.progressEnabled) {
      this.gauge.disable()
    }
  }

  resume () {
    if (!this._paused) {
      return
    }

    this._paused = false

    var b = this._buffer
    this._buffer = []

    b.forEach(function (m) {
      this.emitLog(m)
    }, this)

    if (this.progressEnabled) {
      this.gauge.enable()
    }
  }

  log (lvl, prefix, ...args) {
    var l = this.levels[lvl]
    if (l === undefined) {
      return this.emit('error', new Error(util.format(
        'Undefined log level: %j', lvl)))
    }

    var message = args[2]
    var stack = null
    for (var i = 0; i < args.length; i++) {
      var arg = args[i]

      // resolve stack traces to a plain string.
      if (typeof arg === 'object' && arg instanceof Error && arg.stack) {
        Object.defineProperty(arg, 'stack', {
          value: stack = arg.stack + '',
          enumerable: true,
          writable: true,
        })
      }
    }
    if (stack) {
      args.unshift(stack + '\n')
    }
    message = util.format.apply(util, args)

    var m = {
      id: this.#id++,
      level: lvl,
      prefix: String(prefix || ''),
      message: message,
      messageRaw: args,
    }

    this.emit('log', m)
    this.emit('log.' + lvl, m)
    if (m.prefix) {
      this.emit(m.prefix, m)
    }

    this.record.push(m)
    var mrs = this.maxRecordSize
    var n = this.record.length - mrs
    if (n > mrs / 10) {
      var newSize = Math.floor(mrs * 0.9)
      this.record = this.record.slice(-1 * newSize)
    }

    this.emitLog(m)
  }

  emitLog (m) {
    if (this._paused) {
      this._buffer.push(m)
      return
    }
    if (this.progressEnabled) {
      this.gauge.pulse(m.prefix)
    }

    var l = this.levels[m.level]
    if (l === undefined) {
      return
    }

    if (l < this.levels[this.level]) {
      return
    }

    if (l > 0 && !isFinite(l)) {
      return
    }

    // If 'disp' is null or undefined, use the lvl as a default
    // Allows: '', 0 as valid disp
    var disp = this.disp[m.level]
    this.clearProgress()
    m.message.split(/\r?\n/).forEach((line) => {
      var heading = this.heading
      if (heading) {
        this.write(heading, this.headingStyle)
        this.write(' ')
      }
      this.write(disp, this.style[m.level])
      var p = m.prefix || ''
      if (p) {
        this.write(' ')
      }

      this.write(p, this.prefixStyle)
      this.write(' ' + line + '\n')
    })
    this.showProgress()
  }

  _format (msg, style) {
    if (!this.#stream) {
      return
    }

    var output = ''
    if (this.useColor()) {
      style = style || {}
      var settings = []
      if (style.fg) {
        settings.push(style.fg)
      }

      if (style.bg) {
        settings.push('bg' + style.bg[0].toUpperCase() + style.bg.slice(1))
      }

      if (style.bold) {
        settings.push('bold')
      }

      if (style.underline) {
        settings.push('underline')
      }

      if (style.inverse) {
        settings.push('inverse')
      }

      if (settings.length) {
        output += consoleControl.color(settings)
      }

      if (style.beep) {
        output += consoleControl.beep()
      }
    }
    output += msg
    if (this.useColor()) {
      output += consoleControl.color('reset')
    }

    return output
  }

  write (msg, style) {
    if (!this.#stream) {
      return
    }

    this.#stream.write(this._format(msg, style))
  }

  addLevel (lvl, n, style, disp) {
    // If 'disp' is null or undefined, use the lvl as a default
    if (disp == null) {
      disp = lvl
    }

    this.levels[lvl] = n
    this.style[lvl] = style

    if (!this[lvl]) {
      this[lvl] = (...args) => {
        args.unshift(lvl)

        return this.log.apply(this, args)
      }
    }
    this.disp[lvl] = disp
  }
}

module.exports = new Log()
