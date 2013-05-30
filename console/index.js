"use strict"

var through = require('through')
var fs = require('fs')
var html = fs.readFileSync(__dirname + '/template.html');

module.exports = function(template) {
  var el = toElement(html || template)
  el.querySelector('[data-action=hide]').addEventListener('click', function(e) {
    e.preventDefault()
    stream.hide(el)
  })

  var stream = through(function(msg) {
    if (msg.message) msg = msg.message
    var item = document.createElement('span')
    item.innerHTML = msg
    el.querySelector('.messages').appendChild(item)
    this.push(msg)
  })

  stream.hide = function() {
    el.classList.remove('visible')
    setTimeout(function() {
      el.style.display = 'none'
    }, 300)
    this.visible = false
  }

  stream.show = function() {
    el.style.display = 'block'
    el.classList.add('visible')
    this.visible = true
  }

  stream.toggle = function() {
    if (!this.visible) return stream.show()
    if (this.visible) return stream.hide()
  }

  stream.el = el
  return stream
}

function toElement(html) {
  var dummy = document.createElement('div') // dummy div
  dummy.innerHTML = html
  return dummy.firstChild // extract real element
}
