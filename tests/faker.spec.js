'use-strict'
let expect = require('chai').expect
let FakerMixin = require('../lib').FakerMixin
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
    console.log(a.init())
    expect(a.init()).to.have.all.keys('name', 'password', 'name1', 'password1')
     expect(a.init()).to.not.have.keys('description')
  })
})