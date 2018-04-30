var baseModel = require('../base/base_model')

module.exports = class model {
    constructor(){
        
    }

    findAll() {
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'root',
            database : 'dauhuthom',
            port: '8889'
        });
        
        connection.connect();
        
        connection.query('SELECT * from users', function (error, results, fields) {
            if (error) throw error;
            console.log(results);
        });
        
        connection.end();
    }
}