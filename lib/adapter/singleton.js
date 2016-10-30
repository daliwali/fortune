'use strict'

var Adapter = require('./')
var common = require('../common')
var errors = require('../common/errors')
var keys = require('../common/keys')
var message = require('../common/message')


/**
 * A singleton for the adapter. For internal use.
 */
function AdapterSingleton (properties) {
  var CustomAdapter, input

  input = Array.isArray(properties.adapter) ?
    properties.adapter : [ properties.adapter ]

  if (typeof input[0] !== 'function')
    throw new TypeError('The adapter must be a function.')

  CustomAdapter = Adapter.prototype
    .isPrototypeOf(input[0].prototype) ? input[0] : input[0](Adapter)

  if (!Adapter.prototype.isPrototypeOf(CustomAdapter.prototype))
    throw new TypeError('The adapter must inherit the Adapter class.')

  return new CustomAdapter({
    options: input[1] || {},
    recordTypes: properties.recordTypes,
    common: common,
    errors: errors,
    keys: keys,
    message: message,

    // For backwards compatibility.
    Promise: Promise
  })
}


module.exports = AdapterSingleton
