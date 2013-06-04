"use strict"

var through = require('through')
var fs = require('fs')
var html = fs.readFileSync(__dirname + '/template.html');

module.exports = function(heading) {
  var el = toElement(html)
  el.querySelector('.title').innerText = heading

  el.querySelector('[data-action=hide]').addEventListener('click', function(e) {
    e.preventDefault()
    stream.hide(el)
  })

  var stream = through(function(msg) {
    if (msg.message) msg = msg.message
    var item = document.createElement('span')
    item.innerHTML = msg
    el.querySelector('.messages').appendChild(item)
    if (stream.visible) {
      el.querySelector('.messages').scrollTop = el.querySelector('.messages').scrollHeight
    }
    this.push(msg)
  })

  stream.hide = function() {
    el.classList.remove('visible')
    setTimeout(function() {
      stream.emit('hide')
    }, 300)
    this.visible = false
  }

  stream.show = function() {
    this.emit('show')
    el.style.display = 'block'
    el.classList.add('visible')
    this.visible = true
  }

  stream.toggle = function() {
    this.visible
      ? stream.hide()
      : stream.show()
  }
  stream.clear = function() {
    el.querySelector('.messages').innerHTML = ''
  }

  stream.el = el
  return stream
}

function toElement(html) {
  var dummy = document.createElement('div') // dummy div
  dummy.innerHTML = html
  return dummy.firstChild // extract real element
}
