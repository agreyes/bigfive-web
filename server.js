const dev = process.env.NODE_ENV !== 'production'
if (dev) {
  require('dotenv').config()
}
const next = require('next')
const routes = require('./routes')
const mongo = require('mongojs')
const helmet = require('helmet')
const requestCountry = require('request-country')
const config = require('./config')
const validMongoId = require('./lib/valid-mongoid')
const { join } = require('path')
const frameguard = require('frameguard')
const calculateScore = require('b5-calculate-score')
const getResult = require('@alheimsins/b5-result-text')

const app = next({ dev })

const handler = routes.getRequestHandler(app)
const port = parseInt(process.env.PORT, 10) || 3000
const express = require('express')

app.prepare().then(() => {
  const server = express()
  const db = mongo(config.DB_CONNECTION)
  const collection = db.collection(config.DB_COLLECTION)

  server.use(helmet())
  server.use(express.json())
  server.use(requestCountry.middleware({
    privateIpCountry: 'en'
  }))

  server.use(frameguard({
    action: 'allow-from',
    domain: '*',
    frameguard: false
  }))

  server.get('/sitemap.xml', (req, res) => {
    const filePath = join(__dirname, 'static', 'sitemap.xml')
    return app.serveStatic(req, res, filePath)
  })

  server.get('/big5Test.js', (req, res) => {
    const filePath = join(__dirname, 'static', 'big5Test.js')
    return app.serveStatic(req, res, filePath)
  })

  server.get('/example.html', (req, res) => {
    const filePath = join(__dirname, 'static', 'example.html')
    return app.serveStatic(req, res, filePath)
  })

  server.get('/test.css', (req, res) => {
    const filePath = join(__dirname, 'static', 'test.css')
    return app.serveStatic(req, res, filePath)
  })

  server.get('/service-worker.js', (req, res) => {
    const filePath = join(__dirname, '.next', 'service-worker.js')
    return app.serveStatic(req, res, filePath)
  })

  server.get('/api/get/:id', (req, res) => {
    const id = req.params && req.params.id ? req.params.id : false
    if (!id || !validMongoId(id)) throw new Error('Not a valid id')
    collection.findOne({ _id: mongo.ObjectId(id) }, (error, data) => {
      if (error) throw error
      res.send(data)
    })
  })

  server.post('/api/submit', (req, res) => {
    const payload = req.body
    console.log(payload)
    const scores = calculateScore(payload)
    res.send(getResult({scores, lang: payload.lang || 'en'}))
  })

  server.use(handler)

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
