'use strict'

const mongoose = require('mongoose')

const Bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const Uuidv4 = require('uuid/v4')

const Types = Schema.Types

const modelName = 'user'

const errorHelper = require('@utilities/error-helper')

const dbConn = require('@plugins/mongoose.plugin').plugin.dbConn()

const { errors } = require('@utilities/constants')

const generalHelper = require('@utilities/helper')

const UserSchema = new Schema(
  {
    email: {
      type: Types.String,
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
    password: {
      type: Types.String,
      default: null
    },
    role: {
      type: Types.String,
      enum: ['USER', 'ADMIN'],
      default: 'USER'
    },
    isAccountVerified: {
      type: Types.Boolean,
      default: false
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

UserSchema.pre('save', async function (next) {
  const user = this
  if (user.isNew) {
    // Set Password & hash before save it
    const passHash = await user.generateHash(user.password)
    user.password = passHash.hash
    const emailHash = await user.generateHash()
    user.emailHash = emailHash.hash
    user.wasNew = true
  }
  next()
})

UserSchema.methods = {
  generateHash: async function (key) {
    try {
      if (key === undefined) {
        key = Uuidv4()
      }
      const salt = await Bcrypt.genSalt(10)
      const hash = await Bcrypt.hash(key, salt)
      return {
        key,
        hash
      }
    } catch (err) {
      errorHelper.handleError(err)
    }
  }
}

UserSchema.statics = {
  findByCredentials: async function (email, password) {
    try {
      const self = this

      const query = {
        email: email
      }

      const mongooseQuery = self.findOne(query)

      const user = await mongooseQuery.lean()

      if (!user) {
        const errorObj = {}
        errorObj.email = errors.user.wrongEmail.message
        await generalHelper.setCustomError(errorObj)
      }

      const source = user.password
      const passwordMatch = await Bcrypt.compare(password, source)
      if (passwordMatch) {
        return user
      } else {
        const errorObj = {}
        errorObj.password = errors.user.wrongPassword.message
        await generalHelper.setCustomError(errorObj)
      }
    } catch (err) {
      errorHelper.handleError(err)
    }
  },
  generateHash: async function (key) {
    try {
      if (key === undefined) {
        key = Uuidv4()
      }
      const salt = await Bcrypt.genSalt(10)
      const hash = await Bcrypt.hash(key, salt)
      return {
        key,
        hash
      }
    } catch (err) {
      errorHelper.handleError(err)
    }
  },
  getByEmail: async function (email) {
    try {
      const self = this
      const query = { email: email }
      const userData = await self.findOne(query)
      return userData
    } catch (err) {
      errorHelper.handleError(err)
    }
  }
}

exports.schema = dbConn.model(modelName, UserSchema)