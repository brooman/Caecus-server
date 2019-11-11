'use strict'

const User = use('App/Models/User')
const SignedPreKey = use('App/Models/SignedPreKey')
const PreKey = use('App/Models/PreKey')

class ConnectionController {
  async getContact({ request, auth, response }) {
    const username = request.input('username')
    const identifier = request.input('identifier')

    const user = await User.findBy({ username: username, identifier: identifier })

    if (user) {
      const data = {
        user: {
          username: user.username,
          identifier: user.identifier,
          deviceId: user.deviceId,
        },
        preKeyBundle: {
          identity: user.identityKey,
          registrationId: user.registrationId,
          signedPreKey: await SignedPreKey.findBy('userId', user.id),
          preKey: await PreKey.findBy('userId', user.id),
        },
      }

      return response.json(data)
    }

    return response.status(404).json({ message: 'User not found' })
  }
}

module.exports = ConnectionController
