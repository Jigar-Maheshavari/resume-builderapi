module.exports = {
  appName: 'buz',
  port: 6100,
  console_url: 'http://localhost:4200',
  debug: {
    request: ['error', 'info'],
    log: ['info', 'error', 'warning']
  },

  constants: {
    EXPIRATION_PERIOD: '730h',
    JWT_SECRET: 'jwtsecret',
    MAIL_SENDER: 'mailgun', // options ['mailgun','aws']
    MAIL_FROM: 'demo1.webfirminfotech@gmail.com', // mailgun=>demo1.webfirminfotech@gmail.com, aws=>no-reply@intelllivisit.com
    MAIL_GUN_API_KEY: 'key-de4582feecd40bce619439a152ce7d23',
    MAIL_GUN_DOMAIN: 'mailing.webfirminfotech.com',
    CATEGORY_TYPE: {
      BUSINESS: 'business',
      FLYER: 'flyer',
      TEMPLATE: 'template'
    },
    VERIFICATION_EXPIRATION_PERIOD: '24',
    ROLE: {
      USER: 'user',
      MERCHANT: 'merchant',
      MERCHANT_STAFF: 'merchant-staff',
      CUSTOMER: 'customer',
      ADMIN: 'admin',
      ADMIN_STAFF: 'admin-staff'
    },
    SESSION_EXPIRED_DAYS: 2,
    SIGNUP_TYPE: {
      STORE: 'store'
    }
  },

  connections: {
    db: process.env.DB
  }
}
