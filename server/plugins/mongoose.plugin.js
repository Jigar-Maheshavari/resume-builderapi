'use strict'

const db = require('mongoose')
const Glob = require('glob')
const UserInvokeTable = require('@utilities/user-invoke-table')

db.Promise = require('bluebird')

let aiDBConn = null

exports.plugin = {
  async register(server, options) {
    try {
      db.set('useFindAndModify', false)
      aiDBConn = await db.createConnection(options.connections.db, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })

      // When the connection is connected
      aiDBConn.on('connected', () => {
        server.log(['mongoose', 'info'], 'aiDBConn Mongo Database connected')
      })

      // When the connection is disconnected
      aiDBConn.on('disconnected', () => {
        server.log(['mongoose', 'info'], 'aiDBConn Mongo Database disconnected')
      })

      /**
       * Insert Default permissions
       */
      const Permission = require('@models/permission.model').schema
      const permissions = await Permission.find({})
      if (permissions.length === 0) {
        const { PERMISSIONS } = require('@utilities/permissions')
        await Permission.insertMany(PERMISSIONS)
      }

      /**
       * Insert Default role
       */
      const Role = require('@models/role.model').schema
      const role = await Role.find({})
      if (role.length === 0) {
        const { PERMISSIONS } = require('@utilities/permissions')
        await Role.create({
          name: 'Super Admin',
          permission: PERMISSIONS
        })
      }

      /**
       * Insert Default subscription
       */
      const SubscriptionMaster = require('@models/subscriptionmaster.model')
        .schema
      const subscriptionMaster = await SubscriptionMaster.find({})
      if (subscriptionMaster.length === 0) {
        const subscriptions = [
          {
            _id: 'privacy_pack',
            title: 'Privacy Pack',
            price: 3,
            size: 50,
            sizeUnit: 'GB'
          },
          {
            _id: 'standard_pack',
            title: 'Standard',
            price: 5,
            size: 100,
            sizeUnit: 'GB'
          },
          {
            _id: 'premium_pack',
            title: 'Premium',
            price: 15,
            size: 2,
            sizeUnit: 'TB'
          }
        ]
        await SubscriptionMaster.insertMany(subscriptions)
      }

      const Recommended = require('@models/recommended.model').schema
      const recommended = await Recommended.find({})
      if (recommended.length === 0) {
        // const { server } = this
        // const { recommendedService } = server.services()
        // await recommendedService.createRecommendedForMongoose()
        await Recommended.create({
          title: 'Train whitebox model',
          category: 'EXPLAINABLE AI',
          slug: 'TRAIN_WHITEBOX_MODEL',
          taskInfo: 'Check to see if there is a functional model in the whitebox model list',
          points: 10,
          order : 0 
        })
  
        await Recommended.create({
          title: 'Add More Protected Attributes',
          category: 'FAIR AI',
          slug: 'ADD_MORE_PROTECTED_ATTRIBUTES',
          taskInfo: 'Check to see if they have each of the protected attributes categories.',
          columns: { Race: 5, Sex: 5, Gender: 5, Religion: 5, Disability: 5 },
          points: 25,
          order : 1 
        })
  
        await Recommended.create({
          title: 'Datasheet',
          category: 'RESPONSIBLE AI',
          slug: 'DATASHEET',
          taskInfo: 'For each pipeline, check to see if there are any datasheets published.',
          points: 10,
          order : 2 
        })
  
        await Recommended.create({
          title: 'Model Card',
          category: 'RESPONSIBLE AI',
          slug: 'MODEL_CARD',
          taskInfo: ' For each pipeline, check to see if there are any model cards published.',
          points: 10,
          order : 3 
        })
      }


      /**
       * Insert Default insight payment
       */
      const InsightPaymentMaster = require('@models/insight-payment-master.model')
        .schema
      const insightPaymentMaster = await InsightPaymentMaster.find({})
      if (insightPaymentMaster.length === 0) {
        await InsightPaymentMaster.insertMany([
          {
            subTitle: 'Sampler Package',
            description:
              '<div><font size="3">+ 200 MB Memory (1 Pipeline)</font></div><div><font size="3">+ Online Documentation</font></div><div><font size="3">+ Limited XAI API&#160;</font></div><div><font size="3">+ Limited Widget Access&#160;</font></div>',
            slug: 'FREE',
            isActive: true,
            trailDays: 0,
            pricePerMonth: 0,
            pricePerYear: 0,
            isUnlimitedPipeline: false,
            noOfPipeline: 1,
            adviceSessions: 0,
            dataSetStorage: 200,
            isUnlimitedExpCount: false,
            reqCountOfExplainability: 10,
            title: 'Free'
          },
          {
            subTitle: 'Analytics Package',
            description:
              '<div><font size="3">+2 GB Memory (unlimited pipelines)<br></font></div><div><div><font size="3">+ Custom Ethics Scoring Widget</font></div><div><font size="3">+ Responsible AI Widget</font></div><div><font size="3">+ <b>EXPLAINABLE</b> AI WIDGET</font></div><div><font size="3">+ <b>BIAS MONITOR</b>&#160;</font></div></div>',
            slug: 'BASIC',
            isActive: true,
            trailDays: 3,
            pricePerMonth: 199.99,
            pricePerYear: 2399.88,
            isUnlimitedPipeline: true,
            noOfPipeline: 10000000000000,
            adviceSessions: 0,
            dataSetStorage: 2000,
            isUnlimitedExpCount: true,
            reqCountOfExplainability: 10000000000000,
            title: 'Insight Basic'
          },
          {
            subTitle: 'The Full Suite',
            description:
              '<div><font size="3">+ 10 GB Memory<br></font></div><div><div><font size="3">+ 3 expert<b> HUMAN-IN-LOOP</b> sessions&#160;</font></div><div><font size="3">+ Custom Ethics Scoring Widgets</font></div><div><font size="3">+ Responsibility Widget</font></div><div><font size="3">+ Explainable AI Widget&#160;</font></div><div><font size="3">+ Bias Monitor&#160;</font></div></div>',
            slug: 'PREMIUM',
            isActive: true,
            trailDays: 10,
            pricePerMonth: 399.99,
            pricePerYear: 4799.88,
            isUnlimitedPipeline: true,
            noOfPipeline: 10000000000000,
            adviceSessions: 3,
            dataSetStorage: 10000,
            isUnlimitedExpCount: true,
            reqCountOfExplainability: 10000000000000,
            title: 'Insight Premium'
          }
        ])
      }

      /**
       * Insert Default topics
       */
      const Topics = require('@models/topic.model').schema
      const topic = await Topics.find({})
      if (topic.length === 0) {
        const topics = [
          {
            title: 'General Q&A',
            description: 'General Q&A'
          },
          {
            title: 'How to Start',
            description: 'How to Start'
          },
          {
            title: 'Real-time Insight',
            description: 'Real-time Insight'
          }
        ]
        await Topics.insertMany(topics)
      }

      /**
       * Insert Default pipeline control panels
       */
      // const PipelineControl = require('@models/pipeline-control-panel.model')
      //   .schema
      // const pipelineControl = await PipelineControl.find({ type: 'DEFAULT' })
      // if (pipelineControl.length === 0) {
      //   const panelCreated = await PipelineControl.create({
      //     user: null,
      //     pipeline: null,
      //     name: 'Ethical',
      //     widgets: [],
      //     isPrivate: true,
      //     type: 'DEFAULT'
      //   })
      //   const PipelineWidget = require('@models/pipeline-widget.model').schema
      //   const pipelineWidget = await PipelineWidget.insertMany([
      //     {
      //       widgetName: 'Responsible',
      //       realtimeWidget: 'DATA_TRACKER',
      //       pipeline: null,
      //       controlPanel: panelCreated._id,
      //       dataSetSelected: [],
      //       dataSetFields: [],
      //       dataSet: null,
      //       staticWidget: 'SURVEY_WIDGET',
      //       question: [
      //         {
      //           queName: 'Is this Responsible?',
      //           queType: 'SINGLE_ANSWER',
      //           options: [
      //             { option: 'Yes', lowQueQuality: null, highQueQuality: null }
      //           ],
      //           isOptionOther: false,
      //           optionDescription: null
      //         }
      //       ]
      //     },
      //     {
      //       widgetName: 'Equitable',
      //       realtimeWidget: 'DATA_TRACKER',
      //       pipeline: null,
      //       controlPanel: panelCreated._id,
      //       dataSetSelected: [],
      //       dataSetFields: [],
      //       dataSet: null,
      //       staticWidget: 'SURVEY_WIDGET',
      //       question: [
      //         {
      //           queName: 'Is this Equitable?',
      //           queType: 'SINGLE_ANSWER',
      //           options: [
      //             { option: 'Yes', lowQueQuality: null, highQueQuality: null }
      //           ],
      //           isOptionOther: false,
      //           optionDescription: null
      //         }
      //       ]
      //     },
      //     {
      //       widgetName: 'Robust',
      //       realtimeWidget: 'DATA_TRACKER',
      //       pipeline: null,
      //       controlPanel: panelCreated._id,
      //       dataSetSelected: [],
      //       dataSetFields: [],
      //       dataSet: null,
      //       staticWidget: 'SURVEY_WIDGET',
      //       question: [
      //         {
      //           queName: 'Is this Robust?',
      //           queType: 'SINGLE_ANSWER',
      //           options: [
      //             { option: 'Yes', lowQueQuality: null, highQueQuality: null }
      //           ],
      //           isOptionOther: false,
      //           optionDescription: null
      //         }
      //       ]
      //     }
      //   ])
      //   await PipelineControl.findOneAndUpdate(
      //     {
      //       _id: panelCreated._id
      //     },
      //     {
      //       widgets: pipelineWidget.map(f => f._id)
      //     }
      //   )
      // }

      /**
       * Compile dynamic user model
       */
      const User = require('@models/user.model').schema
      const users = await User.find({})
      for (let index = 0; index < users.length; index++) {
        const user = users[index]
        const modelName = UserInvokeTable.userModerationModelName(user._id)
        aiDBConn.model(modelName, UserInvokeTable.userModerationSchema())
      }

      // server.decorate('server', 'virtuousai', aiDBConn)

      // If the node process ends, close the mongoose connection
      process.on('SIGINT', async () => {
        await aiDBConn.close()

        server.log(
          ['mongoose', 'info'],
          'Mongo Database disconnected through app termination'
        )
        process.exit(0)
      })

      // Load models
      const models = Glob.sync('server/models/*.js')
      models.forEach(model => {
        require(`${process.cwd()}/${model}`)
      })
    } catch (err) {
      console.log(err)
      throw err
    }
  },
  aiDBConn() {
    return aiDBConn
  },
  name: 'mongoose_connector',
  version: require('../../package.json').version
}
