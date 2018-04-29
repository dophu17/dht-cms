var express = require('express')
var router = express.Router()
var model = require('./model')

router.get('/', function(req, res, next){
    var data = {
        title: 'Home router'
    }
    res.send(data)
})

module.exports = router