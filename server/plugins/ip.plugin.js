'use strict'
const constStr = {
  login: 'LOGIN',
  add: 'ADD',
  update: 'UPDATE',
  delete: 'DELETE',
  like: 'LIKE',
  dislike: 'DISLIKE',
  flag: 'FLAG'
}

const getClientIp = request => {
  const ip =
    request.headers['x-real-ip'] ||
    request.headers['x-forwarded-for'] ||
    request.info.remoteAddress
  return ip
}

exports.plugin = {
  async register(server, options) {
    const prePath = '/api/v1'
    server.events.on('response', async request => {
      const ip = getClientIp(request)
      const { ipService } = request.server.services()
      const ipInfo = await ipService.getIpInfo(ip)
      const path = request.path
      const {
        response,
        route: { method, path: routePath },
        payload,
        params
      } = request
      let user
      if (
        request.auth &&
        request.auth.credentials &&
        request.auth.credentials.user
      ) {
        user = request.auth.credentials.user
      }
      const userId = user && user._id ? user._id : null
      let source = payload && payload.source ? payload.source : null
      // console.log(response.source, 'response.source')
      // login
      if (path === `${prePath}/login`) {
        const activityPayload = {
          user: userId,
          source: source,
          type: 'U',
          ip: ipInfo._id,
          activity: constStr.login
        }
        await ipService.saveActivity(activityPayload)
      }

      // question add/update/delete
      if (routePath === '/api/v1/questions' && method === 'post') {
        if (!source) {
          source =
            response && response.source && response.source._id
              ? response.source._id
              : null
        }
        const activityPayload = {
          user: userId,
          source: source,
          type: 'Q',
          ip: ipInfo._id,
          activity: constStr.add
        }
        await ipService.saveActivity(activityPayload)
      }

      // Answer add/update/delete
      if (routePath === '/api/v1/answers' && method === 'post') {
        if (!source) {
          source =
            response && response.source && response.source._id
              ? response.source._id
              : null
        }

        const activityPayload = {
          user: userId,
          source: source,
          type: 'A',
          ip: ipInfo._id,
          activity: constStr.add
        }
        await ipService.saveActivity(activityPayload)
      }

      if (routePath === '/api/v1/updateAnswer/{answerId}' && method === 'put') {
        if (!source) {
          source = params && params.answerId ? params.answerId : null
        }
        const activityPayload = {
          user: userId,
          source: source,
          type: 'A',
          ip: ipInfo._id,
          activity: constStr.update
        }
        await ipService.saveActivity(activityPayload)
      }

      // thread add/update/delete
      if (routePath === '/api/v1/thread' && method === 'post') {
        if (!source) {
          source =
            response && response.source && response.source._id
              ? response.source._id
              : null
        }
        let activityPayload
        if (payload.threadType === 'QUESTION') {
          activityPayload = {
            user: userId,
            source: source,
            type: 'TQ',
            ip: ipInfo._id,
            activity: constStr.add
          }
        } else {
          activityPayload = {
            user: userId,
            source: source,
            type: 'TA',
            ip: ipInfo._id,
            activity: constStr.add
          }
        }
        await ipService.saveActivity(activityPayload)
      }

      if (routePath === '/api/v1/thread/{threadId}' && method === 'put') {
        if (!source) {
          source = params && params.replyId ? params.replyId : null
        }
        let activityPayload
        if (response.source.threadType === 'QUESTION') {
          activityPayload = {
            user: userId,
            source: source,
            type: 'TQ',
            ip: ipInfo._id,
            activity: constStr.update
          }
        } else {
          activityPayload = {
            user: userId,
            source: source,
            type: 'TA',
            ip: ipInfo._id,
            activity: constStr.update
          }
        }
        await ipService.saveActivity(activityPayload)
      }

      // flag
      if (routePath === '/api/v1/flag' && method === 'post') {
        if (!source) {
          source =
            response && response.source && response.source._id
              ? response.source._id
              : null
        }
        let activityPayload
        if (payload.type === 'QUESTION') {
          activityPayload = {
            user: userId,
            source: source,
            type: 'FQ',
            ip: ipInfo._id,
            activity: constStr.add
          }
        } else {
          activityPayload = {
            user: userId,
            source: source,
            type: 'FA',
            ip: ipInfo._id,
            activity: constStr.add
          }
        }
        await ipService.saveActivity(activityPayload)
      }

      if (routePath === '/api/v1/flag/{flagId}' && method === 'put') {
        if (!source) {
          source = params && params.replyId ? params.replyId : null
        }
        let activityPayload
        if (response.source.type === 'QUESTION') {
          activityPayload = {
            user: userId,
            source: source,
            type: 'FQ',
            ip: ipInfo._id,
            activity: constStr.update
          }
        } else {
          activityPayload = {
            user: userId,
            source: source,
            type: 'FA',
            ip: ipInfo._id,
            activity: constStr.update
          }
        }
        await ipService.saveActivity(activityPayload)
      }

      if (routePath === '/api/v1/flag/{flagId}' && method === 'delete') {
        if (!source) {
          source = params && params.replyId ? params.replyId : null
        }
        let activityPayload
        if (response.source.type === 'QUESTION') {
          activityPayload = {
            user: userId,
            source: source,
            type: 'FQ',
            ip: ipInfo._id,
            activity: constStr.delete
          }
        } else {
          activityPayload = {
            user: userId,
            source: source,
            type: 'FA',
            ip: ipInfo._id,
            activity: constStr.delete
          }
        }
        await ipService.saveActivity(activityPayload)
      }

      // like dislike
      if (routePath === '/api/v1/like' && method === 'post') {
        const Thread = require('@models/thread.model').schema
        if (!source) {
          source =
            response && response.source && response.source._id
              ? response.source._id
              : null
        }
        let activityPayload
        if (payload.isLike) {
          switch (payload.likeType) {
            case 'QUESTION':
              activityPayload = {
                user: userId,
                source: source,
                type: 'Q',
                ip: ipInfo._id,
                activity: constStr.like
              }
              break
            case 'ANSWER':
              activityPayload = {
                user: userId,
                source: source,
                type: 'A',
                ip: ipInfo._id,
                activity: constStr.like
              }
              break
            case 'THREAD':
              const thread = await Thread.findOne({
                _id: payload.thread
              })
              if (thread && thread.threadType === 'QUESTION') {
                activityPayload = {
                  user: userId,
                  source: source,
                  type: 'TQ',
                  ip: ipInfo._id,
                  activity: constStr.like
                }
              } else {
                activityPayload = {
                  user: userId,
                  source: source,
                  type: 'TA',
                  ip: ipInfo._id,
                  activity: constStr.like
                }
              }
              break
            default:
              break
          }
        } else {
          switch (payload.likeType) {
            case 'QUESTION':
              activityPayload = {
                user: userId,
                source: source,
                type: 'Q',
                ip: ipInfo._id,
                activity: constStr.dislike
              }
              break
            case 'ANSWER':
              activityPayload = {
                user: userId,
                source: source,
                type: 'A',
                ip: ipInfo._id,
                activity: constStr.dislike
              }
              break
            case 'THREAD':
              const thread = await Thread.findOne({
                _id: payload.thread
              })
              if (thread && thread.threadType === 'QUESTION') {
                activityPayload = {
                  user: userId,
                  source: source,
                  type: 'TQ',
                  ip: ipInfo._id,
                  activity: constStr.dislike
                }
              } else {
                activityPayload = {
                  user: userId,
                  source: source,
                  type: 'TA',
                  ip: ipInfo._id,
                  activity: constStr.dislike
                }
              }
              break
            default:
              break
          }
        }
        await ipService.saveActivity(activityPayload)
      }

      // repository
      if (routePath === '/api/v1/repo/create' && method === 'post') {
        if (!source) {
          source =
            response && response.source && response.source._id
              ? response.source._id
              : null
        }
        const activityPayload = {
          user: userId,
          source: source,
          type: 'R',
          ip: ipInfo._id,
          activity: constStr.add
        }
        await ipService.saveActivity(activityPayload)
      }

      if (routePath === '/api/v1/repo/{id}' && method === 'delete') {
        if (!source) {
          source = params && params.replyId ? params.replyId : null
        }
        const activityPayload = {
          user: userId,
          source: source,
          type: 'R',
          ip: ipInfo._id,
          activity: constStr.delete
        }
        await ipService.saveActivity(activityPayload)
      }

      // dataset
      if (routePath === '/api/v1/dataset' && method === 'post') {
        if (!source) {
          source =
            response && response.source && response.source._id
              ? response.source._id
              : null
        }
        const activityPayload = {
          user: userId,
          source: source,
          type: 'D',
          ip: ipInfo._id,
          activity: constStr.add
        }
        await ipService.saveActivity(activityPayload)
      }

      if (routePath === '/api/v1/dataset/{id}' && method === 'put') {
        if (!source) {
          source = params && params.replyId ? params.replyId : null
        }
        const activityPayload = {
          user: userId,
          source: source,
          type: 'D',
          ip: ipInfo._id,
          activity: method === 'put' ? constStr.update : constStr.delete
        }
        await ipService.saveActivity(activityPayload)
      }

      // model
      if (routePath === '/api/v1/model' && method === 'post') {
        if (!source) {
          source =
            response && response.source && response.source._id
              ? response.source._id
              : null
        }
        const activityPayload = {
          user: userId,
          source: source,
          type: 'M',
          ip: ipInfo._id,
          activity: constStr.add
        }
        await ipService.saveActivity(activityPayload)
      }

      if (routePath === '/api/v1/update-model/{id}' && method === 'put') {
        if (!source) {
          source = params && params.replyId ? params.replyId : null
        }
        const activityPayload = {
          user: userId,
          source: source,
          type: 'M',
          ip: ipInfo._id,
          activity: constStr.update
        }
        await ipService.saveActivity(activityPayload)
      }

      if (routePath === '/api/v1/model/{modelId}' && method === 'delete') {
        if (!source) {
          source = params && params.replyId ? params.replyId : null
        }
        const activityPayload = {
          user: userId,
          source: source,
          type: 'M',
          ip: ipInfo._id,
          activity: constStr.delete
        }
        await ipService.saveActivity(activityPayload)
      }
    })
  },
  name: 'ip',
  version: require('../../package.json').version
}
