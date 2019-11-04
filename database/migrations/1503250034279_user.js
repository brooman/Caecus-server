'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up() {
    this.create('users', table => {
      table.increments()
      table.string('username', 80).notNullable()
      table.string('identifier').notNullable
      table.string('password', 60).notNullable()
      table.integer('registrationId').notNullable()
      table
        .string('identityKey')
        .notNullable()
        .unique()
      table.integer('deviceId').notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('users')
  }
}

module.exports = UserSchema
