'use strict'

const Schmervice = require('schmervice')

const errorHelper = require('@utilities/error-helper')
const User = require('@models/user.model').schema
const Question = require('@models/question.model').schema

const VirtuousLabel = require('@models/virtuouslabel.model').schema
const Datasheet = require('@models/datasheet.model').schema
const ModelCard = require('@models/modelcard.model').schema

const Answer = require('@models/answer.model').schema

const Activitylog = require('@models/activitylog.model').schema
const UserLog = require('@models/userlog.model').schema
const Advisoryplan = require('@models/advisoryplan.model').schema
const Dataset = require('@models/pipeline-dataset.model').schema
const InsightPaymentUser = require('@models/insight-payment-user.model').schema
const moment = require('moment')
const template = require('@utilities/templates')

const Helper = require('@utilities/helper')

const currentYearDates = Helper.currentYear()
const monthNameArray = Helper.currentYearMonthNames()
const wreck = require('@hapi/wreck')
const config = require('config')
const _ = require('lodash')
const requestMethod = require('request')
const { DateTime } = require('luxon')

module.exports = class HomeService extends Schmervice.Service {
  async entry() {
    return true
  }

  getNullValuesObject(obj) {
    for (const propName in obj) {
      if (obj[propName] !== null) {
        delete obj[propName]
      }
    }
    return obj
  }

  makingRegularArr(predictedLabels) {
    const regularArr = []
    predictedLabels.forEach(e => {
      e.forEach(element => {
        regularArr.push(element)
      })
    })
    return regularArr
  }

  async checkAutoDetectChunk(dataset) {
    const doAuto = async res => {
      return Promise.all(
        res.map(async data => {
          const columnsArr = []
          data.forEach(e => {
            columnsArr.push([e])
          })
          return await this.checkAutoDetect(columnsArr)
        })
      )
    }
    const pipeline = await Pipeline.find({
      _id: dataset.pipeline,
    })
    const { server } = this
    const { recommendedService } = server.services()
    if (pipeline && pipeline.columnNames && pipeline.columnNames.length) {
      const columns = _.chunk(pipeline.columnNames, 5)
      const promiseRes = await doAuto(columns)
      const predictedLabels = []
      if (promiseRes && promiseRes.length) {
        promiseRes.forEach(response => {
          if (
            response &&
            response.predictions &&
            response.predictions.length
          ) {
            predictedLabels.push(
              this.makeLogicForAutoDetect(response.predictions)
            )
          }
        })
        const finalRes = this.makingRegularArr(predictedLabels)
        const checkWithNullArr = []
        for (let index = 0; index < pipeline.columnNames.length; index++) {
          if (
            Helper.inArray(
              pipeline.columnNames[index],
              pipeline.columnNames
            )
          ) {
            checkWithNullArr.push(null)
          } else {
            checkWithNullArr.push(pipeline.columnLabels[index])
          }
        }
        for (let index = 0; index < finalRes.length; index++) {
          const newIndex = checkWithNullArr.findIndex(f => f === null)
          if (newIndex !== -1) {
            checkWithNullArr[newIndex] = finalRes[index]
          }
        }
        recommendedService.protectedColumnLabels(
          dataset.pipeline
        )
        return await Pipeline.findOneAndUpdate(
          { _id: pipeline._id },
          { columnLabels: checkWithNullArr },
          { new: true }
        )
      }
      errorHelper.handleError({
        status: 400,
        code: 'bad_request',
        message: 'Auto detect api response not found'
      })
    }
    errorHelper.handleError({
      status: 400,
      code: 'bad_request',
      message: 'Columns not found'
    })
  }

  async checkAutoDetect(data) {
    const options = {
      headers: {
        'content-type': `application/json`
      },
      payload: {
        signature_name: 'serving_default',
        instances: data
      }
    }
    console.log(
      'config.constants.modelsEndPoints.autoDetect: ',
      config.constants.modelsEndPoints.autoDetect
    )
    const promise = wreck.request(
      'post',
      config.constants.modelsEndPoints.autoDetect,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  }

  makeLogicForAutoDetect(dataArr) {
    const outputArr = []
    const sequenceArr = ['Output', 'Input', 'Protected']
    dataArr.forEach(element => {
      const index = element.findIndex(f => f === Math.max(...element))
      outputArr.push(sequenceArr[index] ? sequenceArr[index] : null)
    })
    return outputArr
  }

  async getAdminDemographics() {
    try {
      const response = await Activitylog.aggregate([
        {
          $lookup: {
            from: 'ipdatas',
            localField: 'ip',
            foreignField: '_id',
            as: 'ipData'
          }
        },
        {
          $unwind: '$ipData'
        },
        {
          $match: {
            'ipData.country': { $ne: '' },
            'ipData.countryCode3': { $ne: '' }
          }
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1
            },
            data: {
              $push: '$$ROOT'
            }
          }
        },
        { $unwind: '$data' },
        {
          $group: {
            _id: {
              code: '$data.ipData.countryCode3',
              country: '$data.ipData.country'
            },
            countryLogs: {
              $sum: 1
            },
            totalLogs: { $first: '$count' }
          }
        },
        {
          $project: {
            _id: 0,
            name: '$_id.country',
            code: '$_id.code',
            // totalLogs: 1,
            // countryLogs: 1,
            value: {
              $multiply: [{ $divide: ['$countryLogs', '$totalLogs'] }, 100]
            }
          }
        },
        {
          $sort: {
            value: -1
          }
        }
      ])
      return response
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getCountAccountQuestionAnswer() {
    try {
      const apiArray = [
        this.getAccountsCount(),
        this.getQuestionsCount(),
        this.getAnswersCount()
      ]
      const resPromise = await Promise.all(apiArray)

      return {
        accountCount: resPromise[0],
        questionCount: resPromise[1],
        answerCount: resPromise[2]
      }
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getAccountsCount() {
    try {
      const response = await User.find({ isDeleted: false }).countDocuments()
      return response
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getQuestionsCount() {
    try {
      const response = await Question.find({}).countDocuments()
      return response
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getAnswersCount() {
    try {
      const response = await Answer.find({}).countDocuments()
      return response
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getLineChartData() {
    try {
      const apiArray = [
        this.getQuestionsCurrentYearData(),
        this.getAnswersCurrentYearData(),
        this.getUsersCurrentYearData()
      ]
      const resPromise = await Promise.all(apiArray)
      return {
        question: resPromise[0],
        answer: resPromise[1],
        users: resPromise[2]
      }
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getQuestionsCurrentYearData() {
    try {
      const response = await Question.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYearDates.from),
              $lte: new Date(currentYearDates.to)
            }
          }
        },
        {
          $project: {
            month: { $month: '$createdAt' }
          }
        },
        {
          $group: {
            _id: { month: '$month' },
            count: {
              $sum: 1
            }
          }
        },
        {
          $project: {
            monthName: {
              $let: {
                vars: {
                  monthsInString: [...monthNameArray]
                },
                in: {
                  $arrayElemAt: ['$$monthsInString', '$_id.month']
                }
              }
            },
            month: '$_id.month',
            totalCount: '$count',
            _id: 0
          }
        },
        {
          $sort: {
            month: 1
          }
        }
      ])

      return response
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getAnswersCurrentYearData() {
    try {
      const response = await Answer.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYearDates.from),
              $lte: new Date(currentYearDates.to)
            }
          }
        },
        {
          $project: {
            month: { $month: '$createdAt' }
          }
        },
        {
          $group: {
            _id: { month: '$month' },
            count: {
              $sum: 1
            }
          }
        },
        {
          $project: {
            monthName: {
              $let: {
                vars: {
                  monthsInString: [...monthNameArray]
                },
                in: {
                  $arrayElemAt: ['$$monthsInString', '$_id.month']
                }
              }
            },
            month: '$_id.month',
            totalCount: '$count',
            _id: 0
          }
        },
        {
          $sort: {
            month: 1
          }
        }
      ])

      return response
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getUsersCurrentYearData() {
    try {
      const response = await User.aggregate([
        {
          $match: {
            isDeleted: false,
            createdAt: {
              $gte: new Date(currentYearDates.from),
              $lte: new Date(currentYearDates.to)
            }
          }
        },
        {
          $project: {
            month: { $month: '$createdAt' }
          }
        },
        {
          $group: {
            _id: { month: '$month' },
            count: {
              $sum: 1
            }
          }
        },
        {
          $project: {
            monthName: {
              $let: {
                vars: {
                  monthsInString: [...monthNameArray]
                },
                in: {
                  $arrayElemAt: ['$$monthsInString', '$_id.month']
                }
              }
            },
            month: '$_id.month',
            totalCount: '$count',
            _id: 0
          }
        },
        {
          $sort: {
            month: 1
          }
        }
      ])

      return response
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getTableData() {
    try {
      const apiArray = [
        this.getQuestionsCurrentYearTableData(),
        this.getAnswersCurrentYearTableData(),
        this.getUsersCurrentYearTableData(),
        this.getActiveUsersCurrentYearTableData(),
        this.getActiveSubscriptionsCurrentYearTableData()
      ]
      const resPromise = await Promise.all(apiArray)
      return {
        question: resPromise[0],
        answer: resPromise[1],
        users: resPromise[2],
        activeusers: resPromise[3],
        activeSubscription: resPromise[4]
      }
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getActiveUsersCurrentYearTableData() {
    try {
      const response = await UserLog.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYearDates.from),
              $lte: new Date(currentYearDates.to)
            }
          }
        },
        {
          $project: {
            user: 1,
            month: { $month: '$createdAt' },
            weekOfMonth: {
              $switch: {
                branches: [
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$createdAt' }, 1] },
                        { $lte: [{ $dayOfMonth: '$createdAt' }, 7] }
                      ]
                    },
                    then: 1
                  },
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$createdAt' }, 8] },
                        { $lte: [{ $dayOfMonth: '$createdAt' }, 14] }
                      ]
                    },
                    then: 2
                  },
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$createdAt' }, 15] },
                        { $lte: [{ $dayOfMonth: '$createdAt' }, 21] }
                      ]
                    },
                    then: 3
                  }
                ],
                default: 4
              }
            }
          }
        },
        {
          $group: {
            _id: { month: '$month', week: '$weekOfMonth' },
            count: {
              $sum: 1
            },
            usersUniqueArray: {
              $addToSet: '$user'
            }
          }
        },
        {
          $project: {
            monthName: {
              $let: {
                vars: {
                  monthsInString: [...monthNameArray]
                },
                in: {
                  $arrayElemAt: ['$$monthsInString', '$_id.month']
                }
              }
            },
            month: '$_id.month',
            weekOfMonth: '$_id.week',
            totalCount: { $size: '$usersUniqueArray' },
            _id: 0
          }
        },
        {
          $sort: {
            month: 1,
            weekOfMonth: 1
          }
        }
      ])
      return response
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getActiveSubscriptionsCurrentYearTableData() {
    try {
      const response = await Advisoryplan.aggregate([
        {
          $match: {
            startDate: {
              $gte: new Date(currentYearDates.from),
              $lte: new Date(currentYearDates.to)
            }
          }
        },
        {
          $project: {
            user: 1,
            month: { $month: '$startDate' },
            weekOfMonth: {
              $switch: {
                branches: [
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$startDate' }, 1] },
                        { $lte: [{ $dayOfMonth: '$startDate' }, 7] }
                      ]
                    },
                    then: 1
                  },
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$startDate' }, 8] },
                        { $lte: [{ $dayOfMonth: '$startDate' }, 14] }
                      ]
                    },
                    then: 2
                  },
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$startDate' }, 15] },
                        { $lte: [{ $dayOfMonth: '$startDate' }, 21] }
                      ]
                    },
                    then: 3
                  }
                ],
                default: 4
              }
            }
          }
        },
        {
          $group: {
            _id: { month: '$month', week: '$weekOfMonth' },
            count: {
              $sum: 1
            },
            usersUniqueArray: {
              $addToSet: '$user'
            }
          }
        },
        {
          $project: {
            monthName: {
              $let: {
                vars: {
                  monthsInString: [...monthNameArray]
                },
                in: {
                  $arrayElemAt: ['$$monthsInString', '$_id.month']
                }
              }
            },
            month: '$_id.month',
            weekOfMonth: '$_id.week',
            totalCount: { $size: '$usersUniqueArray' },
            _id: 0
          }
        },
        {
          $sort: {
            month: 1,
            weekOfMonth: 1
          }
        }
      ])
      return response
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getQuestionsCurrentYearTableData() {
    try {
      const response = await Question.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYearDates.from),
              $lte: new Date(currentYearDates.to)
            }
          }
        },
        {
          $project: {
            month: { $month: '$createdAt' },
            weekOfMonth: {
              $switch: {
                branches: [
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$createdAt' }, 1] },
                        { $lte: [{ $dayOfMonth: '$createdAt' }, 7] }
                      ]
                    },
                    then: 1
                  },
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$createdAt' }, 8] },
                        { $lte: [{ $dayOfMonth: '$createdAt' }, 14] }
                      ]
                    },
                    then: 2
                  },
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$createdAt' }, 15] },
                        { $lte: [{ $dayOfMonth: '$createdAt' }, 21] }
                      ]
                    },
                    then: 3
                  }
                ],
                default: 4
              }
            }
          }
        },
        {
          $group: {
            _id: { month: '$month', week: '$weekOfMonth' },
            count: {
              $sum: 1
            }
          }
        },
        {
          $project: {
            monthName: {
              $let: {
                vars: {
                  monthsInString: [...monthNameArray]
                },
                in: {
                  $arrayElemAt: ['$$monthsInString', '$_id.month']
                }
              }
            },
            month: '$_id.month',
            weekOfMonth: '$_id.week',
            totalCount: '$count',
            _id: 0
          }
        },
        {
          $sort: {
            month: 1,
            weekOfMonth: 1
          }
        }
      ])

      return response
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getAnswersCurrentYearTableData() {
    try {
      const response = await Answer.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYearDates.from),
              $lte: new Date(currentYearDates.to)
            }
          }
        },
        {
          $project: {
            month: { $month: '$createdAt' },
            weekOfMonth: {
              $switch: {
                branches: [
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$createdAt' }, 1] },
                        { $lte: [{ $dayOfMonth: '$createdAt' }, 7] }
                      ]
                    },
                    then: 1
                  },
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$createdAt' }, 8] },
                        { $lte: [{ $dayOfMonth: '$createdAt' }, 14] }
                      ]
                    },
                    then: 2
                  },
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$createdAt' }, 15] },
                        { $lte: [{ $dayOfMonth: '$createdAt' }, 21] }
                      ]
                    },
                    then: 3
                  }
                ],
                default: 4
              }
            }
          }
        },
        {
          $group: {
            _id: { month: '$month', week: '$weekOfMonth' },
            count: {
              $sum: 1
            }
          }
        },
        {
          $project: {
            monthName: {
              $let: {
                vars: {
                  monthsInString: [...monthNameArray]
                },
                in: {
                  $arrayElemAt: ['$$monthsInString', '$_id.month']
                }
              }
            },
            month: '$_id.month',
            weekOfMonth: '$_id.week',
            totalCount: '$count',
            _id: 0
          }
        },
        {
          $sort: {
            month: 1,
            weekOfMonth: 1
          }
        }
      ])

      return response
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getUsersCurrentYearTableData() {
    try {
      const response = await User.aggregate([
        {
          $match: {
            isDeleted: false,
            createdAt: {
              $gte: new Date(currentYearDates.from),
              $lte: new Date(currentYearDates.to)
            }
          }
        },
        {
          $project: {
            month: { $month: '$createdAt' },
            weekOfMonth: {
              $switch: {
                branches: [
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$createdAt' }, 1] },
                        { $lte: [{ $dayOfMonth: '$createdAt' }, 7] }
                      ]
                    },
                    then: 1
                  },
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$createdAt' }, 8] },
                        { $lte: [{ $dayOfMonth: '$createdAt' }, 14] }
                      ]
                    },
                    then: 2
                  },
                  {
                    case: {
                      $and: [
                        { $gte: [{ $dayOfMonth: '$createdAt' }, 15] },
                        { $lte: [{ $dayOfMonth: '$createdAt' }, 21] }
                      ]
                    },
                    then: 3
                  }
                ],
                default: 4
              }
            }
          }
        },
        {
          $group: {
            _id: { month: '$month', week: '$weekOfMonth' },
            count: {
              $sum: 1
            }
          }
        },
        {
          $project: {
            monthName: {
              $let: {
                vars: {
                  monthsInString: [...monthNameArray]
                },
                in: {
                  $arrayElemAt: ['$$monthsInString', '$_id.month']
                }
              }
            },
            month: '$_id.month',
            weekOfMonth: '$_id.week',
            totalCount: '$count',
            _id: 0
          }
        },
        {
          $sort: {
            month: 1,
            weekOfMonth: 1
          }
        }
      ])

      return response
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getAllDashboardData() {
    try {
      const apiArray = [
        this.getAdminDemographics(),
        this.getCountAccountQuestionAnswer(),
        this.getLineChartData(),
        this.getTableData()
      ]
      const resPromise = await Promise.all(apiArray)
      if (resPromise) {
        return {
          demographicData: resPromise[0],
          allCountData: resPromise[1],
          lineChartData: resPromise[2],
          tableData: resPromise[3]
        }
      } else {
        return null
      }
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getPublishedVirtuousLabels() {
    try {
      return await VirtuousLabel.find({ isPublished: true })
        .sort({ updatedAt: -1 })
        .populate({ path: 'user', select: 'userName profileImage firstName lastName' })
        .lean()
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getPublishedDataSheets() {
    try {
      return await Datasheet.find({ isPublished: true })
        .sort({ updatedAt: -1 })
        .populate({ path: 'user', select: 'userName profileImage firstName lastName' })
        .lean()
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getPublishedModelCards() {
    try {
      return await ModelCard.find({ isPublished: true })
        .sort({ updatedAt: -1 })
        .populate({ path: 'user', select: 'userName profileImage firstName lastName' })
        .lean()
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getCountries() {
    try {
      return await User.aggregate([
        {
          $group: {
            _id: { country: '$ipDetails.country' }
          }
        }
      ])
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async adminUserDashboard(request) {
    try {
      const queryParams = request.query
      console.log('queryParams: ', queryParams)
      const query = {}
      if (queryParams.platform) {
        query.isRegFromModerationSite =
          queryParams.platform === 'MODERATION' ? true : { $ne: true }
      }
      if (queryParams.fromDate && queryParams.toDate) {
        query.createdAt = {
          $gte: new Date(
            moment(moment.utc(queryParams.fromDate))
              .startOf('day')
              .toISOString()
          ),
          $lte: new Date(
            moment(moment.utc(queryParams.toDate))
              .endOf('day')
              .toISOString()
          )
        }
      }
      if (queryParams.fromDate && !queryParams.toDate) {
        query.createdAt = {
          $gte: new Date(
            moment(moment.utc(queryParams.fromDate))
              .startOf('day')
              .toISOString()
          )
        }
      }
      if (!queryParams.fromDate && queryParams.toDate) {
        query.createdAt = {
          $lte: new Date(
            moment(moment.utc(queryParams.toDate))
              .endOf('day')
              .toISOString()
          )
        }
      }
      const aggregateQuery = [
        {
          $match: {
            ...query,
            email: { $not: /.*webfirminfotech*/ },
            isSeed: false,
            isDeleted: false
          }
        },
        {
          $lookup: {
            from: 'insight-payment-users',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$user', '$$userId'] },
                      { $eq: ['$isActive', true] }
                    ]
                  }
                }
              },
              { $project: { slug: 1 } }
            ],
            as: 'activePlan'
          }
        },
        {
          $unwind: {
            path: '$activePlan',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'user-analytics',
            localField: '_id',
            foreignField: 'user',
            as: 'fullAnalytics'
          }
        },
        {
          $lookup: {
            from: 'pipelines',
            localField: '_id',
            foreignField: 'user',
            as: 'userPipelines'
          }
        },
        {
          $addFields: {
            userPipelinesCount: {
              $size: {
                $filter: {
                  input: "$userPipelines.isDeleted",
                  as: "temp",
                  cond: { $eq: ["$$temp", false] }
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'pipeline-datasets',
            localField: '_id',
            foreignField: 'user',
            as: 'userDatasets'
          }
        },
        {
          $addFields: {
            userDatasetsCount: {
              $size: "$userDatasets"
            }
          }
        },
        {
          $lookup: {
            from: 'explainability-models',
            localField: '_id',
            foreignField: 'user',
            as: 'userExModels'
          }
        },
        {
          $addFields: {
            userExModelsCount: {
              $size: "$userExModels"
            }
          }
        },
        {
          $lookup: {
            from: 'moderation-models',
            localField: '_id',
            foreignField: 'user',
            as: 'moderationModel'
          }
        },
        {
          $addFields: {
            moderationModelsCount: {
              $size: "$moderationModel"
            }
          }
        }
      ]
      if (queryParams.analytics) {
        if (JSON.parse(queryParams.analytics) && JSON.parse(queryParams.analytics).length) {
          JSON.parse(queryParams.analytics).forEach((event) => {
            let key = "analytics." + ((event).split('_')).slice(1, (event).split('_').length - 1).join('-')
            let object = { $addFields: {} }
            object.$addFields[`${key}`] = {
              $size: {
                $filter: {
                  input: "$fullAnalytics.event",
                  as: "testScriptArr",
                  cond: { $eq: ["$$testScriptArr", `${event}`] }
                }
              }
            }
            aggregateQuery.push(object)
          })
        }
      }
      if (queryParams.sortBy && queryParams.sortType) {
        aggregateQuery.push({
          $sort: {
            [queryParams.sortBy]: queryParams.sortType === 'ASC' ? 1 : -1
          }
        })
      } else {
        aggregateQuery.push({ $sort: { createdAt: -1 } })
      }
      if (queryParams.plan) {
        aggregateQuery.push({
          $match: {
            'activePlan.slug': queryParams.plan
          }
        })
      }
      if (queryParams.country) {
        aggregateQuery.push({
          $match: {
            'ipDetails.country': queryParams.country
          }
        })
      }
      if (queryParams.search) {
        var searchQuery = []
        var search = queryParams.search.split(' ')
        const searchableFields = ['email', 'firstName', 'lastName']
        searchableFields.forEach(field => {
          search.forEach(se => {
            searchQuery.push({
              [field]: {
                $regex: se,
                $options: 'i'
              }
            })
          })
        })
        if (searchQuery && searchQuery.length) {
          aggregateQuery.push({
            $match: {
              $or: searchQuery
            }
          })
        }
      }
      const countQuery = [
        ...aggregateQuery,
        { $group: { _id: null, totalCount: { $sum: 1 } } }
      ]
      const limit = queryParams && queryParams.limit ? +queryParams.limit : 10
      let skip = 0
      let page = 1
      let hasMany = null
      if (
        queryParams.page !== undefined &&
        queryParams.page !== '' &&
        queryParams.page !== null
      ) {
        page = parseInt(queryParams.page)
        skip = (parseInt(page) - 1) * parseInt(limit)
      }
      aggregateQuery.push({ $skip: skip })
      aggregateQuery.push({ $limit: limit })
      aggregateQuery.push({
        $project: {
          email: 1,
          _id: 1,
          userName: 1,
          firstName: 1,
          lastName: 1,
          activePlan: 1,
          isRegFromModerationSite: 1,
          createdAt: 1,
          lastActiveAt: 1,
          ipDetails: 1,
          analytics: 1,
          userPipelinesCount: 1,
          userDatasetsCount: 1,
          userExModelsCount: 1,
          emailVerified: 1,
          moderationModelsCount: 1,
          source: 1
        }
      })
      const result = await User.aggregate(aggregateQuery)
        .allowDiskUse(true)
        .exec()
      const totalCountResult = await User.aggregate(countQuery)
        .allowDiskUse(true)
        .exec()

      if (skip + result.length >= totalCountResult) {
        hasMany = false
      } else {
        hasMany = true
      }
      console.log('result: ', result);
      return {
        list: result,
        count: result.length,
        total: totalCountResult[0] ? totalCountResult[0].totalCount : 0,
        hasMany: hasMany,
        from: skip + 1,
        to: skip + result.length
      }
    } catch (e) {
      errorHelper.handleError(e)
    }
  }

  async adminUserChart(request) {
    try {
      const queryParams = request.query
      const query = {
        isDeleted: false
      }
      if (queryParams.from && queryParams.to) {
        query.createdAt = {
          $gte: new Date(queryParams.from),
          $lte: new Date(queryParams.to)
        }
      }
      if (queryParams.from && !queryParams.to) {
        query.createdAt = {
          $gte: new Date(queryParams.from)
        }
      }
      if (!queryParams.from && queryParams.to) {
        query.createdAt = {
          $lte: new Date(queryParams.to)
        }
      }
      const response = await User.aggregate([
        {
          $match: {
            ...query,
            email: { $not: /.*webfirminfotech*/ },
            isSeed: false,

          }
        },
        {
          $project: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
            isRegFromModerationSite: '$isRegFromModerationSite'
          }
        },
        {
          $group: {
            _id: { year: '$year', month: '$month' },
            count: {
              $sum: 1
            },
            data: {
              $push: '$$ROOT'
            }
          }
        },
        {
          $project: {
            moderationSite: {
              $filter: {
                input: '$data',
                as: 'moderationSite',
                cond: {
                  $and: [
                    { $eq: ['$$moderationSite.isRegFromModerationSite', true] }
                  ]
                }
              }
            },
            mainSite: {
              $filter: {
                input: '$data',
                as: 'mainSite',
                cond: {
                  $and: [{ $eq: ['$$mainSite.isRegFromModerationSite', false] }]
                }
              }
            },
            totalCount: '$count'
          }
        },
        {
          $project: {
            month: '$_id.month',
            year: '$_id.year',
            data: '$data',
            moderationSite: {
              $size: '$moderationSite'
            },
            mainSite: {
              $size: '$mainSite'
            },
            totalCount: '$totalCount',
            _id: 0
          }
        },
        {
          $sort: {
            year: 1,
            month: 1
          }
        }
      ])
      return response
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async sendMailToAdmin(user) {
    try {
      if (config.mode !== 'default') {
        if (user && user.email) {
          for (let index = 0; index < config.newSignUpEmails.length; index++) {
            const mailObj = {
              to: config.newSignUpEmails[index],
              subject: `New user is signed up`,
              html: template.commonTemplate({
                title: `Hello ,`,
                message: `
                New user is signed up here is the details <br> 
                Name : ${user.firstName} <br>
                Email : ${user.email} <br>
                Platform : ${user.isRegFromModerationSite ? 'Moderation' : 'Insight'
                  }
                `
              })
            }
            await Helper.sendEmail(mailObj)
          }
        }
      }
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async sendVerificationEmailToUser(user) {
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
          } href=${user.isRegFromModerationSite
            ? config.console_moderation_url
            : config.console_url
          }/auth/verify-account/${id} target="_blank">here</a> to verify your account.`
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
    return res
  }

  async sendVerificationEmailToInactiveUser(user) {
    const emailHash = await User.generateHash()
    user.emailToken = emailHash.hash
    await User.findOneAndUpdate(
      { email: user.email },
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
      subject: `Reactivate Your Account`,
      html: template.commonTemplate({
        title: `Welcome ${user.firstName} ${user.lastName},`,
        message: `
      Click <a style=${template.linkStyle
          } href=${user.isRegFromModerationSite
            ? config.console_moderation_url
            : config.console_url
          }/auth/verify-inactive-account/${id} target="_blank">here</a> to reactivate your account.`
      })
    }
    const res = await Helper.sendEmail(mailObj)
    return user.save()
  }

  getIpDetails(ip) {
    return new Promise(resolve => {
      requestMethod.post(
        `http://www.geoplugin.net/json.gp?ip=${ip}`,
        (error, response, body) => {
          if (!error && response.statusCode === 200) {
            const result = JSON.parse(body)
            resolve(result)
          } else {
            resolve(null)
          }
        }
      )
    })
  }

  async addIpDetails(user) {
    try {
      if (user && user.regIpAddress) {
        const res = await this.getIpDetails(user.regIpAddress)
        console.log('ip info user reg: ', res)
        if (
          res &&
          res.geoplugin_countryName &&
          res.geoplugin_countryCode &&
          res.geoplugin_regionName
        ) {
          await User.findOneAndUpdate(
            {
              _id: user._id
            },
            {
              ipDetails: {
                country: res.geoplugin_countryName,
                countryCode: res.geoplugin_countryCode,
                state: res.geoplugin_regionName
              }
            }
          )
        }
      }
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async adminCounts(userId) {
    try {
      const user = await User.findOne({ _id: userId })
      if (user && user.privilege && user.privilege.isAdmin) {
        const date = moment()
          .subtract(30, 'days')
          .startOf('day')
          .toISOString()
        console.log('date: ', date)
        const users = {
          moderationActiveUsers: 0,
          moderationTotalUsers: 0,
          insightActiveUsers: 0,
          insightTotalUsers: 0
        }
        users.moderationActiveUsers = await User.find({
          isRegFromModerationSite: true,
          lastActiveAt: { $gte: new Date(date) },
          email: { $not: /.*webfirminfotech*/ },
          isSeed: false,
          isDeleted: false
        }).count()
        users.moderationTotalUsers = await User.find({
          isRegFromModerationSite: true,
          email: { $not: /.*webfirminfotech*/ },
          isSeed: false,
          isDeleted: false
        }).count()
        users.insightActiveUsers = await User.find({
          isRegFromModerationSite: false,
          lastActiveAt: { $gte: new Date(date) },
          email: { $not: /.*webfirminfotech*/ },
          isSeed: false,
          isDeleted: false
        }).count()
        users.insightTotalUsers = await User.find({
          isRegFromModerationSite: false,
          email: { $not: /.*webfirminfotech*/ },
          isSeed: false,
          isDeleted: false
        }).count()

        const plans = {
          totalFree: 0,
          activeFree: 0,
          totalBasic: 0,
          activeBasic: 0,
          totalPremium: 0,
          activePremium: 0
        }

        const totalFree = await InsightPaymentUser.aggregate([
          {
            $match: {
              isActive: true,
              slug: 'FREE'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'fullUser'
            }
          },
          {
            $unwind: '$fullUser'
          },
          {
            $match: {
              'fullUser.email': { $not: /.*webfirminfotech*/ },
              'fullUser.isSeed': false,
              'fullUser.isDeleted': false
            }
          },
          {
            $count: 'record'
          }
        ])
        const totalBasic = await InsightPaymentUser.aggregate([
          {
            $match: {
              isActive: true,
              slug: 'BASIC'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'fullUser'
            }
          },
          {
            $unwind: '$fullUser'
          },
          {
            $match: {
              'fullUser.email': { $not: /.*webfirminfotech*/ },
              'fullUser.isSeed': false,
              'fullUser.isDeleted': false
            }
          },
          {
            $count: 'record'
          }
        ])
        const totalPremium = await InsightPaymentUser.aggregate([
          {
            $match: {
              isActive: true,
              slug: 'PREMIUM'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'fullUser'
            }
          },
          {
            $unwind: '$fullUser'
          },
          {
            $match: {
              'fullUser.email': { $not: /.*webfirminfotech*/ },
              'fullUser.isSeed': false,
              'fullUser.isDeleted': false
            }
          },
          {
            $count: 'record'
          }
        ])
        const activeFree = await InsightPaymentUser.aggregate([
          {
            $match: {
              isActive: true,
              slug: 'FREE'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'fullUser'
            }
          },
          {
            $unwind: '$fullUser'
          },
          {
            $match: {
              'fullUser.email': { $not: /.*webfirminfotech*/ },
              'fullUser.isSeed': false,
              'fullUser.lastActiveAt': { $gte: new Date(date) },
              'fullUser.isDeleted': false
            }
          },
          {
            $count: 'record'
          }
        ])
        const activeBasic = await InsightPaymentUser.aggregate([
          {
            $match: {
              isActive: true,
              slug: 'BASIC'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'fullUser'
            }
          },
          {
            $unwind: '$fullUser'
          },
          {
            $match: {
              'fullUser.email': { $not: /.*webfirminfotech*/ },
              'fullUser.isSeed': false,
              'fullUser.lastActiveAt': { $gte: new Date(date) },
              'fullUser.isDeleted': false
            }
          },
          {
            $count: 'record'
          }
        ])
        const activePremium = await InsightPaymentUser.aggregate([
          {
            $match: {
              isActive: true,
              slug: 'PREMIUM'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'fullUser'
            }
          },
          {
            $unwind: '$fullUser'
          },
          {
            $match: {
              'fullUser.email': { $not: /.*webfirminfotech*/ },
              'fullUser.isSeed': false,
              'fullUser.lastActiveAt': { $gte: new Date(date) },
              'fullUser.isDeleted': false
            }
          },
          {
            $count: 'record'
          }
        ])
        plans.activeFree =
          activeFree && activeFree.length ? activeFree[0].record : 0
        plans.activeBasic =
          activeBasic && activeBasic.length ? activeBasic[0].record : 0
        plans.activePremium =
          activePremium && activePremium.length ? activePremium[0].record : 0
        plans.totalFree =
          totalFree && totalFree.length ? totalFree[0].record : 0
        plans.totalBasic =
          totalBasic && totalBasic.length ? totalBasic[0].record : 0
        plans.totalPremium =
          totalPremium && totalPremium.length ? totalPremium[0].record : 0
        return { plans, users, date }
      } else {
        console.log('User is not admin.')
      }
    } catch (err) {
      errorHelper.handleError(err)
    }
  }
}
