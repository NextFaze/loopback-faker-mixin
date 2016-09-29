# loopback-faker-mixin

## Synopsis

A mixin for loopback using the [faker](https://github.com/marak/Faker.js/) library.
## Code Example

In your ```model.json```
```js
{
    "name": "Customer",
    "base": "User"
    "properties": {
        "name": {
            "type": "string",
            faker: 'faker.method' || { method: 'faker.method', args: ['arg1']} see https://github.com/marak/Faker.js/
        }
    },
    "mixins": {
        "Faker": {
            "email": "internet.email",
            "password": "internet.password"
        }
    }
}

```

After the app has initialised you are able to access the static faker method via

```js
let { Customer } = app.models

Customer.faker({
    name: 'New Name' // this will overwrite the faker fakeness if you want
})
.then(customer => {
// customer with faked data
})

Customer.bulkFaker({
    global: {
        name: 'Every One Gets this Name'
    },
    individuals: [
        {
            name: 'except this guy... this is his name'
        }
    ]
}, 10).then(customers => {
    let individual = customers[0]
    customers.length === 10
    individual.name === 'except this guy... this is his name'
})
```
## Motivation

A simple way to create random data for testing and seeding

## Installation

```npm install faker loopback-faker-mixin```

=============

Add the `mixins` property to your `server/model-config.json`:

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "<path-to-your>/node_modules/loopback-faker-mixin",
      "../common/mixins"
    ]
  }
}
```

## API Reference

[Faker github](https://github.com/marak/Faker.js/).

## Contributors

[<img alt="henry" src="https://avatars0.githubusercontent.com/u/5061604?v=3&s=400" width="117">](https://github.com/HenryStevens) |
:---: |:---: |:---: |:---: |:---: |:---: |
[Henry Stevens](https://github.com/HenryStevens) |

