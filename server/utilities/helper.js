'use strict'

const Joi = require('joi')
Joi.objectId = Joi.string
const Boom = require('@hapi/boom')
const config = require('config')
const errorHelper = require('@utilities/error-helper')
const moment = require('moment-timezone')
const nodemailer = require('nodemailer')

const apiHeaders = () => {
  return Joi.object({
    authorization: Joi.string()
  }).options({
    allowUnknown: true
  })
}

const encodeBase64 = string => {
  return Buffer.from(string).toString('base64')
}

const decodeBase64 = string => {
  return Buffer.from(string, 'base64').toString()
}

const kbToBytes = kb => {
  return kb * 1024
}

const mbToBytes = mb => {
  return mb * 1048576
}

const bytesToMb = bytes => {
  return bytes / 1024 / 1024
}

const bytesToGb = bytes => {
  return bytes / 1024 / 1024 / 1024
}

const ConvertTbToGb = tb => {
  return tb / 1024
}

const sendEmail = async mailObj => {
  let response
  try {
    // response = await mailGunSendMail(mailObj).catch(e => console.log(e))
    response = await smtpSendMail(mailObj).catch(e => console.log(e))
    return response
  } catch (err) {
    errorHelper.handleError(err)
  }
}

const smtpSendMail = async mailObj => {
  const transporter = nodemailer.createTransport({
    host: 'mail.virtuousai.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'contact@virtuousai.com', // user
      pass: 'H7RD$0sQK^LCUcK' // password
    }
  })

  if (mailObj) {
    const messageObj = {}
    if (mailObj.message) {
      messageObj.text = mailObj.message
      delete mailObj.message
    } else {
      messageObj.html = mailObj.html
      delete mailObj.html
    }

    messageObj.from = mailObj.from
      ? mailObj.from
      : '"Virtuous AI" <admin@virtuousai.com>'
    delete mailObj.from

    var data = {
      ...mailObj,
      ...messageObj
    }

    try {
      // send mail with defined transport object
      const info = await transporter.sendMail(data)
      return info
    } catch (err) {
      errorHelper.handleError(err)
    }
  } else {
    errorHelper.handleError(Boom.badData('Mail Detail is invalid'))
  }
}

const mailGunSendMail = mailObj => {
  return new Promise((resolve, reject) => {
    var mailGun = require('mailgun-js')({
      apiKey: config.constants.MAIL_GUN_API_KEY,
      domain: config.constants.MAIL_GUN_DOMAIN
    })

    if (mailObj) {
      const messageObj = {}
      if (mailObj.message) {
        messageObj.text = mailObj.message
        delete mailObj.message
      } else {
        messageObj.html = mailObj.html
        delete mailObj.html
      }

      var data = {
        from: mailObj.from
          ? mailObj.from
          : '"Virtuous AI" <admin@virtuousai.com>',
        ...mailObj,
        ...messageObj
      }

      try {
        mailGun.messages().send(data, function(error, body) {
          if (error) {
            reject(error)
          }
          resolve(body.message)
        })
      } catch (err) {
        errorHelper.handleError(err)
      }
    } else {
      errorHelper.handleError(Boom.badData('Mail Detail is invalid'))
    }
  })
}

const getAccessLevel = async (sourceId, type) => {
  const AccessLevel = require('@models/accesslevel.model').schema
  const query = {}
  query.accessType = type
  query.source = sourceId
  query.status = 'ACCEPTED'
  const response = await AccessLevel.find(query)
  return response.map(a => a.invitedBy)
}

const sourceSort = async data => {
  const sortedNameData = data.sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  })
  const sortedFileFolderData = sortedNameData.sort((a, b) => {
    return a.type.toLowerCase().localeCompare(b.type.toLowerCase())
  })
  return sortedFileFolderData
}

const generateRandomString = length => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let result = ''
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const currentYearMonthNames = () => {
  const currentFullYear = new Date().getFullYear().toString()
  const dateArray = [
    '',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
    ''
  ]
  return dateArray.map(data => `${data}${currentFullYear}`)
}

const makeTimeSlots = (from, to, user = null) => {
  const options = []
  for (let index = from; index <= to; index++) {
    if (index < to) {
      options.push({
        from: index,
        to: index + 0.5,
        user
      })
    }
    if (index + 0.5 < to) {
      options.push({
        from: index + 0.5,
        to: index + 1,
        user
      })
    }
  }
  return options
}

const getTimeSlots = () => {
  const startTimeOptions = []
  for (let index = 0; index <= 23; index++) {
    const prefix = index > 11 ? 'PM' : 'AM'
    startTimeOptions.push({
      value: index,
      textSecond: index < 10 ? `0${index}:00` : `${index}:00`,
      text:
        index < 10
          ? `${index === 0 ? 12 : `0${index}`}:00 ${prefix}`
          : `${index > 12 ? index - 12 : index}:00 ${prefix}`
    })
    startTimeOptions.push({
      value: index + 0.5,
      textSecond: index < 10 ? `0${index}:30` : `${index}:30`,
      text:
        index < 10
          ? `${index === 0 ? 12 : `0${index}`}:30 ${prefix}`
          : `${index > 12 ? index - 12 : index}:30 ${prefix}`
    })
  }
  return startTimeOptions
}

