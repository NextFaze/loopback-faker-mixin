'use strict'
/**
 * loopback-mixin-faker
 * add faker key to properties in model.json to get fake data for your life pass in an object to
 * override any properties
 * {
 * properties: {
 *  fakeMe: {
 *  type: string,
 *  faker: 'faker.method' see https://github.com/marak/Faker.js/ || { method: 'faker.method', args: ['arg1']}
 * }
 * }
 * mixins: {
 *    Faker: {
 *        fakeMe: 'faker.method' properties will be overridden in the options if faker key is set in properties
 * }
 * }
 * }
*/
var faker = require('faker')
var FakerMixin = require('./lib').FakerMixin
var BulkFaker = require('./lib').BulkFaker
module.exports = function (Model, options) {
  let a = new FakerMixin(Model, faker, options).init()
  Model.faker = function (defaults) {
      return function (obj) {
        let a = BulkFaker.callDefaults(defaults)
        return this.create(Object.assign({}, a, obj))
    }
  }(a)

  Model.bulkFaker = function (defaults) {
    return function (obj, options) {
      let a = new BulkFaker(defaults, obj.globals, obj.individuals, options)
      let b = a.bulkCreate()
      return new Promise((resolve, reject) => {
        this.create(b, (err, data) => {
          if (err) return reject(err)
          return resolve(data)
        })
      })
    }
  }(a)
}
