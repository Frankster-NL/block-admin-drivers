"use strict"

var MuxDemux = require('mux-demux')
var through = require('through');
var shoe = require('reconnect/shoe')
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/public/console.html');
var Debug = require('debug/debug.js')
window.debug = Debug
var debug = Debug('driver-install')

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
      if (link.consoleEl) return
      var consoleEl = document.createElement('pre')
      link.consoleEl = consoleEl
      consoleEl.innerHTML = html
      consoleEl.className = 'console'
      consoleEl.querySelector('.buttonHide').addEventListener('click', function(e) {
        e.preventDefault()
        hide(consoleEl)
      })
      document.body.appendChild(consoleEl)
      function status(msg) {
        link.querySelector('.status').innerText = msg
      }
      var moreInfo = document.createElement('button')
      moreInfo.className = 'moreInfo'
      moreInfo.innerHTML = 'log'
      link.appendChild(moreInfo)

      moreInfo.addEventListener('click', function(e) {
        e.preventDefault()
        var style = getComputedStyle(consoleEl)
        if (style.opacity == 0) {
          show(consoleEl)
        } else if (style.opacity == 1) {
          hide(consoleEl)
        }
      })


      var url = link.getAttribute('data-url')
      var logs = mx.createStream({command: 'install', url: url})
      logs.pipe(through(function(message) {
        log(consoleEl, message)
        this.emit('data', message)
      })).pipe(findStatus(status))
      function findStatus(status) {
        return through(function(line) {
          if (line.match(/Installation Failed/gi)) status("Failed")
          if (line.match(/Installation Success/gi)) status("Installed")
        })
      }
    })
    table.appendChild(tr)
  })

}

function hide(el) {
  el.classList.remove('visible')
  setTimeout(function() {
    el.style.display = 'none'
  }, 300)
}

function show(el) {
  el.style.display = 'block'
  el.classList.add('visible')
}

window.addEventListener('keydown', function(e) {
  if (e.keyCode === 27) { // esc
    
  }
})

function log(el, msg) {
  if (msg.message) msg = msg.message
  var item = document.createElement('span')
  item.innerHTML = msg
  el.appendChild(item)
}

log.error = function(message) {
  // TODO colorize or something
  return log(message)
}
