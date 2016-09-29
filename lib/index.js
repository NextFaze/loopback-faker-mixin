'use-strict'
module.exports.FakerMixin = class FakerMixin {
  constructor (Model, faker, options) {
    this.Model = Model
    this.faker = faker
    this.options = options
  }
  init () {
    let defaults = this.initParse()
    return Object.assign({}, this.hydrateDefaults(this.options || {}), this.hydrateDefaults(defaults))
  }
  hydrateDefaults (defaults) {
    return Object.keys(defaults).map(key => {
      if (typeof defaults[key] === 'string') return {[key]: this.getFakerFunc(defaults[key])}
      else return {[key]: this.bindArgs(this.getFakerFunc(defaults[key].method), defaults[key].args)}
    }).reduce((a, b) => Object.assign({}, a, b), {})
  }
  getFakerFunc (key) {
    try {
      return key.split('.').reduce((a, b) => a[b], this.faker)
    } catch (err) {
      throw new Error(`${key} does not exist on faker`)
    }
  }
  bindArgs (func, val) {
    if (func.length > 0 && val instanceof Array) return func.bind({}, val)
    return func
  }
  parse (key, val, lib) {
    if (Object.keys(val).indexOf(lib) > -1) {
      return {[key]: val[lib]}
    }
    return {}
  }
  initParse () {
    let a = []
    this.Model.forEachProperty((key, val) => {
      a.push(this.parse(key, val, 'faker'))
    })
    return a.reduce((a, b) => Object.assign(a, b), {})
  }
}
module.exports.faker = function (defaults) {
  return function (options) {
    let opts = Object.assign({}, module.exports.call(defaults), options)
    return this.create(opts)
  }
}
module.exports.callDefaults = function (defaults) {
  return Object.keys(defaults).map(key => {
    return {
      [key]: defaults[key]()
    }
  }).reduce((a, b) => Object.assign({}, a, b))
}
module.exports.bulkFaker = function (defaults) {
  return function (attributes, options) {
    attributes.map(attribute => {})
  }
}

module.exports.BulkFaker = class BulkFaker {
  static callDefaults (defaults) {
    return Object.keys(defaults).map(key => {
      return {
        [key]: defaults[key]()
      }
    }).reduce((a, b) => Object.assign({}, a, b))
  }
  constructor (defaults, globals, individuals, options) {
    this.defaults = defaults || {}
    this.globals = globals || {}
    this.individuals = individuals || []
    this.options = options || this.individuals.length
  }
  bulkCreate () {
    if (!(this.individuals instanceof Array)) throw new Error('bulkCreate faker expects an array')
    let _defaults = this.bulkCreateSetDefults(this.defaults, this.options)
    let _globals = this.bulkCreateSetGlobals(_defaults, this.globals)
    let _individuals = this.bulkCreateSetIndividual(_globals, this.individuals)
    return _individuals
  }
  bulkCreateSetDefults (defaults, options) {
    let a = []
    for (let x = 0; x < options; x++) {
      a.push(BulkFaker.callDefaults(defaults))
    }
    return a
  }
  bulkCreateSetIndividual (defaults, attributes) {
    if (!(attributes instanceof Array)) throw new Error('bulkCreate faker expects an array')
    for (let x = 0; x < attributes.length; x++) {
      defaults[x] = Object.assign({}, defaults[x], attributes[x])
    }
    return defaults
  }
  bulkCreateSetGlobals (defaults, globals) {
    return defaults.map(def => Object.assign({}, def, globals))
  }
}
