'use strict'

const Joi = require('joi')
const Resume = require('@models/resume.model').schema
Joi.objectId = Joi.string
const template = require('@utilities/templates')
var html_to_pdf = require('html-pdf-node')
const fileUploadHelper = require('@utilities/fileupload.helper')
const helper = require('@utilities/helper')
const errorHelper = require('@utilities/error-helper')

module.exports = {
  create: {
    validate: {
      // headers: helper.apiHeaders()
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const resume = await Resume.create(request.payload)
        const file = {
          content: template.commonTemplate(request.payload)
        }
        html_to_pdf
          .generatePdf(file, { format: 'A4' })
          .then(async pdfBuffer => {
            console.log('PDF Buffer:-', pdfBuffer)
            const location = await fileUploadHelper.uploadLocalFile(
              pdfBuffer,
              'resume',
              resume._id
            )
            console.log('location: ', location)
          })
        return resume
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
}
