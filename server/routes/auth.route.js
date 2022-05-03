'use strict'
// Never take constants here
module.exports = {
  plugin: {
    async register(server, options) {
      const API = require('./../api/auth.api')
      server.route([
        {
          method: 'POST',
          path: '/signup',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Signup User',
            notes: 'Signup User',
            validate: API.signup.validate,
            pre: API.signup.pre,
            handler: API.signup.handler
          }
        },
        {
          method: 'POST',
          path: '/login',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Login',
            notes: 'Login',
            validate: API.login.validate,
            pre: API.login.pre,
            handler: API.login.handler
          }
        },
        {
          method: 'GET',
          path: '/me',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                security: [
                  {
                    jwt: []
                  }
                ]
              }
            },
            tags: ['api', 'Authentication'],
            description: 'Me',
            notes: 'Me',
            validate: API.me.validate,
            pre: API.me.pre,
            handler: API.me.handler
          }
        },
        {
          method: 'POST',
          path: '/update-profile',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Update Profile',
            notes: 'Update Profile',
            validate: API.updateProfile.validate,
            pre: API.updateProfile.pre,
            handler: API.updateProfile.handler
          }
        },
        {
          method: 'GET',
          path: '/users',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Get User',
            notes: 'Get User',
            validate: API.users.validate,
            pre: API.users.pre,
            handler: API.users.handler
          }
        },
        {
          method: 'GET',
          path: '/employee-request',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Get Employee-Request',
            notes: 'Get Employee-Request',
            validate: API.employeeRequest.validate,
            pre: API.employeeRequest.pre,
            handler: API.employeeRequest.handler
          }
        },
        {
          method: 'GET',
          path: '/employee-list',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Get Employee Request',
            notes: 'Get Employee-Request',
            validate: API.employeeList.validate,
            pre: API.employeeList.pre,
            handler: API.employeeList.handler
          }
        },

        {
          method: 'PUT',
          path: '/activate-account',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: ' Activate Employee Acc',
            notes: 'Activate Employee Acc',
            validate: API.activateEmpAcc.validate,
            pre: API.activateEmpAcc.pre,
            handler: API.activateEmpAcc.handler
          }
        },

        {
          method: 'POST',
          path: '/verify-account',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Verify Account',
            notes: 'Verify Account',
            validate: API.verifyAccount.validate,
            pre: API.verifyAccount.pre,
            handler: API.verifyAccount.handler
          }
        },
        {
          method: 'DELETE',
          path: '/employee/{Id}',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Remove Employee',
            notes: 'Remove Employee',
            validate: API.delete.validate,
            pre: API.delete.pre,
            handler: API.delete.handler
          }
        },

        {
          method: 'GET',
          path: '/employee/{Id}',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'View Employee',
            notes: 'View Employee',
            validate: API.viewEmployee.validate,
            pre: API.viewEmployee.pre,
            handler: API.viewEmployee.handler
          }
        },

        {
          method: 'PUT',
          path: '/employee/{Id}',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Update Employee',
            notes: 'Update Employee',
            validate: API.updateEmployee.validate,
            pre: API.updateEmployee.pre,
            handler: API.updateEmployee.handler
          }
        }
      ])
    },
    version: require('../../package.json').version,
    name: 'users-route'
  }
}
