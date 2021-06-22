require('dotenv').config()
require('./db/conn')

const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const path = require('path')
const user = require('./routes/user')
const seller = require('./routes/seller')
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, '../public')))

app.use(user)
app.use('/seller-central', seller)

app.listen(port, console.log(`http://localhost:${port}`))

