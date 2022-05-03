'use strict'

const Joi = require('joi')
const Resume = require('@models/resumme.model').schema
Joi.objectId = require('joi-objectid')(Joi)
Joi.objectId = Joi.string

module.exports = {
  create: {
    validate: {
      headers: helper.apiHeaders()
    },
    pre: [],
    handler: async (request, h) => {
      try {
        return await Resume.create(request.payload)
      } catch (e) {
        errorHelper.handleError(e)
      }
    }
  },
  getAllUserResume: {
    validate: {
      headers: helper.apiHeaders()
    },
    pre: [],
    handler: async (request, h) => {
      try {
        return await Resume.find({ user: request.auth.credentials.usr._id })
      } catch (e) {
        errorHelper.handleError(e)
      }
    }
  }
};
