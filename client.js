"use strict"

var rpc = require('rpc-stream')
var MuxDemux = require('mux-demux')
var shoe = require('shoe');
var through = require('through');
var xhr = require('xhr')

var client = rpc()
var remote = client.wrap(['install'])


var stream = shoe('/driver-install');
var mx = MuxDemux()
mx.pipe(stream).pipe(mx)

function log(msg) {
  if (msg.message) msg = msg.message
  var result = document.getElementById('console');
  var item = document.createElement('span')
  item.innerHTML = item
  result.appendChild(item)
}

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

var displayDrivers = through(function(driver) {
  var table = document.getElementById('drivers');
  var body = table.querySelector('tbody')
  var tr = document.createElement('tr')
  tr.innerHTML = [
    '<td>'+driver.name+'</td>',
    '<td>'+driver.description+'</td>',
    '<td>'+driver.author+'</td>',
    '<td><a href="#" data-url="'+driver.repository_url+'">Install</td>',
  ].join('\n')
  var link = tr.querySelector('a[data-url]')
  link.addEventListener('click', function(e) {
    e.preventDefault()
    var url = link.getAttribute('data-url')
    remote.install(url, function(err, message) {
      log(err || message)
    })
  })
  table.appendChild(tr)
})
