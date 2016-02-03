'use strict'

var applyUpdate = require('../../../common/apply_update')
var map = require('../../../common/array/map')

var common = require('../common')
var applyOptions = common.applyOptions

var helpers = require('./helpers')
var inputRecord = helpers.inputRecord
var outputRecord = helpers.outputRecord


/**
 * Memory adapter.
 */
module.exports = function (Adapter) {
  function MemoryAdapter (properties) {
    Adapter.call(this, properties)
  }


  MemoryAdapter.prototype = Object.create(Adapter.prototype)


  MemoryAdapter.prototype.connect = function () {
    var Promise = this.Promise
    var recordTypes = this.recordTypes
    var type

    this.db = {}

    for (type in recordTypes)
      this.db[type] = {}

    return Promise.resolve()
  }


  MemoryAdapter.prototype.disconnect = function () {
    var Promise = this.Promise
    delete this.db
    return Promise.resolve()
  }


  MemoryAdapter.prototype.find = function (type, ids, options, meta) {
    var self = this
    var Promise = self.Promise
    var db = self.db
    var recordTypes = self.recordTypes
    var fields = recordTypes[type]
    var collection = db[type]
    var records = []
    var i, j, id

    if (ids && !ids.length) return Adapter.prototype.find.call(self)

    if (ids) for (i = 0, j = ids.length; i < j; i++) {
      id = ids[i]
      if (id in collection)
        records.push(outputRecord.call(self, type, collection[id]))
    }

    else for (id in collection)
      records.push(outputRecord.call(self, type, collection[id]))

    return Promise.resolve(applyOptions(fields, records, options, meta))
  }


  MemoryAdapter.prototype.create = function (type, records, meta) {
    var self = this
    var message = self.message
    var Promise = self.Promise
    var db = self.db
    var primaryKey = self.keys.primary
    var ConflictError = self.errors.ConflictError
    var collection = db[type]
    var i, record, id, language

    if (!meta) meta = {}
    language = meta.language

    records = map(records, function (record) {
      return inputRecord.call(self, type, record)
    })

    // First check for collisions.
    for (i = records.length; i--;) {
      record = records[i]
      id = record[primaryKey]

      if (collection[id])
        return Promise.reject(new ConflictError(
          message('RecordExists', language, { id: id })))
    }

    // Then save it to memory.
    for (i = records.length; i--;) {
      record = records[i]
      collection[record[primaryKey]] = record
    }

    return Promise.resolve(map(records, function (record) {
      return outputRecord.call(self, type, record)
    }))
  }


  MemoryAdapter.prototype.update = function (type, updates) {
    var self = this
    var Promise = self.Promise
    var db = self.db
    var primaryKey = self.keys.primary
    var collection = db[type]
    var count = 0
    var i, update, id, record

    if (!updates.length) return Adapter.prototype.update.call(self)

    for (i = updates.length; i--;) {
      update = updates[i]
      id = update[primaryKey]
      record = collection[id]

      if (!record) continue

      count++
      record = outputRecord.call(self, type, record)

      applyUpdate(record, update)

      collection[id] = inputRecord.call(self, type, record)
    }

    return Promise.resolve(count)
  }


  MemoryAdapter.prototype.delete = function (type, ids) {
    var Promise = this.Promise
    var db = this.db
    var collection = db[type]
    var count = 0
    var i, id

    if (ids && !ids.length) return Adapter.prototype.delete.call(this)

    if (ids) for (i = ids.length; i--;) {
      id = ids[i]
      if (collection[id]) {
        delete collection[id]
        count++
      }
    }

    else for (id in collection) {
      delete collection[id]
      count++
    }

    return Promise.resolve(count)
  }


  return MemoryAdapter
}
