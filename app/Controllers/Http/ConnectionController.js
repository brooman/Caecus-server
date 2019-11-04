'use strict'

const User = use('App/Models/User')
const SignedPreKey = use('App/Models/SignedPreKey')
const PreKey = use('App/Models/PreKey')

class ConnectionController {
  async fetchPreKeyBundle({ request, auth, response }) {
    const username = request.input('username')
    const identifier = request.input('identifier')

    const user = await User.findBy({ username: username, identifier: identifier })

    if (user) {
      const PreKeyBundle = {
        identity: user.identityKey,
        signedPreKey: await SignedPreKey.findBy('userId', user.id),
        preKey: await PreKey.findBy('userId', user.id),
      }

      return response.json(PreKeyBundle)
    }

    return response.status(404).json({ message: 'User not found' })
  }
}

module.exports = ConnectionController
