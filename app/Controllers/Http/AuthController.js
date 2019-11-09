'use strict'

const User = use('App/Models/User')
const SignedPreKey = use('App/Models/SignedPreKey')
const PreKey = use('App/Models/PreKey')

class AuthController {
  /**
   * Register account
   */
  async register({ request, auth, response }) {
    const username = request.input('username')
    const password = request.input('password')
    const deviceId = request.input('deviceId')
    const registrationId = request.input('registrationId')
    const identityKey = request.input('identityKey')
    const signedPreKey = request.input('signedPreKey')
    const preKeys = request.input('preKeys')

    let user = new User()
    user.username = username
    user.identifier = user.generateId()
    user.password = password
    user.deviceId = deviceId
    user.registrationId = registrationId
    user.identityKey = identityKey

    let userCreated = await user.save()

    if (userCreated) {
      let user = await User.findBy('username', username)

      let sPreKey = new SignedPreKey()

      sPreKey.userId = user.id
      sPreKey.keyId = signedPreKey.keyId
      sPreKey.key = signedPreKey.key
      sPreKey.signature = signedPreKey.signature
      await sPreKey.save()

      preKeys.map(async pk => {
        let preKey = new PreKey()
        preKey.userId = user.id
        preKey.keyId = pk.keyId
        preKey.key = pk.key
        await preKey.save()
      })

      let accessToken = await auth.generate(user)
      return response.json({
        user: { username: user.username, identifier: user.identifier },
        access_token: accessToken,
      })
    }

    return response.status(401).json({ message: 'Registration failed' })
  }

  /**
   * Login
   */
  async login({ request, auth, response }) {
    const username = request.input('username')
    const password = request.input('password')

    try {
      if (await auth.attempt(username, password)) {
        let user = await User.findBy('username', username)
        let accessToken = await auth.generate(user)
        return response.json({
          user: { username: user.username, identifier: user.identifier },
          access_token: accessToken,
        })
      }
    } catch (e) {
      return response.json({ message: 'Invalid login' })
    }
  }
}

module.exports = AuthController
