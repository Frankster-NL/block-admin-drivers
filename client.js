"use strict"

var MuxDemux = require('mux-demux')
var through = require('through');
var shoe = require('reconnect/shoe')
var fs = require('fs');
var Debug = require('debug/debug.js')
window.debug = Debug
var debug = Debug('driver-install')
var LogConsole = require('./console/index')

shoe(function(stream) {
  var mx = MuxDemux()
  mx.pipe(stream).pipe(mx)

  mx.on('connection', function(stream) {
    debug('Connected', stream.meta)
    if (stream.meta === 'drivers') {
      stream.pipe(displayDrivers(mx))
    }
  })
}).connect('/driver-admin')
.on('connect', function() {
  debug('connected')
}).on('disconnect', function(err) {
  var message = err || ''
  if (err && err.message) message = err.message
  debug('disconnected', message)
}).on('reconnect', function(attempts, timeout) {
  attempts++
  debug('attempting reconnection %d after %dms', attempts, timeout)
})

// TODO tidy this up. just don't look at it.
var displayDrivers = function(mx) {
  return through(function(driver) {
    var table = document.getElementById('drivers');
    var body = table.querySelector('tbody')
    var tr = document.createElement('tr')
    tr.innerHTML = [
      '<td>'+driver.name+'</td>',
      '<td>'+driver.description+'</td>',
      '<td>'+driver.author+'</td>',
      '<td>',
        '<a href="#" data-url="'+(driver.url || driver.github_url)+'"><span class="status">Install</span></a>',
      '</td>',
    ].join('\n')
    var link = tr.querySelector('a[data-url]')
    link.addEventListener('click', function(e) {
      e.preventDefault()
      status("Installing")

      var url = link.getAttribute('data-url')
      var logs = mx.createStream({command: 'install', url: url})
      var logConsole = LogConsole()
      logs.pipe(logConsole).pipe(findStatus(status))
      function findStatus(status) {
        return through(function(line) {
          if (line.match(/Installation Failed/gi)) status("Failed")
          if (line.match(/Installation Success/gi)) status("Installed")
        })
      }
      if (link.logConsole) return
      link.logConsole = true
      document.body.appendChild(logConsole.el)
      function status(msg) {
        link.querySelector('.status').innerText = msg
      }
      var moreInfo = document.createElement('button')
      moreInfo.className = 'moreInfo'
      moreInfo.innerHTML = 'log'
      link.appendChild(moreInfo)

      moreInfo.addEventListener('click', function(e) {
        e.preventDefault()
        logConsole.toggle()
      })
    })
    table.appendChild(tr)
  })
}
