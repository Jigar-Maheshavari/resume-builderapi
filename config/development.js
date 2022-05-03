module.exports = {
  appName: 'buz',
  port: 6100,
  debug: {
    request: ['error', 'info'],
    log: ['info', 'error', 'warning']
  },
  connections: {
    db: process.env.DB
  }
}
