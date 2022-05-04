'use strict'
// Never take constants here
module.exports = {
  plugin: {
    async register(server, options) {
      const API = require('../api/resume.api')
      server.route([
        {
          method: 'POST',
          path: '/resume',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Resume'],
            description: 'Post resume',
            notes: 'Post resume',
            validate: API.create.validate,
            pre: API.create.pre,
            handler: API.create.handler
          }
        },
        {
          method: 'get',
          path: '/resume',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Resume'],
            description: 'get Resume',
            notes: 'get Resume',
            validate: API.getAllUserResume.validate,
            pre: API.getAllUserResume.pre,
            handler: API.getAllUserResume.handler
          }
        }
      ])
    },
    version: require('../../package.json').version,
    name: 'resume-route'
  }
}
