'use strict'

const Schmervice = require('schmervice')
const User = require('@models/user.model').schema
const config = require('config')
const { DateTime } = require('luxon')
const helper = require('@utilities/helper')

module.exports = class UserService extends Schmervice.Service {
  async getUserById(id) {
    const user = await User.findById(id)
    return user
  }

  async sendVerificationEmailToUser(user) {
    try {
      const emailHash = await User.generateHash()
      user.emailToken = emailHash.hash
      await User.findOneAndUpdate(
        { _id: user._id },
        {
          emailToken: emailHash.hash,
          emailTokenExpireAt: DateTime.utc()
            .plus({
              hours: parseInt(config.constants.VERIFICATION_EXPIRATION_PERIOD)
            })
            .toISO()
        }
      )
      const id = helper.encodeBase64(`${user._id}:${user.emailToken}`)
      console.log(
        'as',
        `<a  href=${config.console_url}/auth/verify-account/${id}?></a>`
      )
      return `<a  href=${config.console_url}/auth/verify-account/${id}?></a>`
    } catch (er) {
      console.log(er)
    }
  }
}
