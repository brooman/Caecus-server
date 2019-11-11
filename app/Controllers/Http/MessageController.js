'use strict'

const User = use('App/Models/User')
const Message = use('App/Models/Message')

class MessageController {
  async sendMessage({ request, auth, response }) {
    const fromUsername = request.input('fromUsername')
    const fromIdentifier = request.input('fromIdentifier')
    const toUsername = request.input('toUsername')
    const toIdentifier = request.input('toIdentifier')
    const encryptedMessage = request.input('message')

    const fromUser = await User.findBy({
      username: fromUsername,
      identifier: fromIdentifier,
    })
    const toUser = await User.findBy({
      username: toUsername,
      identifier: toIdentifier,
    })

    let message = new Message()
    message.from = fromUser.id
    message.to = toUser.id
    message.message = encryptedMessage.ciphertext

    console.log(encryptedMessage.ciphertext)

    let saved = await message.save()

    if (saved) {
      response.json({ message: 'Success' })
    }

    return response.status(401).json({ message: 'Bad request' })
  }

  async recieveMessages({ request, auth, response }) {
    const username = request.input('username')
    const identifier = request.input('identifier')
    const user = await User.findBy({
      username: username,
      identifier: identifier,
    })

    if (user) {
      const messages = await Message.query()
        .where('to', '=', user.id)
        .fetch()

      const promises = messages.toJSON().map(async (item) => {
        let user = await User.find(item.from)
        user = user.toJSON()

        return {
          username: user.username,
          identifier: user.identifier,
          message: item.message,
          date: item.created_at,
        }
      })

      const res = Promise.all(promises).then((completed) => {
        return completed
      })

      return response.json(await res)
    }

    return response.status(401).json({ message: 'Bad request' })
  }
}

module.exports = MessageController
