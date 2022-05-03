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
        mobileNumber: Joi.number().label('MobileNumbe')
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
              return await User.create(payload)
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
                    'Please contact admin for account verification'
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
