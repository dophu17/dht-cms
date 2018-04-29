const express = require('express')
var bodyParser = require('body-parser')
const app = express()

// middleware
var myMiddleware = require('./my_middleware')

var index = require('./app_modules/index/router')
var user = require('./app_modules/user/router')

app.use(myMiddleware({option1: 'middleware11', option2: 'middleware22'}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//route
app.use('/', index)
app.use('/user', user)

app.listen(2000, () => console.log('Example app listening on port 2000!'))