import io from 'socket.io-client'

import { app } from '../index'
import query from './query'

function connect() {
  // Websocket only because *.collegescheduler.com doesn't support long polling
  return io(app.locals.WS_HOST, {
    transports: ['websocket'],
  })
}

async function authorize(socket: SocketIOClient.Socket) {
  // TODO: Add error handling
  socket.emit(
    'authorize',
    { token: await query.accessToken() },
    (authResponse: object) => {
      // Check if callback says success true or false
      if (JSON.stringify(authResponse).includes('true')) {
        return socket
      }
      return false
    }
  )
}

async function registerCart(termString: string) {
  const socket = connect()
  await authorize(socket)
  const userInfo = await query.userInfo(termString)
  const request = {
    subdomain: 'unl',
    type: 'ENROLL_CART',
    userId: userInfo[0],
    termCode: userInfo[1],
    additionalData: { altPin: '' },
  }
  socket.emit('registration-request', request, (registerResponse: object) => {
    if (JSON.stringify(registerResponse).includes('true')) {
      socket.on('registration-response', (data: object) => {
        socket.close()
        console.log(JSON.stringify(data))
        // TODO: call notification function
      })
    } else {
      socket.close()
    }
    return false
  })
}

export default { registerCart }
