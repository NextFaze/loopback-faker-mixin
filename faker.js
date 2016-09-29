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
var FakerMixin = require('./lib').FakerMixin
var BulkCreate = require('./lib').BulkCreate
module.exports = function (Model, options) {
  let a = new FakerMixin(Model, faker, options)
  Model.faker = function (defaults) {
      return function (obj) {
        let a = FakerMixin.callDefaults(defaults)
        return this.create(Object.assign({}, a, obj))
    }
  }(a)

  Model.bulkFaker = function (defaults) {
    return function (obj, options) {
      let a = new BulkCreate(defaults, obj.globals, obj.individuals, options)
      return new Promise((resolve, reject) => {
        this.bulkCreate(a, (err, data) => {
          if (err) return reject(err)
          return resolve(data)
        })
      })
    }
  }(a)
}
