import io from 'socket.io-client'

import { app } from '../index'
import query from './query'

function connect() {
  // Websocket only because *.collegescheduler.com doesn't support long polling
  const socket = io(app.locals.WS_HOST, {
    transports: ['websocket'],
  })

  return socket
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

export default { authorize, connect }
