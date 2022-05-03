'use strict'
const config = require('config')

const errorHelper = require('@utilities/error-helper')
const { errors } = require('@utilities/constants')

exports.plugin = {
  async register(server, options) {
    const User = require('@models/user.model').schema
    const ioSocket = require('@plugins/socket.plugin').plugin

    const jwtValidate = async (decodedToken, request, h) => {
      let isValid = false
      try {
        if (decodedToken) {
          if (decodedToken) {
            if (
              decodedToken.user &&
              decodedToken.user.email &&
              decodedToken.user._id
            ) {
              const user = await User.findOne({
                _id: decodedToken.user._id,
                email: decodedToken.user.email,
                emailVerified: true,
                isDeleted: false
              })
              if (user) {
                ioSocket.sendToAll({
                  event: 'onConn',
                  data: `welcome to ${decodedToken.user.email}`
                })
                isValid = true
              } else {
                errorHelper.handleError(
                  errors.authorization.invalideCredentials
                )
              }
            } else {
              errorHelper.handleError(errors.authorization.invalideCredentials)
            }
          } else {
            errorHelper.handleError(errors.authorization.invalideCredentials)
          }
        } else {
          errorHelper.handleError(errors.authorization.invalideCredentials)
        }
      } catch (err) {
        errorHelper.handleError(err)
      }
      return {
        isValid
      }
    }

    server.auth.strategy('auth', 'jwt', {
      key: config.constants.JWT_SECRET,
      validate: jwtValidate,
      verifyOptions: {
        algorithms: ['HS256']
      }
    })
  },
  name: 'auth',
  version: require('../../package.json').version
}
