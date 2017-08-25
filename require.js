window.require = (function (modules) {
  var URL = 'https://wizardamigos-browserify-cdn.herokuapp.com/multi'
  function init (name, _module) {
    var se = document.createElement('script')
    var module = JSON.parse(_module)[name]
    se.text = module.bundle
    document.head.appendChild(se)
    document.head.removeChild(se)
    module.exports = window.require(name)
    window.require = require
    return modules[name] = module
  }
  function require (name, version) {
    var module = modules[name]
    if (module) {
      if (version) console.error('using cached version "' + module.package.version + '" of "' + name + '"')
      return module.exports
    }
    version = version || 'latest'
    var modulename = name + '@' + version + ':' + location.host
    var _module = localStorage[modulename]
    if (version === 'latest' && _module) {
       var module = JSON.parse(_module)[name]
       var oldstamp = module.timestamp
       var newstamp = +new Date()
       var age = (newstamp - oldstamp) / (1000*3600)
       if (age > 24) _module = module = null
       else return init(name, _module).exports
    }
    if (!_module) {
      var xhr = new XMLHttpRequest()
      xhr.open('POST', URL, false)
      var data = { dependencies: { } }
      data.dependencies[name] = version
      xhr.send(JSON.stringify(data))
      _module = xhr.responseText
      module = JSON.parse(_module)[name]
      module.timestamp = +new Date()
      var m = {}
      m[name] = module
      _module = JSON.stringify(m)
      localStorage[modulename] = _module
      if (version === 'latest') {
        version = module.package.version
        modulename = name + '@' + version + ':' + location.host
        localStorage[modulename] = _module
      }
      console.log('caching version "' + version + '" of "' + name + '" for one day')
    }
    return init(name, _module).exports
  }
  require.cache = modules
  return require
})({})
