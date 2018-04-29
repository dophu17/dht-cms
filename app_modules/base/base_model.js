var mysql = require('mysql')

module.exports = class Connection {
    constructor(table, key = 'id') {
        this.table = table;
        this.key = key;
        this.selFields = '*';
        this.joinTb = '';
    }

    conn() {
        return mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'root',
            database : 'dauhuthom',
            port: '8889'
        })
    }

    selectFields(fields){
        if(typeof fields === 'array'){
            this.selFields = '';
            for (var i = 0; i < fields.length; i++) { 
                this.selFields += "`"+fields[i] + "`,";
            }
            if(this.selFields != ""){
                this.selFields = this.selFields.slice(0, -1);
            }else{
                this.selFields = '*';
            }
        }else{
            this.selFields = fields;
        }
    }
  
    join(_table, _join, _type){
        this.joinTb += " "+_type +" JOIN "+_table+" ON "+_join+" ";
    }

    getByKey(key) {
        var t = this
        return new Promise((resolve, reject) => {
            var sql = "SELECT "+t.selFields+" FROM `"+t.table +"`"+t.joinTb+" WHERE `"+t.key+"`='"+key+"'";
            t.conn().query(sql, function(err, result){
                if(err) reject(err)
                resolve(result)
            });
        })
    }

    insert(obj) {
        var t = this
        return new Promise((resolve, reject) => {
            var sql = "INSERT INTO `"+t.table+"` SET ?";
            t.conn().query(sql, obj, function(err, result){
                if(err) reject(err)
                resolve(result)
            });
        })
    }

    inserts(objs) {
        var t = this
        return new Promise((resolve, reject) => {
            var fields = "";
            var obj = objs[0];
            for(var k in obj){ 
                fields += k + "`,`";
            }
            if(fields != "") fields = fields.slice(0, -3);
            var objsArray = [];
            for(var i=0; i<objs.length; i++){
                var objArray = [];
                var obj = objs[i];
                for(var k in obj){
                    objArray.push(obj[k]);
                }
                objsArray.push(objArray);
            }
            var sql = "INSERT INTO `"+t.table+"` (`"+fields+"`) VALUES ?";
            t.conn().query(sql, [objsArray], function(err, result){
                if(err){ throw err; reject(err); return;}
                resolve(result);
            });
        })
    }

    update(obj, conds) {
        var t = this
        return new Promise((resolve, reject) => {
            var where = '1 = 1';
            for (var k in conds){
                if (typeof conds[k] !== 'function') {
                    var dk = k.toLowerCase();
                    if(dk.indexOf(">")>0 || dk.indexOf("<")>0 || dk.indexOf("=")>0 || dk.indexOf("like")>0){
                        where += " AND " + k + " '" + conds[k]+"'";
                    }else{
                        where += " AND `" + k + "`= '" + conds[k]+"'";
                    }
                }
            }
            var sql = "UPDATE `"+t.table+"` SET ? WHERE " + where;
            t.conn().query(sql, [obj, conds], function(err, result){
                if(err) reject(err)
                resolve(result);
            });
        })
    }

    delete(key) {
        var t = this
        return new Promise((resolve, reject) => {
            var sql = "DELETE from `"+t.table+"` WHERE `"+t.key+"`= ?";
            t.conn().query(sql, [key], function(err, result){
                if(err) reject(err)
                resolve(result)
            });
        })
    }

    deletes(keys) {
        var t = this
        return new Promise((resolve, reject) => {
            var sql = "DELETE from `"+t.table+"` WHERE (`"+t.key+"`) IN (?)";
            t.conn().query(sql, [keys], function(err, result){
                if(err) reject(err)
                resolve(result)
            });
        })
    }

    first(conds) {
        var t = this
        return new Promise((resolve, reject) => {
            t.find(conds, [], '', function(err, result){
                if(err) reject(err)
                if(result[0]){
                    resolve(result[0]);
                }else{
                    resolve(result);
                }
            });
        })
    }

    find(conds, orders, limit) {
        var t = this;
        return new Promise((resolve, reject) => {
            var where = ' WHERE 1';
            for (var k in conds){
                if (typeof conds[k] == 'object') {
                    var g_cond = "";
                    var objArray = conds[k];
                    for (var i in objArray){
                        var dk = i.toLowerCase();
                        if(dk.indexOf(">")>0 || dk.indexOf("<")>0 || dk.indexOf("=")>0 || dk.indexOf("like")>0){
                            g_cond += k + " " + i + " '" + objArray[i]+"' ";
                        }else{
                            g_cond += k + " " + i + "= '" + objArray[i]+"' ";
                        }
                    }
                    if(g_cond != ""){
                        g_cond = g_cond.slice(k.length);
                        where += " AND (" +g_cond+ ")";
                    } 
                }else{
                    var dk = k.toLowerCase();
                    if(dk.indexOf(">")>0 || dk.indexOf("<")>0 || dk.indexOf("=")>0 || dk.indexOf("like")>0){
                        where += " AND " + k + " '" + conds[k]+"'";
                    }else{
                        where += " AND " + k + "= '" + conds[k]+"'";
                    }
                }
            }
            var order_by = '';
            for(k in orders){
                order_by += k + " " + orders[k] + ",";
            }
            if(order_by != ''){
                order_by = order_by.slice(0, -1);
                order_by = ' ORDER BY ' + order_by; 
            }

            var sql = "SELECT "+t.selFields+" FROM `"+t.table +"`"+t.joinTb + where + order_by;
            if(limit && limit>0){
                sql += ' LIMIT ' + limit;
            }

            t.conn().query(sql, function(err, result){
                if(err) reject(err)
                resolve(result)
            });
        })
    }

    paging(conds, orders, page, row_per_page) {
        var t = this;
        return new Promise((resolve, reject) => {
            var where = ' WHERE 1';
            for (var k in conds){
                if (typeof conds[k] == 'object') {
                    var g_cond = "";
                    var objArray = conds[k];
                    for (var i in objArray){
                        var dk = i.toLowerCase();
                        if(dk.indexOf(">")>0 || dk.indexOf("<")>0 || dk.indexOf("=")>0 || dk.indexOf("like")>0){
                            g_cond += k + " " + i + " '" + objArray[i]+"' ";
                        }else{
                            g_cond += k + " " + i + "= '" + objArray[i]+"' ";
                        }
                    }
                    if(g_cond != ""){
                        g_cond = g_cond.slice(k.length);
                        where += " AND (" +g_cond+ ")";
                    } 
                }else{
                    var dk = k.toLowerCase();
                    if(dk.indexOf(">")>0 || dk.indexOf("<")>0 || dk.indexOf("=")>0 || dk.indexOf("like")>0){
                        where += " AND " + k + " '" + conds[k]+"'";
                    }else{
                        where += " AND " + k + "= '" + conds[k]+"'";
                    }
                }
            }
            var total_record = 0;
            var sql_c = "SELECT COUNT(*) as r_count FROM `"+t.table+"`" + t.joinTb + where;
            t.conn().query(sql_c, function(err, result){
                if(err){ 
                    throw err;
                    reject(err);
                }else{
                    total_record = result[0].r_count;
                    var limit = '';
                    if(total_record>row_per_page){
                        if(page<1){
                            page = 1;
                        }else if(page*row_per_page>total_record){
                            page = parseInt((total_record-1)/row_per_page) + 1;
                        }
                        var start = (page-1)*row_per_page;
                        //var end = start +
                        limit = ' LIMIT '+ row_per_page + ' OFFSET ' + start;
                    }else{
                        page = 1;
                    }
                    var paging = {};
                    paging.current_page = page;
                    paging.row_per_page = row_per_page;
                    paging.total_record = total_record;
                    var order_by = '';
                    for(k in orders){
                        order_by += k + " " + orders[k] + ",";
                    }
                    if(order_by != ''){
                        order_by = order_by.slice(0, -1);
                        order_by = ' ORDER BY ' + order_by; 
                    }
            
                    var sql = "SELECT "+t.selFields+" FROM `"+t.table+"`"+t.joinTb + where + order_by + limit;
                    t.conn().query(sql, function(err, result){
                        if(err) reject(err)
                        var data = {
                            data_list : result,
                            paging : paging
                        };
                        resolve(data)
                    });
                }
            });
        })
    }

    query(sql) {
        var t = this
        return new Promise((resolve, reject) => {
            t.conn().query(sql, function(err, result){
                if ( err ) reject(err)
                resolve(result)
            });
        })
    }

    queryParam(sql, param) {
        var t = this
        return new Promise((resolve, reject) => {
            t.conn().query(sql, param, function(err, result){
                if ( err ) reject(err)
                resolve(result)
            });
        })
    }
}