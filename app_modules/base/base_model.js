var dbconnMyssql = require('../dbconnMysql');

module.exports = class base_model{
    constructor(db, table, key="id"){
        this.db = db;
        this.table = table;
        this.key = key;
        this.selFields = '*';
        this.joinTb = '';
    }
    buildWhere(conds){
        var where = ' WHERE 1' + this.buildConds(conds);

        return where;
    }
    buildConds(conds){
        var where = ' ';
        for (let k in conds){
            if (typeof conds[k] == 'object') {
                var g_cond = "";
                var objArray = conds[k];
                for (let i in objArray){
                    var dk = i.toLowerCase();
                    if(dk.indexOf(">")>0 || dk.indexOf("<")>0 || dk.indexOf("=")>0 || dk.indexOf(" like")>0){
                        g_cond += k + " " + i + " '" + objArray[i]+"' ";
                    }else if(dk.indexOf(" in")>0){
                        where += " AND " + k + " (" + conds[k]+")";
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
                if(dk.indexOf(">")>0 || dk.indexOf("<")>0 || dk.indexOf("=")>0 || dk.indexOf(" like")>0){
                    where += " AND " + k + " '" + conds[k]+"'";
                }else if(dk.indexOf(" in")>0){
                    where += " AND " + k + " (" + conds[k]+")";
                }else{
                    where += " AND " + k + "= '" + conds[k]+"'";
                }
            }
        }

        return where;
    }
    /**
     * set fields are using in select (first, find, paging)
     * @param {* String list fields or Array fields} fields 
     */
    selectFields(fields){
        if(typeof fields === 'array'){
            this.selFields = '';
            for (let i = 0; i < fields.length; i++) { 
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
    /**
     * set join table of select (first, find, paging)
     * @param {* table name} _table 
     * @param {* join condition} _join 
     * @param {* type of join (left, right, inner)} _type 
     */
    join(_table, _join, _type){
        this.joinTb += " "+_type +" JOIN "+_table+" ON "+_join+" ";
    }

    /**
     * get record by primary key
     * @param {* primary key (id) value of the record} key 
     */
    getByKeyAsync(key) {
        return new Promise((resolve, reject) => {
            try{
                var sql = "SELECT "+this.selFields+" FROM `"+this.table +"`"+this.joinTb+" WHERE `"+this.key+"`='"+key+"'";
                this.db.query(sql, function(err, result){
                    if(err){ reject(err); return;}
                    resolve(result);
                });
            }catch(ex){
                reject(ex);
            }
        })
    }
    /**
     * get record by primary key
     * @param {* primary key (id) value of the record} key 
     * @param {* function (err, result)} callback 
     */
    getByKey(key, callback) {
        var sql = "SELECT "+this.selFields+" FROM `"+this.table +"`"+this.joinTb+" WHERE `"+this.key+"`='"+key+"'";
        try{
            this.db.query(sql, function(err, result){
                if(err) console.log(err)
                callback(err, result);
            });
        }catch(ex){
            callback(ex, null);
        }
    }

    /**
     * insert the object (one record) to the table
     * @param {* value of one record} obj 
     */
    insertAsync(obj) {
        return new Promise((resolve, reject) => {
            try{
                var sql = "INSERT INTO `"+this.table+"` SET ?";
                this.db.query(sql, obj, function(err, result){
                    if(err){ reject(err); return;}
                    resolve(result);
                });
            }catch(ex){
                reject(ex);
            }
        })
    }
    /**
     * insert the object (one record) to the table
     * @param {* value of one record} obj 
     * @param {* function (err, result)} callback 
     */
    insert(obj, callback) {
        var sql = "INSERT INTO `"+this.table+"` SET ?";
        try{
            this.db.query(sql, obj, function(err, result){
                if(err) console.log(err)
                callback(err, result);
            });
        }catch(ex){
            callback(ex, null);
        }
    }

    /**
     * insert all records of array objects to the table
     * @param {* array objects (list records)} objs 
     */
    insertAllAsync(objs) {
        return new Promise((resolve, reject) => {
            try{
                var fields = "";
                var obj = objs[0];
                for(let k in obj){ 
                    fields += k + "`,`";
                }
                if(fields != "") fields = fields.slice(0, -3);
                var objsArray = [];
                for(let i=0; i<objs.length; i++){
                    var objArray = [];
                    var obj = objs[i];
                    for(var k in obj){
                        objArray.push(obj[k]);
                    }
                    objsArray.push(objArray);
                }
                var sql = "INSERT INTO `"+this.table+"` (`"+fields+"`) VALUES ?";
                this.db.query(sql, [objsArray], function(err, result){
                    if(err){ reject(err); return;}
                    resolve(result);
                });
            }catch(ex){
                reject(ex);
            }
        })
    }
    /**
     * insert all records of array objects to the table
     * @param {* array objects (list records)} objs 
     * @param {* function (err, result)} callback 
     */
    insertAll(objs, callback) {
        var fields = "";
        var obj = objs[0];
        for(let k in obj){
            fields += k + "`,`";
        }
        if(fields != "") fields = fields.slice(0, -3);
        var objsArray = [];
        for(let i=0; i<objs.length; i++){
            var objArray = [];
            var obj = objs[i];
            for(let k in obj){
                objArray.push(obj[k]);
            }
            objsArray.push(objArray);
        }
        var sql = "INSERT INTO `"+this.table+"` (`"+fields+"`) VALUES ?";
        try{
            this.db.query(sql, [objsArray], function(err, result){
                if(err) console.log(err)
                callback(err, result);
            });
        }catch(ex){
            callback(ex, null);
        }
    }

    /**
     * update the object (one record) to the table
     * @param {* the object (one record)} obj 
     * @param {* array condition to update, for handle multi update} conds 
     */
    updateAsync(obj, conds) {
        var t = this;
        return new Promise((resolve, reject) => {
            try{
                var where = t.buildConds(conds);
                var sql = "UPDATE `"+t.table+"` SET ? WHERE `"+t.key+"`= ? " + where;
                t.db.query(sql, [obj,obj[t.key]], function(err, result){
                    if(err){ reject(err); return; }
                    if(result.affectedRows == 0){
                        err = 'No match';
                        reject(err);
                    }else{
                        resolve(result);
                    }
                });
            }catch(ex){
                reject(ex);
            }
        })
    }
    /**
     * update the object (one record) to the table
     * @param {* the object (one record)} obj 
     * @param {* array condition to update, for handle multi update} conds 
     * @param {* function (err, result)} callback 
     */
    update(obj, conds, callback) {
        var where = this.buildConds(conds);
        var sql = "UPDATE `"+this.table+"` SET ? WHERE `"+this.key+"`= ? " + where;
        try{
            this.db.query(sql, [obj,obj[this.key]], function(err, result){
                if(err){ console.log(err)
                }else if(result.affectedRows == 0) err = 'No match';
                callback(err, result);
            });
        }catch(ex){
            callback(ex, null);
        }
    }

    /**
     * delete the record by key value
     * @param {* primary key (id) value of the record} key 
     */
    deleteAsync(key) {
        return new Promise((resolve, reject) => {
            try{
                var sql = "DELETE from `"+this.table+"` WHERE `"+this.key+"`= ?";

                this.db.query(sql, [key], function(err, result){
                    if(err){ reject(err); return;}
                    resolve(result);
                });
            }catch(ex){
                reject(ex);
            }
        })
    }
    /**
     * delete the record by key value
     * @param {* primary key (id) value of the record} key 
     * @param {* function (err, result)} callback 
     */
    delete(key, callback) {
        var sql = "DELETE from `"+this.table+"` WHERE `"+this.key+"`= ?";
        try{
            this.db.query(sql, [key], function(err, result){
                if(err) console.log(err)
                callback(err, result);
            });
        }catch(ex){
            callback(ex, null);
        }
    }

    /**
     * delete all record by array keys value
     * @param {* array of keys value} keys 
     */
    deleteAllAsync(keys) {
        return new Promise((resolve, reject) => {
            try{
                var sql = "DELETE from `"+this.table+"` WHERE (`"+this.key+"`) IN (?)";

                this.db.query(sql, [keys], function(err, result){
                    if(err){ reject(err); return;}
                    resolve(result);
                });
            }catch(ex){
                reject(ex);
            }
        })
    }
    /**
     * delete all record by array keys value
     * @param {* array of keys value} keys 
     * @param {* function (err, result)} callback 
     */
    deleteAll(keys, callback) {
        var sql = "DELETE from `"+this.table+"` WHERE (`"+this.key+"`) IN (?)";
        try{
            this.db.query(sql, [keys], function(err, result){
                if(err) console.log(err)
                callback(err, result);
            });
        }catch(ex){
            callback(ex, null);
        }
    }

    /**
     * find the first record by array condition
     * @param {* array of condition} conds 
     */
    firstAsync(conds) {
        var t=this;
        return new Promise((resolve, reject) => {
            try{
                t.find(conds, [], function(err, result){
                    if(err){ reject(err); return;}
                    if(result[0]){
                        resolve(result[0]);
                    }else{
                        resolve(result);
                    }
                });
            }catch(ex){
                reject(ex);
            }
        })
    }
    /**
     * find the first record by array condition
     * @param {* array of condition} conds 
     * @param {* function (err, result)} callback 
     */
    first(conds, callback) {
        this.find(conds, [], function(err, result){
            if(result[0]){
                callback(err, result[0]);
            }else{
                callback(err, result);
            }
        });
    }

    /**
     * find all record by array condition
     * @param {* array of condition} conds 
     * @param {* array of orderby} orders 
     * @param {* number limit (optional)} limit 
     */
    findAsync(conds, orders, limit) {
        var t = this;
        return new Promise((resolve, reject) => {
            try{
                var where = t.buildWhere(conds);
                var order_by = '';
                for(let k in orders){
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

                t.db.query(sql, function(err, result){
                    if(err){ reject(err); return;}
                    resolve(result);
                });
            }catch(ex){
                reject(ex);
            }
        })
    }
    /**
     * find all record by array condition
     * @param {* array of condition} conds 
     * @param {* array of orderby} orders 
     * @param {* function (err, result)} callback 
     */
    find(conds, orders, callback) {
        var where = this.buildWhere(conds);
        var order_by = '';
        for(let k in orders){
            order_by += k + " " + orders[k] + ",";
        }
        if(order_by != ''){
            order_by = order_by.slice(0, -1);
            order_by = ' ORDER BY ' + order_by; 
        }

        var sql = "SELECT "+this.selFields+" FROM `"+this.table +"`"+this.joinTb + where + order_by;
        try{
            this.db.query(sql, function(err, result){
                if(err) console.log(err)
                callback(err, result);
            });
        }catch(ex){
            callback(ex, null);
        }
    }

    /**
     * find and paging 
     * @param {* array of condition} conds 
     * @param {* array of orderby} orders 
     * @param {* page number of result} page 
     * @param {* row (record) per page} row_per_page 
     */
    pagingAsync(conds, orders, page, row_per_page) {
        var t = this;
        return new Promise((resolve, reject) => {
            try{
                var where = t.buildWhere(conds);
                var total_record = 0;
                var sql_c = "SELECT COUNT(*) as r_count FROM `"+this.table+"`" + t.joinTb + where;
                t.db.query(sql_c, function(err, result){
                    if(err){ 
                        console.log(err)
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
                        for(let k in orders){
                            order_by += k + " " + orders[k] + ",";
                        }
                        if(order_by != ''){
                            order_by = order_by.slice(0, -1);
                            order_by = ' ORDER BY ' + order_by; 
                        }
                
                        var sql = "SELECT "+t.selFields+" FROM `"+t.table+"`"+t.joinTb + where + order_by + limit;
                        t.db.query(sql, function(err, result){
                            if(err){ reject(err); return;}
                            var data = {
                                data_list : result,
                                paging : paging
                            };
                            resolve(data);
                        });
                    }
                });
            }catch(ex){
                reject(ex);
            }
        })
    }
    /**
     * find and paging 
     * @param {* array of condition} conds 
     * @param {* array orderby} orders 
     * @param {* page number of result} page 
     * @param {* row (record) per page} row_per_page 
     * @param {* function(err, result)} callback 
     */
    paging(conds, orders, page, row_per_page, callback) {
        var where = this.buildWhere(conds);
        var total_record = 0;
        var sql_c = "SELECT COUNT(*) as r_count FROM `"+this.table+"`" + where;
        var t = this;
        try{
            this.query(sql_c, function(err, result){
                if(err){ 
                    console.log(err)
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
                    for(let k in orders){
                        order_by += k + " " + orders[k] + ",";
                    }
                    if(order_by != ''){
                        order_by = order_by.slice(0, -1);
                        order_by = ' ORDER BY ' + order_by; 
                    }
            
                    var sql = "SELECT "+t.selFields+" FROM `"+t.table+"`"+t.joinTb + where + order_by + limit;
            
                    t.db.query(sql, function(err, result){
                        if(err) console.log(err)
                        var data = {
                            data_list : result,
                            paging : paging
                        };
                        callback(err, data);
                    });
                }
            });
        }catch(ex){
            callback(ex, null);
        }
    }

    /**
     * query
     * @param {* sql statement} sql 
     */
    queryAsync(sql) {
        return new Promise((resolve, reject) => {
            try{
                this.db.query(sql, function(err, result){
                    if(err){ reject(err); return;}
                    resolve(result);
                });
            }catch(ex){
                reject(ex);
            }
        })
    }
    /**
     * query with param
     * @param {* sql statement} sql 
     * @param {* param of statement} param 
     */
    queryParam(sql, param) {
        return new Promise((resolve, reject) => {
            try{
                this.db.query(sql, param, function(err, result){
                    if(err){ reject(err); return;}
                    resolve(result);
                });
            }catch(ex){
                reject(ex);
            }
        })
    }

}