// key, array
const inArray = (needle, haystack) => {
  var length = haystack.length
  for (var i = 0; i < length; i++) {
    if (haystack[i] === needle) return true
  }
  return false
}

const loggerFiles = {
  general: 'logs/logs.log',
  models: 'logs/models.log',
  mlcallback: 'logs/mlcallback.log',
  stress: 'logs/stress.log',
  cron: 'logs/cron.log'
}

const log = (file, customLabel, log) => {
  const winston = require('winston')
  const { format } = require('winston')
  const { combine, timestamp, label } = format
  const logConfiguration = {
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: loggerFiles[file],
        format: combine(
          label({ label: customLabel || 'NO_LABEL' }),
          timestamp(),
          winston.format.json()
        )
      })
    ]
  }
  const logger = winston.createLogger(logConfiguration)
  logger.info(log)
}

const stressLog = (stressId, customLabel, log) => {
  const winston = require('winston')
  const { format } = require('winston')
  const { combine, timestamp, label } = format
  const logConfiguration = {
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: `logs/${stressId}.log`,
        format: combine(
          label({ label: customLabel || 'NO_LABEL' }),
          timestamp(),
          winston.format.json()
        )
      })
    ]
  }
  const logger = winston.createLogger(logConfiguration)
  logger.info(log)
}

const getIp = request => {
  const ip =
    request.headers['x-real-ip'] ||
    request.headers['x-forwarded-for'] ||
    request.info.remoteAddress
  return ip
}

const lastMonth = () => {
  return {
    from: moment(moment.utc())
      .subtract(1, 'month')
      .startOf('month')
      .toISOString(),
    to: moment(moment.utc())
      .subtract(1, 'month')
      .endOf('month')
      .toISOString()
  }
}

const currentMonth = () => {
  return {
    from: moment(moment.utc())
      .startOf('month')
      .toISOString(),
    to: moment(moment.utc())
      .endOf('month')
      .toISOString()
  }
}

const currentTime = () => {
  return moment(moment.utc()).toISOString()
}

const currentTimeMinusOneHr = () => {
  return moment(moment.utc())
    .add(-1, 'hours')
    .toISOString()
}

const currentTimeMinusTwentyMinutes = () => {
  return moment(moment.utc())
    .add(-20, 'minutes')
    .toISOString()
}

const last12MonthTimeRange = () => {
  return {
    from: moment(moment.utc())
      .subtract(12, 'month')
      .toISOString(),
    to: moment(moment.utc()).toISOString()
  }
}

const currentYear = () => {
  return {
    from: moment(moment.utc())
      .startOf('year')
      .toISOString(),
    to: moment(moment.utc())
      .endOf('year')
      .toISOString()
  }
}

const currentWeek = () => {
  return {
    from: moment(moment.utc())
      .startOf('isoWeek')
      .toISOString(),
    to: moment(moment.utc())
      .endOf('isoWeek')
      .toISOString()
  }
}
const currentDay = () => {
  return {
    from: moment(moment.utc())
      .startOf('day')
      .toISOString(),
    to: moment(moment.utc())
      .endOf('day')
      .toISOString()
  }
}

const lastWeek = () => {
  return {
    from: moment(moment.utc())
      .subtract(1, 'weeks')
      .startOf('isoWeek')
      .toISOString(),
    to: moment(moment.utc())
      .subtract(1, 'weeks')
      .endOf('isoWeek')
      .toISOString()
  }
}

const lastSevenDays = () => {
  return {
    from: moment(moment.utc())
      .subtract(6, 'days')
      .startOf('day')
      .toISOString(),
    to: moment(moment.utc())
      .endOf('day')
      .toISOString()
  }
}

const arrayBufferToString = buffer => {
  var binary = ''
  var bytes = new Uint8Array(buffer)
  var len = bytes.byteLength
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return binary
}

const csvStringToArray = (csvDataString, delimiter) => {
  const regexPattern = new RegExp(
    `(\\${delimiter}|\\r?\\n|\\r|^)(?:\"((?:\\\\.|\"\"|[^\\\\\"])*)\"|([^\\${delimiter}\"\\r\\n]*))`,
    'gi'
  )
  let matchedPatternArray = regexPattern.exec(csvDataString)
  const resultCSV = [[]]
  while (matchedPatternArray) {
    if (matchedPatternArray[1].length && matchedPatternArray[1] !== delimiter) {
      resultCSV.push([])
    }
    const cleanValue = matchedPatternArray[2]
      ? matchedPatternArray[2].replace(new RegExp('[\\\\"](.)', 'g'), '$1')
      : matchedPatternArray[3]
    resultCSV[resultCSV.length - 1].push(cleanValue)
    matchedPatternArray = regexPattern.exec(csvDataString)
  }
  return resultCSV
}

