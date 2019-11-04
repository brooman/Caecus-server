'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SignedPreKeySchema extends Schema {
  up() {
    this.create('signed_pre_keys', table => {
      table.increments()
      table
        .integer('userId')
        .notNullable()
        .unique()
      table.integer('keyId').notNullable()
      table.string('key').notNullable()
      table.string('signature').notNullable()
    })
  }

  down() {
    this.drop('signed_pre_keys')
  }
}

module.exports = SignedPreKeySchema
