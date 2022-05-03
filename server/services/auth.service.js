'use strict'

const Schmervice = require('schmervice')
const errorHelper = require('@utilities/error-helper')
const User = require('@models/user.model').schema
const Helper = require('@utilities/helper')
const config = require('config')
const template = require('@utilities/templates')

module.exports = class authService extends Schmervice.Service {
  async updateUserSocialData({ payload }) {
    try {
      const user = await User.findOne({
        isDeleted: false,
        email: payload.email
      })
      if (user) {
        if (payload && payload.password) { // user trying to signup again through socials
          errorHelper.handleError({
            status: 400,
            code: 'bad_request',
            message: 'Email already exists.'
          })
        }
        user.emailVerified = true
        user.emailToken = null
        if (payload.googleId) {
          user.googleId = payload.googleId
          user.googleToken = payload.googleToken
        }
        const response = await user.save()
        return response
      } else {
        return user
      }
    } catch (e) {
      return errorHelper.handleError(e)
    }
  }

  async getUserNameFromEmail(email) {
    try {
      const generatedUserName = email.split("@")[0];
      return await this.checkUserName(generatedUserName)
    } catch (e) {
      return errorHelper.handleError(e)
    }
  }

  async checkUserName(username) {
    try {
      const user = await User.findOne({
        isDeleted: false,
        userName: username
      })
      if (user) {
        console.log('duplicate found for username', username)
        const randomNumber = Math.floor(Math.random() * 1000)
        const newUserName = username + `${randomNumber}`
        return await this.checkUserName(newUserName)
      } else {
        console.log('no duplicate found for username: ', username);
        return { username }
      }
    } catch (e) {
      return errorHelper.handleError(e)
    }
  }

  async sendSignUpWithGoogleMail(payload) {
    try {
      const mailObj = {
        to: payload.email,
        subject: `New Sign Up`,
        html: template.commonTemplate({
          title: `Welcome ${payload.email},`,
          message: `Hi ${payload.email}, <br/><br/>
          You can now login with: <br/>
          Email : <a style="text-decoration:none;color: #0095FF;" href="mailto:${payload.email}" target="_blank">${payload.email}</a><br/>
          password : <b style="color: #000000;">${payload.password}</b> <br/><br/>
          Please <a style="text-decoration:none;color: #0095FF;" href=${config.console_url} target="_blank">click here</a> to Login.<br/><br/>
          Thanks.`
        })
      }
      const res = await Helper.sendEmail(mailObj)
    } catch (e) {
      return errorHelper.handleError(e)
    }
  }
}
