"use strict"

var MuxDemux = require('mux-demux')
var through = require('through');
var shoe = require('reconnect/shoe')
var fs = require('fs');
var Debug = require('debug/debug.js')
window.debug = Debug
var debug = Debug('driver-install')
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

    if (el.logConsole) {
      document.body.removeChild(el.logConsole.el)
    }

    el.logConsole = LogConsole()
    document.body.appendChild(el.logConsole.el)
    el.innerText = "Installing..."
    el.setAttribute('data-action', 'showlog')
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
    if (el.logConsole) {
      document.body.removeChild(el.logConsole.el)
    }
    el.logConsole = LogConsole()
    document.body.appendChild(el.logConsole.el)
    el.innerText = "Uninstalling..."
    el.setAttribute('data-action', 'showlog')
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
  debug('connected')
}).on('disconnect', function(err) {
  var message = err || ''
  if (err && err.message) message = err.message
  debug('disconnected', message)
}).on('reconnect', function(attempts, timeout) {
  attempts++
  debug('attempting reconnection %d after %dms', attempts, timeout)
})

//// TODO tidy this up. just don't look at it.
//// oh god it's growing.
//var displayDrivers = function(mx) {
  //return through(function(driver) {
    //var table = document.getElementById('drivers');
    //var body = table.querySelector('tbody')
    //var tr = document.createElement('tr')
    //var elHtml = [
      //'<td>'+driver.name+'</td>',
      //'<td>'+driver.description+'</td>',
      //'<td>'+driver.author+'</td>',
    //].join('\n')
    //if (driver.installed) {
      //elHtml += [
        //'<td>',
          //'<a data-action="uninstall" href="#'+(driver.name)+'"><span class="status">Uninstall</span></a>',
        //'</td>'
      //].join('\n')
    //} else {
      //elHtml += [
        //'<td>',
          //'<a data-action="install" href="#'+(driver.url || driver.github_url)+'"><span class="status">Install</span></a>',
        //'</td>'
      //].join('\n')
    //}
    //tr.innerHTML = elHtml
    //var trigger = tr.querySelector('a[data-action]')
    //trigger.addEventListener('click', handleAction())
    //table.appendChild(tr)
  //})
//}





      //e.preventDefault()
      //var url = 
      //status("Installing")
      //function findStatus(status) {
        //var last = ''
        //return through(function(line) {
          //if (line) last = line
          //this.push(line)
        //}, function() {
          //var statusCode = last[last.length - 1]
          //if (statusCode !== '0') {
            //status("Failed")
          //} else {
            //status("Uninstall")
          //}
          //this.end()
        //})
      //}
      //if (trigger.logConsole) return
      //trigger.logConsole = true
      //document.body.appendChild(logConsole.el)
      //function status(msg) {
        //trigger.querySelector('.status').innerText = msg
      //}
      //var moreInfo = document.createElement('button')
      //moreInfo.className = 'moreInfo'
      //moreInfo.innerHTML = 'log'
      //trigger.appendChild(moreInfo)

      //moreInfo.addEventListener('click', function(e) {
        //e.preventDefault()
        //logConsole.toggle()
      //})

