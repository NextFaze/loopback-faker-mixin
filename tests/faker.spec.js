'use strict'
const chai = require('chai')
chai.use(require('chai-spies'))
const expect = chai.expect
const assert = chai.assert
const moment = require('moment')
const Mixin = require('../lib')
const FakerMixin = Mixin.FakerMixin
const BulkFaker = Mixin.BulkFaker

const mockFaker = {
  name: {
    firstName: function () {},
    takesOneArg: function (arg) {}
  }
}
const mockOptions = {
  name1: 'name.firstName',
  password1: {
    method: 'name.takesOneArg',
    args: [1]
  }
}
const MockModel = {
  forEachProperty: function (b) {
    const a = {
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
const MockModelMoment = {
  forEachProperty: function (b) {
    const a = {
      date: {
        source: 'moment',
        construct: true,
        method: 'add',
        args: ['1', 'week'],
        format: 'DD/MM/YYYY'
      }
    }
    Object.keys(a).forEach((key) => {
      b(key, a[key])
    })
  }
}
class MockMoment {
  constructor(date = '1/2/3456') {
    this.add = chai.spy(() => this.date = '2/3/4567')
    this.format = chai.spy(() => this.date)
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
})
describe('custom sources', () => {
  it('should work with arbitrary module sources', () => {
    let a = new FakerMixin(MockModelMoment, mockFaker, {
      amount: {
        source: '../tests/mock-module',
        method: 'number'
      },
      color: {
        source: '../tests/mock-module',
        method: 'color'
      }
    }).init()
    let b = BulkFaker.callDefaults(a)
    var expected = moment().add(1, 'week').format('DD/MM/YYYY')
    expect(b).to.eql({
      amount: 4,
      color: '#FFFFFF'
    })
  })
  it('should work with a custom source that must be constructed', () => {
    let a = new FakerMixin(MockModelMoment, mockFaker, {date: {
        source: '../tests/mock-moment',
        construct: true,
        method: 'format',
        args: ['Number: %']
    }}).init()
    let b = BulkFaker.callDefaults(a)
    expect(b).to.eql({
      date: 'Number: 1'
    })
  })
  it('should allow chaining multiple arguments constructed', () => {
    let a = new FakerMixin(MockModelMoment, mockFaker, {date: {
        source: '../tests/mock-moment',
        construct: true,
        method: 'add',
        args: [1, 'week'],
        then: {
          method: 'format',
          args: ['No %']
        }
    }}).init()
    let b = BulkFaker.callDefaults(a)
    expect(b).to.eql({
      date: 'No 2'
    })
  })
  it('should chain all the things', () => {
    let a = new FakerMixin(MockModelMoment, mockFaker, {date: {
        source: '../tests/mock-moment',
        construct: true,
        method: 'add',
        args: [1, 'week'],
        then: {
          method: 'add',
          args: [1, 'week'],
          then: {
            method: 'format',
            args: ['No %']
          }
        }
    }}).init()
    let b = BulkFaker.callDefaults(a)
    expect(b).to.eql({
      date: 'No 3'
    })
  })

  it('should call on a new instance of the module each time', () => {
    let a = new FakerMixin(MockModelMoment, mockFaker, {date: {
        source: '../tests/mock-moment',
        construct: true,
        method: 'add',
        args: [1, 'week'],
        then: {
          method: 'format',
          args: ['No %']
        }
    }}).init()
    let b = BulkFaker.callDefaults(a)
    let c = BulkFaker.callDefaults(a)
    expect(b).to.eql({
      date: 'No 2'
    })
    expect(c).to.eql({
      date: 'No 2'
    })
  })
})