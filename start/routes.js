'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})

Route.post('/auth/register', 'AuthController.register')
Route.post('/auth/login', 'AuthController.login')

Route.post('/connect/contact', 'ConnectionController.getContact')
Route.post('/connect/prekeybundle', 'ConnectionController.getPreKeyBundle')

Route.post('/messages/send', 'MessageController.sendMessage')
Route.post('/messages/recieve', 'MessageController.recieveMessages')
Route.post('/messages/recieved', 'MessageController.messagesRecieved')
