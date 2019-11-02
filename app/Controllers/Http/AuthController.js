'use strict'

const User = use('App/Models/User')

class AuthController {
  /**
   * Register account
   */
  async register({ request, auth, response }) {
    const username = request.input('username')
    const password = request.input('password')

    let user = new User()
    user.username = username
    user.password = password

    let success = await user.save()

    if (success) {
      let user = await User.findBy('username', username)
      let accessToken = await auth.generate(user)
      return response.json({ username: user.username, access_token: accessToken })
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
        return response.json({ username: user.username, access_token: accessToken })
      }
    } catch (e) {
      return response.json({ message: 'Invalid login' })
    }
  }
}

module.exports = AuthController
