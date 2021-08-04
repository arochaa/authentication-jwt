const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()
const app = express()

require('dotenv').config()

const port = process.env.SERVER_PORT || 9999
const database = []
const login = []
const clientes = [{ cliente: 'Anderson', profissao: 'Desenvolvedor' }, { cliente: 'Fernanda', profissao: 'administradora' }]

// load middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// custom configs
app.disable('etag')
app.disable('x-powered-by')
app.use('/api/v1', router)

const verifyJWT = async (req, res, next) => {
  try {
    if (!req.headers.authorization) return res.status(401).json({ message: 'Token not found', code: 401 })
    const decode = await jwt.verify(req.headers.authorization, process.env.SECRET)
    req.access = decode.user
    next()
  } catch (e) {
    console.error('Error ', e)
    res.status(401).json({ message: 'Token not found', code: 401 })
  }
}

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Success', status: 200 })
})

router.post('/signup', (req, res) => {
  if (database.some(item => item.user === req.body.user) === true) {
    return res.status(401).json({
      message: 'The user already exists',
      status: 401
    }).end()
  }

  database.push({ ...req.body })

  return res.json({
    message: 'User create with success',
    code: 201
  }).status(201).end()
})

router.post('/login', (req, res) => {
  if (req.body.user && database.some(item => item.user === req.body.user) === true) {
    login.push(req.body)
    const token = jwt.sign({ user: req.body.user }, process.env.SECRET, { expiresIn: 300 })

    return res.status(200).json({
      message: 'User successfully logged in',
      token,
      code: 200
    }).end()
  }

  return res.status(401).json({
    message: 'Username or password not found',
    code: 401
  }).end()
})

router.get('/client', verifyJWT, (req, res) => {
  return res.status(200).json({ ...clientes }).end()
})

router.post('/logout', (req, res) => {
  if (req.body.user && login.some(item => item.user === req.body.user) === true) {
    login.forEach((item, i) => {
      if (item.user === req.body.user) login.splice(i)
    })

    return res.status(200).json({ message: 'Success', status: 200 })
  }
  return res.status(400).json({ message: 'User not logged in', status: 400 })
})

app.listen(port, () => {
  console.log(`🔷 Server Running in Port: ${port} ⚡⚡⚡⚡`)
})
