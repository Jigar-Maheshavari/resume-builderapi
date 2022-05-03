'use strict'

const Joi = require('@hapi/joi')
Joi.objectId = Joi.string
const Boom = require('@hapi/boom')
const Friend = require('@models/friend.model').schema

const getFriends = async id => {
  const sendRequest = await Friend.find({ userFrom: id })
    .populate('userTo')
    .lean()
  const getRequest = await Friend.find({ userTo: id })
    .populate('userFrom')
    .lean()
  const allRequest = [...sendRequest, ...getRequest]
  allRequest.map(f => {
    if (f && f.userTo && f.userTo.firstName && f.userTo.lastName) {
      f.friend = f.userTo
    } else {
      f.friend = f.userFrom
    }
    return f
  })
  return {
    friends: allRequest.filter(f => f.status === 'ACCEPTED'),
    sendRequest: sendRequest.filter(f => f.status === 'PENDING'),
    getRequest: getRequest.filter(f => f.status === 'PENDING')
  }
}

module.exports = {
  getFriends
}
