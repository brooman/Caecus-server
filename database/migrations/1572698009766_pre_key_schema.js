'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PreKeySchema extends Schema {
  up() {
    this.create('pre_keys', table => {
      table.increments()
      table.integer('userId').notNullable()
      table.integer('keyId').notNullable()
      table.string('key').notNullable()
    })
  }

  down() {
    this.drop('pre_keys')
  }
}

module.exports = PreKeySchema
