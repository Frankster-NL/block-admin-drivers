"use strict"

var rpc = require('rpc-stream')
var MuxDemux = require('mux-demux')
var through = require('through');
var shoe = require('reconnect/shoe')

var client = rpc()
var remote = client.wrap(['install'])

function log(msg) {
  if (msg.message) msg = msg.message
  var result = document.getElementById('console');
  var item = document.createElement('span')
  item.innerHTML = msg
  result.appendChild(item)
}

log.error = function(message) {
  // TODO colorize or something
  return log(message)
}

shoe(function(stream) {
  var mx = MuxDemux()
  mx.pipe(stream).pipe(mx)

  mx.on('connection', function(stream) {
    console.log('Connected', stream.meta)
    if (stream.meta === 'log') {
      stream.pipe(through(function(message) {
        log(message)
      }))
    }
    if (stream.meta === 'rpc') {
      stream.pipe(client).pipe(stream)
    }
    if (stream.meta === 'drivers') {
      stream.pipe(displayDrivers)
    }
  })
}).connect('/driver-admin')
.on('connect', function() {
  console.log('connected')
}).on('disconnect', function(err) {
  var message = err || 'No disconneciton error.'
  if (err && err.message) message = err.message
  console.log('disconnected', message)
}).on('reconnect', function(attempts, timeout) {
  attempts++
  console.log('attempting reconnection %d after %dms', attempts, timeout)
})


var displayDrivers = through(function(driver) {
  var table = document.getElementById('drivers');
  var body = table.querySelector('tbody')
  var tr = document.createElement('tr')
  tr.innerHTML = [
    '<td>'+driver.name+'</td>',
    '<td>'+driver.description+'</td>',
    '<td>'+driver.author+'</td>',
    '<td><a href="#" data-url="'+(driver.url || driver.github_url)+'">Install</td>',
  ].join('\n')
  var link = tr.querySelector('a[data-url]')
  link.addEventListener('click', function(e) {
    e.preventDefault()
    var url = link.getAttribute('data-url')
    remote.install(url, function(err, message) {
      if (err) return log.error(message)
      log(message)
    })
  })
  table.appendChild(tr)
})
