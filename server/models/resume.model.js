'use strict'

const mongoose = require('mongoose')

const Bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const Uuidv4 = require('uuid/v4')

const Types = Schema.Types

const modelName = 'resume'

const errorHelper = require('@utilities/error-helper')

const dbConn = require('@plugins/mongoose.plugin').plugin.dbConn()

const { errors } = require('@utilities/constants')

const generalHelper = require('@utilities/helper')

const ResumeSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'user',
      required: true
    },
    firstName: {
      type: Types.String,
      required: true
    },
    lastName: {
      type: Types.String,
      required: true
    },
    email: {
      type: Types.String,
      required: true
    },
    mobileNumber: {
      type: Types.Number,
      default: null
    },
    address: {
      type: Types.String,
      required: true
    },
    qualificatipon: {
      type: Types.Array,
      default: []
    },
    workExpirence: {
      type: Types.Array,
      default: []
    },
    skillSets: {
      type: Types.Array,
      default: []
    },
    skillSets: {
      type: Types.Array,
      default: []
    },
    projects: {
      type: Types.Array,
      default: []
    },
    Honors:{
      type: Types.Array,
      default: []
    },
    createdAt: {
      type: Types.Date,
      default: null
    },
    updatedAt: {
      type: Types.Date,
      default: null
    }
  },
  {
    versionKey: false,
    strict: false,
    timestamps: true
  }
)

exports.schema = dbConn.model(modelName, ResumeSchema)
