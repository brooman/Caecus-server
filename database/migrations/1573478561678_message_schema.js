'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MessageSchema extends Schema {
  up() {
    this.create('messages', table => {
      table.increments()
      table.integer('from')
      table.integer('to')
      table.integer('message')
      table.string('data')
      table.timestamps()
    })
  }

  down() {
    this.drop('messages')
  }
}

module.exports = MessageSchema
