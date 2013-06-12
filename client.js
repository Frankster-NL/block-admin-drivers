"use strict"

var MuxDemux = require('mux-demux')
var through = require('through');
var shoe = require('reconnect/shoe')
var fs = require('fs');
var Debug = require('debug/debug.js')
window.debug = Debug
var debug = Debug('driver-admin')
var LogConsole = require('./console/index')
var hyperstream = require('hyperstream')
var concat = require('concat-stream')

shoe(function(stream) {
  var mx = MuxDemux()
  mx.pipe(stream).pipe(mx)

  mx.on('connection', function(stream) {
    debug('Connected', stream.meta)
  })
  function handleAction() {
    return function(e) {
      var trigger = e.currentTarget
      e.preventDefault()
      var command = trigger.getAttribute('data-action')
      var args = trigger.getAttribute('href')
      .slice(1) // strip leading #
      .split(' ')

      commands[command].apply(null, [trigger].concat(args))
    }
  }

  var commands = {}
  // TODO Don't repeat yourself across
  // install/uninstall
  commands.install = function(el, args) {
    var url = el.getAttribute('data-url')
    var logs = mx.createStream({command: 'install', url: url})

    if (el.logConsole && document.body.contains(el.logConsole.el)) {
      document.body.removeChild(el.logConsole.el)
    }

    el.logConsole = LogConsole('Installing ' + el.getAttribute('data-name'))

    el.logConsole.on('hide', function() {
      document.body.style.overflow = 'auto';
      document.body.removeChild(el.logConsole.el)
    })
    el.logConsole.on('show', function() {
      document.body.style.overflow = 'hidden';
      el.logConsole.el.style.top = window.pageYOffset
      document.body.appendChild(el.logConsole.el)
    })

    el.setAttribute('data-action', 'showlog')
    el.innerText = "Connecting..."
    logs.on('data', function() {el.innerText = "Installing..."})
    logs.pipe(el.logConsole).pipe(concat(function(data) {
      if (data.match(/Success\!/gi)) {
        el.innerText = "Uninstall"
        el.setAttribute('data-action', 'uninstall')
      } else {
        el.innerText = "Failed"
      }
    }))
  }
  commands.uninstall = function(el, url) {
    var url = el.getAttribute('data-name')
    var logs = mx.createStream({command: 'uninstall', url: url})

    if (el.logConsole && document.body.contains(el.logConsole.el)) {
      document.body.removeChild(el.logConsole.el)
    }
    el.logConsole = LogConsole('Uninstalling ' +  url)
    el.logConsole.on('hide', function() {
      document.body.style.overflow = 'auto';
      document.body.removeChild(el.logConsole.el)
    })
    el.logConsole.on('show', function() {
      document.body.style.overflow = 'hidden';
      el.logConsole.el.style.top = window.pageYOffset
      document.body.appendChild(el.logConsole.el)
    })

    el.innerText = "Connecting..."
    logs.on('data', function() {
      el.innerText = "Uninstalling..."
    })
    logs.pipe(el.logConsole).pipe(concat(function(data) {
      if (data.match(/Success\!/gi)) {
        el.innerText = "Install"
        el.setAttribute('data-action', 'install')
      } else {
        el.innerText = "Failed"
      }
    }))
  }
  commands.showlog = function(el, url) {
    el.logConsole.show()
  }

  var triggers = [].slice.apply(document.querySelectorAll('[data-action]'))
  triggers.forEach(function(trigger) {
    trigger.addEventListener('click', handleAction())
  })
}).connect('/driver-admin')
.on('connect', function() {
  Debug('connection')('connected')
}).on('disconnect', function(err) {
  var message = err || ''
  if (err && err.message) message = err.message
  Debug('connection')('disconnected', message)
}).on('reconnect', function(attempts, timeout) {
  attempts++
  Debug('connection')('attempting reconnection %d after %dms', attempts, timeout)
})