const convertData = (csvRecordsArray, header) => {
  var dataArr = []
  var headersArray = csvRecordsArray[0]
  var startingRowToParseData = header ? 1 : 0
  for (var i = startingRowToParseData; i < csvRecordsArray.length; i++) {
    var data = csvRecordsArray[i]
    if (data.length === headersArray.length && header) {
      var csvRecord = {}
      for (var j = 0; j < data.length; j++) {
        if (data[j] === undefined || data[j] === null) {
          csvRecord[headersArray[j]] = ''
        } else {
          csvRecord[headersArray[j]] = data[j].trim()
        }
      }
      dataArr.push(csvRecord)
    } else {
      dataArr.push(data)
    }
  }
  return dataArr
}

const readCsvFile = (file, header) => {
  // OLD
  // const res = arrayBufferToString(Buffer.from(file))
  // const resRead = csvStringToArray(res.trim(), ',')
  // OLD

  // NEW
  const buf = Buffer.from(file)
  const resRead = csvStringToArray(buf.toString().trim(), ',')
  // NEW
  return convertData(resRead, header)
}

const generateSlug = value => {
  const val = value.trim().toLowerCase()
  let replaced = val.split(' ').join('-')
  replaced = replaced.split('/').join('-')
  return replaced
}

const isValidJsonString = string => {
  try {
    return { success: true, data: JSON.parse(string) }
  } catch (e) {
    return { success: false, data: 'Not valid json' }
  }
}

const escapeRegExp = string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const replaceAll = (str, term, replacement) => {
  return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement)
}

const replaceAllMultiple = (string, obj) => {
  var retStr = string
  for (var x in obj) {
    retStr = retStr.replace(new RegExp(escapeRegExp(x), 'g'), obj[x])
  }
  return retStr
}

const validJsonString = string => {
  try {
    var jsontemp = string.replace(/([\w]+)(:)/g, '"$1"$2')
    return jsontemp.replace(/'/g, '"')
  } catch (e) {
    console.log('error: ', e)
  }
}

const IsJsonString = string => {
  try {
    JSON.parse(string)
  } catch (e) {
    return false
  }
  return true
}

const parseJson = string => {
  try {
    if (IsJsonString(string)) {
      return { json: JSON.parse(string), success: true }
    } else {
      if (string.includes('Infinity') || string.includes('NaN')) {
        const newString = replaceAllMultiple(string, {
          Infinity: 0,
          NaN: 0
        })
        if (IsJsonString(newString)) {
          return {
            json: JSON.parse(newString),
            success: true,
            message: 'Json parsed successfully'
          }
        } else {
          const validJson = validJsonString(newString)
          if (IsJsonString(validJson)) {
            return {
              json: JSON.parse(validJson),
              success: true,
              message: 'Json parsed successfully'
            }
          } else {
            return {
              json: {},
              success: false,
              message: 'Failed to parse the response'
            }
          }
        }
      } else {
        const validJson = validJsonString(string)
        if (IsJsonString(validJson)) {
          return {
            json: JSON.parse(validJson),
            success: true,
            message: 'Json parsed successfully'
          }
        } else {
          return {
            json: {},
            success: false,
            message: 'Failed to parse the response'
          }
        }
      }
    }
  } catch (e) {
    console.log('error: ', e)
  }
}

const sortData = (data, key, type, isAsc) => {
  let sortedData = []
  switch (type) {
    case 'number':
      sortedData = data.sort((a, b) => {
        return isAsc ? a[key] - b[key] : b[key] - a[key]
      })
      break
    case 'date':
      sortedData = data.sort((a, b) => {
        const bDate = new Date(b[key])
        const aDate = new Date(a[key])
        return isAsc ? aDate - bDate : bDate - aDate
      })
      break
    case 'string':
      sortedData = data.sort((a, b) => {
        const nameA = a[key].toUpperCase()
        const nameB = b[key].toUpperCase()
        if (nameA < nameB) {
          return isAsc ? -1 : 1
        }
        if (nameA > nameB) {
          return isAsc ? 1 : -1
        }
        return 0
      })
      break
  }
  return sortedData
}

const waitForTime = millisecond => {
  return new Promise(resolve => setTimeout(resolve, millisecond))
}

const isCorrectFormat = (dateString, format) => {
  return moment(dateString, format, true).isValid()
}

const isBothArraySame = (array1, array2) => {
  return array1.every((value, index) => value === array2[index])
}

module.exports = {
  apiHeaders,
  sendEmail,
  encodeBase64,
  decodeBase64,
  getAccessLevel,
  sourceSort,
  generateRandomString,
  currentYear,
  currentYearMonthNames,
  makeTimeSlots,
  inArray,
  kbToBytes,
  bytesToGb,
  ConvertTbToGb,
  mbToBytes,
  currentTime,
  currentTimeMinusOneHr,
  last12MonthTimeRange,
  getTimeSlots,
  log,
  getIp,
  currentMonth,
  currentWeek,
  currentDay,
  lastWeek,
  lastSevenDays,
  lastMonth,
  bytesToMb,
  stressLog,
  readCsvFile,
  generateSlug,
  isValidJsonString,
  replaceAll,
  replaceAllMultiple,
  currentTimeMinusTwentyMinutes,
  parseJson,
  validJsonString,
  IsJsonString,
  sortData,
  waitForTime,
  isCorrectFormat,
  isBothArraySame
}
