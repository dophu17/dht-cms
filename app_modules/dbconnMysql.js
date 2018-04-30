const mysql = require('mysql');
const Configs = require('./config');

module.exports = class dbconnMysql {
    constructor(){
        this.conn = null;
    }

    static getPool(){
        if(dbconnMysql.pool == null){
            dbconnMysql.pool = mysql.createPool(Configs.dbconfig)
        }
        
        return dbconnMysql.pool;
    }

    static getConn(){
        if(this.conn==null){
            var connection = mysql.createConnection(Configs.dbconfig)
            connection.connect(function(err) {
                if (err) {
                    console.error('error connecting: ' + err.stack);
                    return;
                }else{
                    console.log('connected as id ' + connection.threadId);
                }
            });
            this.conn = connection;
        }
        return this.conn;
    }

    getConnPool(callback){
        dbconnMysql.getPool().getConnection(function(err, connection){
            callback(err, connection);
        });
    }
    
    checkDBConn(){
        try{
            this.getConnPool(function(err, connection) {
                if (err){
                    console.log(err)
                }else{
                    connection.release();
                }
            })
        }catch(ex){
            console.log(ex)
        }
    }

}