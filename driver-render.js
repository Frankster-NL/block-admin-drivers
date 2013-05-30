var hyperspace = require('hyperspace');
var fs = require('fs');
var driverHtml = fs.readFileSync(__dirname + '/public/driver.html')

module.exports = function() {
  return hyperspace(driverHtml, function(driver) {
    return {
      '.driver-name': driver.name,
      '.driver-description': driver.description,
      '.driver-author': driver.author,
      '.driver-action a': {
        href: '#' + driver.name,
        "data-action": getAction(driver.status).toLowerCase(),
        "data-name": driver.name,
        "data-url": driver.url,
        _text: getAction(driver.status)
      }
    }
  })
}

function getAction(status) {
  switch(status) {
    case 'Installed':
      return 'Uninstall'
    case 'Installing':
      return 'Cancel'
    default:
      return 'Install'
  }
}
