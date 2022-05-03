'use strict'

const Joi = require('joi')
const config = require('config')
const Boom = require('@hapi/boom')
const errorHelper = require('@utilities/error-helper')
const helper = require('@utilities/helper')
const Token = require('@utilities/create-token')
const User = require('@models/user.model').schema
Joi.objectId = require('joi-objectid')(Joi)
Joi.objectId = Joi.string

module.exports = {
  signup: {
    validate: {
      payload: Joi.object().keys({
        firstName: Joi.string()
          .trim()
          .label('FirstName'),
        lastName: Joi.string()
          .trim()
          .label('LastName'),
        email: Joi.string()
          .required()
          .trim()
          .label('Email'),
        password: Joi.string()
          .required()
          .trim()
          .label('Password'),
      })
    },
    pre: [
      {
        assign: 'signup',
        method: async (request, h) => {
          try {
            const { payload } = request
            console.log('payload: ', payload);
            delete payload.confirmPassword
            const existUser = await User.getByEmail(payload.email)
            console.log('existUser: ', existUser);
            if (existUser) {
              return 'email already exist'
            } else {
              const user = await User.create(payload)
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
              const id = Helper.encodeBase64(`${user._id}:${user.emailToken}`)
              const mailObj = {
                to: user.email,
                subject: `Verify Your Account`,
                html: template.commonTemplate({
                  title: `Welcome ${user.firstName} ${user.lastName},`,
                  message: `
                  Your account has been created. Click <a style=${template.linkStyle
                    } href=${config.console_url}/auth/verify-account/${id} target="_blank">here</a> to verify your account.`
                })
              }
              const res = await Helper.sendEmail(mailObj)
              if (res && res.accepted && res.accepted.length) {
                await User.findOneAndUpdate(
                  { _id: user._id },
                  {
                    verifyEmailSent: true,
                    emailTokenExpireAt: DateTime.utc()
                      .plus({
                        hours: parseInt(config.constants.VERIFICATION_EXPIRATION_PERIOD)
                      })
                      .toISO()
                  }
                )
              }
            }
          } catch (err) {
            errorHelper.handleError(err)
          }
        }
      }
    ],
    handler: async (request, h) => {
      return h.response(request.pre.signup)
    }
  },
  login: {
    validate: {
      payload: Joi.object().keys({
        email: Joi.string()
          .required()
          .trim()
          .label('Email'),
        password: Joi.string()
          .required()
          .trim()
          .label('Password')
      })
    },
    pre: [
      {
        assign: 'user',
        method: async (request, h) => {
          try {
            const email = request.payload.email
            const password = request.payload.password
            const user = await User.findByCredentials(email, password)
            if (user) {
              if (user.isAccountVerified) {
                return user
              } else {
                errorHelper.handleError(
                  Boom.badRequest(
                    'Please verify your email'
                  )
                )
              }
            } else {
              errorHelper.handleError(
                Boom.badRequest('Wrong email or password')
              )
            }
          } catch (err) {
            errorHelper.handleError(err)
          }
          return h.continue
        }
      },
      {
        assign: 'accessToken',
        method: (request, h) => {
          return Token(request.pre.user, config.constants.EXPIRATION_PERIOD)
        }
      }
    ],
    handler: async (request, h) => {
      const accessToken = request.pre.accessToken
      let response = {}
      delete request.pre.user.password
      response = {
        user: request.pre.user,
        accessToken
      }
      return h.response(response).code(200)
    }
  },
  me: {
    validate: {
      headers: Joi.object({
        authorization: Joi.string()
      }).options({
        allowUnknown: true
      })
    },
    pre: [],
    handler: async (request, h) => {
      const { userService } = request.server.services()
      const user = await userService.getUserById(
        request.auth.credentials.user._id
      )
      return h.response(user)
    }
  },
  updateProfile: {
    validate: {
      payload: Joi.object().keys({
        firstName: Joi.string()
          .required()
          .label('firstName'),
        lastName: Joi.string()
          .required()
          .label('lastName'),
        aadharNumber: Joi.string()
          .trim()
          .label('aadharNumber'),
        bio: Joi.string().label('bio'),
        email: Joi.string()
          .email()
          .required()
          .trim()
          .label('Email'),
        dateOfBirth: Joi.string().label('dateOfBirth'),
        dateOfJoining: Joi.string().label('dateOfBirth'),
        mobileNumber: Joi.number().label('MobileNumber'),
        employeeCode: Joi.string().label('employeeCode'),
        panNumber: Joi.string().label('panNumber'),
        position: Joi.string().label('lastName')
      })
    },
    pre: [
      {
        assign: 'uniqueEmail',
        method: async (request, h) => {
          try {
            const { payload } = request
            const oldUser = await User.findOne({
              _id: request.auth.credentials.user._id
            })
            if (oldUser && oldUser.email !== payload.email) {
              const user = await User.findOne({
                email: payload.email
              })
              if (user) {
                errorHelper.handleError(Boom.badData('Email already exists'))
              }
              return oldUser
            }
            return oldUser
          } catch (err) {
            errorHelper.handleError(err)
          }
        }
      },
      {
        assign: 'updateUser',
        method: async (request, h) => {
          try {
            const { payload, pre } = request
            const user = pre.uniqueEmail
            if (user && user._id) {
              return await User.findByIdAndUpdate(user._id, payload)
            } else {
              Boom.badRequest('User not Found')
            }
          } catch (err) {
            errorHelper.handleError(err)
          }
        }
      }
    ],
    handler: async (request, h) => {
      return h.response(request.pre.updateUser).code(201)
    }
  },
  resendEmail: {
    validate: {
      payload: Joi.object().keys({
        id: Joi.string()
          .required()
          .trim()
          .label('id')
      })
    },
    pre: [
      {
        assign: 'user',
        method: async (request, h) => {
          const { payload, query } = request
          try {
            const user = await User.findOne({ _id: payload.id })
            if (user) {
              if (query.inactiveAccount === 'true') {
                if (user.isDeleted) {
                  const { userService } = request.server.services()
                  return await userService.sendVerificationEmailToInactiveUser(user)
                } else {
                  errorHelper.handleError({
                    status: 400,
                    code: 'bad_request',
                    message: 'User already active with this email address.'
                  })
                }
              } else {
                if (!user.emailVerified) {
                  const { userService } = request.server.services()
                  return await userService.sendVerificationEmailToUser(user)
                } else {
                  errorHelper.handleError({
                    status: 400,
                    code: 'bad_request',
                    message: 'User already verified email address.'
                  })
                }
              }
            } else {
              errorHelper.handleError({
                status: 400,
                code: 'bad_request',
                message: 'User does not exist.'
              })
            }
          } catch (err) {
            errorHelper.handleError(err)
          }
        }
      }
    ],
    handler: async (request, h) => {
      try {
        const {
          pre: { user }
        } = request
        return h.response(user).code(200)
      } catch (err) {
        errorHelper.handleError(err)
      }
    }
  },
  users: {
    validate: {
      headers: helper.apiHeaders()
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const queryParams = request.query
        if (request.query.inactiveAccounts) {
          queryParams.isAccountVerified = false
        }
        return await User.find(queryParams).select(
          'firstName  lastName mobileNumber bio  email position profileImage isAccountVerified'
        )
      } catch (e) {
        errorHelper.handleError(e)
      }
    }
  },
  employeeRequest: {
    validate: {
      headers: helper.apiHeaders(),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const queryParams = { isAccountVerified: false };
        return await User.find(queryParams).select(
          '_id firstName  lastName mobileNumber bio  email position profileImage isAccountVerified',
        );
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },

  employeeList: {
    validate: {
      headers: helper.apiHeaders(),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const queryParams = { isAccountVerified: 'true' };
        return await User.find(queryParams).select(
          '_id firstName  lastName mobileNumber bio  email position profileImage isAccountVerified',
        );
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },
  emailVerified: {
    validate: {
      payload: Joi.object().keys({
        id: Joi.string()
          .required()
          .trim()
          .label('User Id')
      })
    },
    pre: [],

    handler: async (request, h) => {
      try {
        const { payload } = request
        const user = await User.findOne({ _id: payload.id })
        if (user) {
          if (!user.isAccountVerified) {
            errorHelper.handleError({
              status: 400,
              code: 'bad_request',
              message:
                'Verification is still pending, please verify your email account first.'
            })
          }
          return h.response(true).code(200)
        } else {
          errorHelper.handleError({
            status: 400,
            code: 'bad_request',
            message: 'User not found.'
          })
        }
      } catch (err) {
        errorHelper.handleError(err)
      }
    }
  },
  verifyEmail: {
    validate: {
      payload: Joi.object().keys({
        id: Joi.string()
          .required()
          .trim()
          .label('User Id')
      })
    },
    pre: [
      {
        assign: 'user',
        method: async (request, h) => {
          const { payload } = request
          try {
            const id = generalHelper.decodeBase64(payload.id)
            if (id.split(':')[0] && id.split(':')[1]) {
              return await User.findOne({
                _id: id.split(':')[0]
              })
            } else {
              errorHelper.handleError(errors.user.userNotExist)
            }
          } catch (err) {
            errorHelper.handleError(err)
          }
        }
      }
    ],
    handler: async (request, h) => {
      try {
        const {
          payload,
          pre: { user }
        } = request
        const id = generalHelper.decodeBase64(payload.id)
        if (user && user.emailVerified) {
          return h
            .response({
              message: 'Account already verified!..'
            })
            .code(200)
        }
        if (user) {
          if (
            user.emailTokenExpireAt &&
            user.emailToken === id.split(':')[1]
          ) {
            if (moment().isBefore(user.emailTokenExpireAt)) {
              user.emailVerified = true
              user.emailToken = null
              await user.save()
              return h
                .response({
                  message: 'Account activated successfully!..'
                })
                .code(200)
            } else {
              errorHelper.handleError({
                status: 400,
                code: 'link_expired',
                message: 'Link is expired.'
              })
            }
          } else {
            errorHelper.handleError({
              status: 400,
              code: 'link_expired',
              message: 'Link is invalid.'
            })
          }
        } else {
          errorHelper.handleError(errors.user.userNotExist)
        }
      } catch (err) {
        errorHelper.handleError(err)
      }
    }
  },
  activateEmpAcc: {
    validate: {
      headers: helper.apiHeaders(),
      payload: Joi.object().keys({
        Id: Joi.objectId()
          .required()
          .label('Id'),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const activateEmpAcc = await User.findOne({ _id: request.payload.Id });
        if (activateEmpAcc) {
          return await User.findOneAndUpdate(
            {
              _id: request.payload.Id,
            },
            {
              isAccountVerified: true,
            },
          );
        }
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },

  verifyAccount: {
    validate: {
      payload: Joi.object().keys({
        id: Joi.string().label('userId')
      })
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const { payload } = request
        const user = await User.findOne({ _id: payload.id })
        if (user && user.isAccountVerified) {
          return h
            .response({
              message: 'Account already verified!..'
            })
            .code(200)
        }
        if (user) {
          return await User.findOneAndUpdate(
            { _id: payload.id },
            { isAccountVerified: true }
          )
        } else {
          errorHelper.handleError({
            status: 400,
            code: 'user_not_found',
            message: 'User not found.'
          })
        }
      } catch (err) {
        errorHelper.handleError(err)
      }
    }
  },

  delete: {
    validate: {
      headers: helper.apiHeaders(),
      params: Joi.object().keys({
        Id: Joi.objectId()
          .required()
          .label('Id'),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const Emp = await User.findOne({
          _id: request.params.Id,
        });
        if (Emp) {
          return await User.findOneAndRemove({
            _id: request.params.Id,
          });
        }
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },

  viewEmployee: {
    validate: {
      headers: helper.apiHeaders(),
      params: Joi.object().keys({
        Id: Joi.objectId()
          .required()
          .label('Id'),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        return await User.findOne({
          _id: request.params.Id,
        }).select(
          '_id firstName  lastName mobileNumber bio  email position profileImage isAccountVerified dateOfBirth aadharNumber panNumber dateOfJoining employeeCode ',
        );
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },

  updateEmployee: {
    validate: {
      headers: helper.apiHeaders(),
      params: Joi.object().keys({
        Id: Joi.objectId()
          .required()
          .label('Id'),
      }),
      payload: Joi.object().keys({
        firstName: Joi.string().label('firstName'),
        lastName: Joi.string().label('lastName'),
        bio: Joi.string().label('bio').allow(null, ''),
        email: Joi.string()
          .email()
          .required()
          .trim()
          .label('Email'),
        dateOfBirth: Joi.string().label('dateOfBirth').allow(null, ''),
        dateOfJoining: Joi.string().label('dateOfBirth').allow(null, ''),
        mobileNumber: Joi.number().label('MobileNumber').allow(null, ''),
        employeeCode: Joi.string().label('employeeCode').allow(null, ''),
        aadharNumber: Joi.string()
          .label('aadharNumber').allow(null, ''),
        panNumber: Joi.string().label('panNumber').allow(null, ''),
        position: Joi.string().label('position').allow(null, ''),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const employee = await User.findOne({ _id: request.params.Id });
        if (employee) {
          return await User.findOneAndUpdate(
            {
              _id: request.params.Id,
            },
            {
              firstName: request.payload.firstName,
              lastName: request.payload.lastName,
              email: request.payload.email,

              bio: request.payload.bio,
              dateOfBirth: request.payload.dateOfBirth,
              dateOfJoining: request.payload.dateOfJoining,

              mobileNumber: request.payload.mobileNumber,
              employeeCode: request.payload.employeeCode,
              aadharNumber: request.payload.aadharNumber,

              panNumber: request.payload.panNumber,
              position: request.payload.position,
            },
          );
        }
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },
};
