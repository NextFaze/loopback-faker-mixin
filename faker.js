'use strict'
/**
 * loopback-mixin-faker
 * add faker key to properties in model.json to get fake data for your life pass in an object to
 * override any properties
 * {
 * properties: {
 *  fakeMe: {
 *  type: string,
 *  faker: 'faker.method' see https://github.com/marak/Faker.js/
 * }
 * }
 * mixins: {
 *    Faker: {
 *        fakeMe: 'faker.method' properties will be overridden here if faker key in properties options
 * }
 * }
 * }
*/
var faker = require('faker')
module.exports = function (Model, options) {
  if (options === void 0) { options = {} }
  Model.forEachProperty(function (key, val) {
    if (Object.keys(val).indexOf('faker') > -1) {
      options[key] = val['faker']
    }
  })
  Model.faker = function (defaults) {
    if (defaults === void 0) { defaults = {} }
    return function (options) {
      var a = {}
      for (var x in defaults)
        a[x] = faker.fake('{{' + defaults[x] + '}}')
      return this.create(Object.assign({}, a, options))
    }
  }(options)
}
