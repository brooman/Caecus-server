'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SignedPreKey extends Model {
  static boot() {
    super.boot()

    this.addTrait('NoTimestamp')
  }

  user() {
    this.belongsTo('App/Models/User')
  }
}

module.exports = SignedPreKey
