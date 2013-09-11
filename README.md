# Fortune.js [![Build Status](https://travis-ci.org/daliwali/fortune.png?branch=master)](https://travis-ci.org/daliwali/fortune)

Hello nerds. Fortune is a web framework for prototyping rich hypermedia APIs that implement the [JSON API](http://jsonapi.org/) specification. It comes with a modular persistence layer, with adapters for [MongoDB](http://github.com/daliwali/fortune-mongodb), [MySQL](http://github.com/daliwali/fortune-relational), [Postgres](http://github.com/daliwali/fortune-relational), & [SQLite](http://github.com/daliwali/fortune-relational).

Get it by installing from npm:
```
$ npm install fortune
```

### Features

Fortune implements everything you need to get started with JSON API, with a few extra features:

- Focus on ease of use. Fortune gives you routing and database interactions for free, so you don't have to do the plumbing.
- Associations and bi-directional relationship mapping. Fortune manages associations between resources so you don't have to.
- Hooks to transform resources before writing and after reading, for implementing application-specific logic (and magic).

It does not come with any authentication or authorization, you should implement your own application-specific logic (see [keystore.js](http://github.com/daliwali/fortune/blob/master/examples/keystore.js) for an example).

## Guide & Documentation

The full guide and API documentation are located at [fortunejs.com](http://fortunejs.com/).

### Basic Usage

Here is a minimal application:

```javascript
require('fortune')()

.resource('person', {
  name: String,
  age: Number,
  pets: ['pet'] // "has many" relationship to pets

}).resource('pet', {
  name: String,
  age: Number,
  owner: 'person' // "belongs to" relationship to a person

}).listen(1337);
```

This exposes a few routes for the `person` and `pet` resources, as defined by the JSON API specification:

| HTTP   | Person             | Pet               | Notes                                                        |
|--------|--------------------|-------------------|--------------------------------------------------------------|
| GET    | /people            | /pets             | Get a collection of resources, accepts query `?ids=1,2,3...` |
| POST   | /people            | /pets             | Create a resource                                            |
| GET    | /people/`:id`      | /pets/`:id`       | Get a specific resource, or multiple: `1,2,3`                |
| PUT    | /people/`:id`      | /pets/`:id`       | Create or update a resource                                  |
| PATCH  | /people/`:id`      | /pets/`:id`       | Patch a resource (see [RFC 6902](http://tools.ietf.org/html/rfc6902)) |
| DELETE | /people/`:id`      | /pets/`:id`       | Delete a resource                                            |
| GET    | /people/`:id`/pets | /pets/`:id`/owner | Get a related resource (one level deep)                      |

### Unit Testing

Tests are written with Mocha, and are run against the NeDB adapter. To run tests:

```
$ npm test
```

### Client-side Implementations
- [Ember Data](http://github.com/emberjs/data): the original implementation, it needs a [custom adapter](http://github.com/daliwali/ember-json-api) to actually work.

### Meta

For release history and roadmap, see [CHANGELOG.md](http://github.com/daliwali/fortune/blob/master/CHANGELOG.md).

Fortune is licensed under the MIT license, see [LICENSE.md](http://github.com/daliwali/fortune/blob/master/LICENSE.md).

Development of Fortune is sponsored by [AdStack](http://adstack.com/).
