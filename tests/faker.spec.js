'use strict'
let expect = require('chai').expect
let assert = require('chai').assert
let FakerMixin = require('../lib').FakerMixin
let BulkFaker = require('../lib').BulkFaker

let mockFaker = {
  name: {
    firstName: function () {},
    takesOneArg: function (arg) {}
  }
}
let mockOptions = {
  name1: 'name.firstName',
  password1: {
    method: 'name.takesOneArg',
    args: [1]
  }
}
let MockModel = {
  forEachProperty: function (b) {
    let a = {
      name: {
        type: 'String',
        faker: 'name.firstName'
      },
      password: {
        type: 'String',
        faker: {
          method: 'name.takesOneArg',
          args: [1]
        }
      },
      description: {
        type: 'Number'
      }
    }
    Object.keys(a).forEach((key) => {
      b(key, a[key])
    })
  }
}

describe('should take faker and apply arguments', () => {
  it('should call a faker method', () => {
    let a = new FakerMixin(MockModel, mockFaker, mockOptions)
    expect(a.init()).to.have.all.keys('name', 'password', 'name1', 'password1')
    expect(a.init()).to.not.have.keys('description')
  })
})

describe('bulk faker should create bulk fakers', () => {
  it('should create a whole heap fake objects', () => {
    let a = new FakerMixin(MockModel, mockFaker, mockOptions)
    let defaults = a.init()
    let attributes = [{
      name: 'name',
      password: 'password'
    }]
    let options = 10
    let c = new BulkFaker(defaults, {}, attributes, options)
    let d = c.bulkCreate()
    assert.lengthOf(d, 10)
    expect(d[0].name).to.eql('name')
    expect(d[0].password).to.eql('password')
  })
})
describe('bulk faker without arguments', () => {
  it('should create a whole heap fake objects', () => {
    let c = new BulkFaker()
    let d = c.bulkCreate()
    assert.lengthOf(d, 0)
  })
})
describe('invalid arguments', () => {
  it('should should throw an error if the argument passed is not a function', () => {
    let a = new FakerMixin(MockModel, { company: { name: false } }, { name: 'company.name' })
    expect(a.init.bind(a)).to.throw('company.name does not exist on faker')
  })
});