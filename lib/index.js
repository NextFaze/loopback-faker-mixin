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
module.exports.call = function (defaults) {
  return Object.keys(defaults).map(key => {
    return {
      [key]: defauls[key]()
    }
  }).reduce((a, b) => Object.assign({}, a, b))
}

