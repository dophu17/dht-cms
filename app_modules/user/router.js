var express = require('express')

var router = express.Router()
var model = require('./model')

// get by id
router.get('/:id', function(req, res, next){
    var m = new model()
    var id = req.params.id

    m.getByKey(id).then(function(result){
        console.log(result)
    }).catch(function(error){
        console.log(error)
    })
})

// get all
router.get('/', function(req, res, next){
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    var m = new model()
    var cond = []
    var data = {}

    // m.findAsync(cond).then(function(result){
    //     data.lists = result
    //     data.title = 'User page'
    //     res.send(data)
    // }).catch(function(error){
    //     console.log(error)
    // })

    m.findAll()
})

// insert
// router.post('/', function(req, res, next){
//     var m = new model()
//     var inputs = req.body
    
//     m.insert(inputs).then(function(result){
//         console.log(result)
//     }).catch(function(error){
//         console.log(error)
//     })
// })

// // update
// router.put('/:id', function(req, res, next){
//     var m = new model()
//     var inputs = req.body
//     var cond = []
//     cond['id'] = req.params.id

//     m.update(inputs, cond).then(function(result){
//         console.log(result)
//     }).catch(function(error){
//         console.log(error)
//     })
// })

// // delete
// router.delete('/:id', function(req, res, next){
//     var m = new model()
//     var id = req.params.id

//     m.delete(id).then(function(result){
//         console.log(result)
//     }).catch(function(error){
//         console.log(error)
//     })
// })

module.exports = router