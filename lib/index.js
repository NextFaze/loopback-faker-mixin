'use strict'
module.exports.FakerMixin = class FakerMixin {
  constructor (Model, faker, options) {
    this.Model = Model
    this.faker = faker
    this.options = options
    this.hydrateSources()
  }
  init () {
    let defaults = this.initParse()
    return Object.assign({}, this.hydrateDefaults(this.options || {}), this.hydrateDefaults(defaults))
  }
  hydrateSources () {
    Object.keys(this.options)
      .filter(key => !!this.options[key].source)
      .map(key => {
        const source = this.options[key].source
        try {
          this[source] = require(source)
        } catch(ex) {
          throw new Error(`Require of ${source} failed - is the dependency installed?`)
        }
      })
  }
  hydrateDefaults (defaults) {
    return Object.keys(defaults).map(key => {
      const source = defaults[key].source || 'faker'
      if (typeof defaults[key] === 'string') {
        return {[key]: this.getFunc(defaults[key], source)}
      } else {
        const construct = defaults[key].construct
        return {[key]: () => (this.bindArgs(this.getFunc(defaults[key].method, source, construct), defaults[key].args, defaults[key].method, defaults[key].then))()}
      }
    }).reduce((a, b) => Object.assign({}, a, b), {})
  }
  getFunc (key, source, construct) {
    try {
      let method = key.split('.').reduce((a, b) => construct ? a[b].bind(a) : a[b], (construct ? this[source]() : this[source]))
      if(typeof method !== 'function') {
        throw new Error('Not a function')
      }
      return method
    } catch (err) {
      throw new Error(`${key} does not exist on ${source}`)
    }
  }
  bindArgs (func, val, thisarg, then) {
    if(then && then.method) {
      return () => {
        let chain = func.call(thisarg, ...val)
        return this.bindArgs(chain[then.method], then.args, chain, then.then)()
      }
    }
    if (func.length > 0 && val instanceof Array) return func.bind(thisarg, ...val)
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
