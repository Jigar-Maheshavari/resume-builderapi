'use strict'
const socket = require('socket.io')
var io
exports.plugin = {
  async register(server, options) {
    const User = require('@models/user.model').schema
    io = socket(server.listener)
    io.on('connection', async socket => {
      if (
        socket &&
        socket.handshake &&
        socket.handshake.query &&
        socket.handshake.query.loggedInUser !== 'undefined'
      ) {
        await User.findOneAndUpdate(
          {
            _id: socket.handshake.query.loggedInUser
          },
          {
            isOnline: true,
            offlineAt: null
          }
        )
        socket.broadcast.emit('statusUpdate', {
          conversationId: socket.handshake.query.loggedInUser,
          isOnline: true,
          offlineAt: null
        })
      }
      socket.on('disconnect', async so => {
        if (
          socket &&
          socket.handshake &&
          socket.handshake.query &&
          socket.handshake.query.loggedInUser
        ) {
          await User.findOneAndUpdate(
            {
              _id: socket.handshake.query.loggedInUser
            },
            {
              isOnline: false,
              offlineAt: new Date()
            }
          )
          socket.broadcast.emit('statusUpdate', {
            conversationId: socket.handshake.query.loggedInUser,
            isOnline: false,
            offlineAt: new Date()
          })
        }
      })
      socket.on('transferSDP', async data => {
        socket.broadcast.emit('onTransferSDP', data)
      })
      socket.on('supportTransferSDP', async data => {
        socket.broadcast.emit('onSupportTransferSDP', data)
      })
    })
  },
  io() {
    return io
  },
  connect(connect) {
    io.of(`${connect.ref}`).on('connect', function(socket) {
      console.log('server nsp->%s', socket.nsp.name)
    })
  },
  send(connect) {
    io.of(`/${connect.ref}`).emit(connect.event, connect.data)
  },
  sendToAll(connect) {
    io.emit(connect.event, connect.data)
  },
  name: 'socket',
  version: require('../../package.json').version
}
