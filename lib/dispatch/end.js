'use strict'

var map = require('../common/array/map')
var promise = require('../common/promise')


/**
 * Apply `output` hook per record, this mutates `context.response`.
 *
 * @return {Promise}
 */
module.exports = function (context) {
  var Promise = promise.Promise
  var hooks = this.hooks
  var request = context.request
  var response = context.response
  var type = request.type
  var hook = hooks[type]
  var records = response.records
  var include = response.include

  // Delete temporary keys.
  delete response.records
  delete response.include

  // Delete this key as well, since the transaction should already be ended
  // at this point.
  delete context.transaction

  // Run hooks on primary type.
  return (records ? Promise.all(map(records, function (record) {
    return Promise.resolve(typeof hook[1] === 'function' ?
      hook[1](context, record) : record)
  }))

  .then(function (updatedRecords) {
    var includeTypes
    var i, j

    for (i = 0, j = updatedRecords.length; i < j; i++)
      if (updatedRecords[i]) records[i] = updatedRecords[i]

    if (!include) return void 0

    // The order of the keys and their corresponding indices matter.
    includeTypes = Object.keys(include)

    // Run output hooks per include type.
    return Promise.all(map(includeTypes, function (includeType) {
      return Promise.all(map(include[includeType], function (record) {
        return Promise.resolve(
          typeof hooks[includeType][1] === 'function' ?
            hooks[includeType][1](context, record) : record)
      }))
    }))

    .then(function (types) {
      var i, j, k, l

      // Assign results of output hooks on includes.
      for (i = 0, j = types.length; i < j; i++)
        for (k = 0, l = types[i].length; k < l; k++)
          if (types[i][k]) include[includeTypes[i]][k] = types[i][k]
    })
  }) : Promise.resolve())

  .then(function () {
    context.response.payload = {
      records: records
    }

    if (include) context.response.payload.include = include

    // Expose the "count" property so that it is serializable.
    if (records && 'count' in records)
      context.response.payload.count = records.count

    return context
  })
}
