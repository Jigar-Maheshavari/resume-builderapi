module.exports = {
  appName: 'buz',
  port: 8009,
  debug: {
    request: ['error', 'info'],
    log: ['info', 'error', 'warning']
  },
  connections: {
    db: process.env.DB
  }
}
