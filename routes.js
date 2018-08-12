const routes = module.exports = require('next-routes')()

routes
  .add('index', '/')
  .add('test', '/test/:lang?')
  .add('showResult', '/result')
