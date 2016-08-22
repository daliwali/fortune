# [![Fortune.js](https://fortunejs.github.io/fortune/assets/fortune_logo.svg)](http://fortune.js.org)

[![Build Status](https://img.shields.io/travis/fortunejs/fortune/master.svg?style=flat-square)](https://travis-ci.org/fortunejs/fortune)
[![Dependency Status](https://david-dm.org/fortunejs/fortune.svg?style=flat-square)](https://david-dm.org/fortunejs/fortune)
[![npm Version](https://img.shields.io/npm/v/fortune.svg?style=flat-square)](https://www.npmjs.com/package/fortune)
[![License](https://img.shields.io/npm/l/fortune.svg?style=flat-square)](https://raw.githubusercontent.com/fortunejs/fortune/master/LICENSE)

Fortune.js is a [database abstraction layer](https://en.wikipedia.org/wiki/Database_abstraction_layer) for Node.js and web browsers. It includes adapters for IndexedDB and memory, as well as a HTTP listener (JSON & HTML) and a WebSocket wire protocol out of the box.

[View the website](http://fortune.js.org) for documentation. Get it from `npm`:

```sh
$ npm install fortune --save
```


## Usage

To get started, only record type definitions need to be passed in. These definitions describe what data types may belong on a record and what relationships they may have, for which Fortune.js does inverse updates and maintains referential integrity. Here's an example of a basic micro-blogging service:

```js
const fortune = require('fortune')

const store = fortune({
  user: {
    name: { type: String },

    // Following and followers are inversely related (many-to-many).
    following: { link: 'user', inverse: 'followers', isArray: true },
    followers: { link: 'user', inverse: 'following', isArray: true },

    // Many-to-one relationship of user posts to post author.
    posts: { link: 'post', inverse: 'author', isArray: true }
  },
  post: {
    message: { type: String },

    // One-to-many relationship of post author to user posts.
    author: { link: 'user', inverse: 'posts' }
  }
})
```

Note that the primary key `id` is reserved, so there is no need to specify this. Links are `id`s that are maintained internally at the application-level by Fortune.js, and are always denormalized so that every link has a back-link. What this also means is that changes in a record will affect the links in related records.

By default, the data is persisted in memory (and IndexedDB for the browser). There are adapters for databases such as [MongoDB](https://github.com/fortunejs/fortune-mongodb), [Postgres](https://github.com/fortunejs/fortune-postgres), and [NeDB](https://github.com/fortunejs/fortune-nedb).

To make a request internally:

```js
store.request({
  type: 'user',
  method: 'create',
  payload: [ { name: 'John Doe' }, { name: 'Jane Doe' } ]
})
```

The first call to `request` will trigger a connection to the data store, and it returns the result as a Promise. See the [API documentation for `request`](http://fortune.js.org/api/#fortune-request).

**Node.js only**: Fortune.js implements HTTP server functionality for convenience, as a plain request listener which may be composed within larger applications:

```js
const http = require('http')

// The `fortune.net.http` helper function returns a listener function which
// does content negotiation, and maps the internal response to a HTTP response.
const server = http.createServer(fortune.net.http(store))

store.connect().then(() => server.listen(1337))
```

This yields an *ad hoc* JSON over HTTP API, as well as a HTML interface for humans. There are also serializers for [Micro API](https://github.com/fortunejs/fortune-micro-api) (JSON-LD) and [JSON API](https://github.com/fortunejs/fortune-json-api).

Fortune.js implements its own [wire protocol](http://fortune.js.org/api/#fortune.net-ws) based on [WebSocket](https://developer.mozilla.org/docs/Web/API/WebSockets_API) and [MessagePack](http://msgpack.org), which is useful for real-time applications.

See the [plugins page](http://fortune.js.org/plugins/) for more details.


## Input and Output Hooks

I/O hooks isolate business logic, and are part of what makes the interface reusable across different protocols. An input and output hook function may be defined per record type. Hook functions accept at least two arguments, the `context` object, the `record`, and optionally the `update` object for an `update` request. The method of an input hook may be any method except `find`, and an output hook may be applied on all methods.

An input hook function may optionally return or resolve a value to determine what gets persisted, and it is safe to mutate any of its arguments. The returned or resolved value must be the record if it's a create request, the update if it's an update request, or anything (or simply `null`) if it's a delete request. For example, an input hook function for a record may look like this:

```js
function input (context, record, update) {
  switch (context.request.method) {
    // If it's a create request, return the record.
    case 'create': return record

    // If it's an update request, return the update.
    case 'update': return update

    // If it's a delete request, the return value doesn't matter.
    case 'delete': return null
  }
}
```

An output hook function may optionally return or resolve a record, and it is safe to mutate any of its arguments.

```js
function output (context, record) {
  record.accessedAt = new Date()
  return record
}
```

Based on whether or not the resolved record is different from what was passed in, serializers may decide not to show the resolved record of the output hook for update and delete requests.

**Note**: Hook functions must be defined in a specific order: input first, output last.

```js
const store = fortune({
  user: { ... }
}, {
  hooks: {
    user: [ input, output ]
  }
})
```


## Use Cases

- A server-side implementation of a web service over HTTP. The included HTTP implementation provides a basis for implementing application-level protocols, including media types such as HTML (included), [Micro API](http://micro-api.org) and [JSON API](http://jsonapi.org), and covers standard input formats such as URL encoded and form data.
- A persistence layer in web browsers. Under the hood, it uses IndexedDB, Web Worker, and MessagePack to achieve high performance for persisting structured data.
- An abstraction layer for working with multiple databases. Write the same logic which will work across multiple adapters.
- Real-time web applications. Fortune.js includes its own [wire protocol](http://fortune.js.org/api/#fortune.net-ws) based on WebSocket and MessagePack.


## Features and Non-Features

- Type validations, plus support for custom types.
- Application-level denormalized inverse relationships.
- Dereferencing relationships in a single request.
- Transaction support for databases that support transactions, such as Postgres.
- IndexedDB functionality in web browsers.
- Built-in wire protocol for data synchronization between server and client.
- **No** active record pattern, just plain data objects.
- **No** coupling with network protocol, they are treated as external interfaces.


## Requirements

Fortune.js is written in ECMAScript 5.1 syntax, with some ECMAScript 6 additions.

- **Promise** (ES6): not supported in IE, supported in Edge. Bring your own implementation (optional).
- **WeakMap** (ES6): supported in IE11+, Edge. Polyfills exist, but they have their shortcomings since it must be implemented natively.


## License

This software is licensed under the [MIT license](https://raw.githubusercontent.com/fortunejs/fortune/master/LICENSE).
