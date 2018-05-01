const mysql = require('mysql')
const config = require('../config')

module.exports = class base_model{
    constructor(table, primaryKey = 'id') {
        this.table = table
        this.primaryKey = primaryKey
        this.selectFields = '*'
        this.join = ''
        this.getConnection()
    }

    createPool() {
        return mysql.createPool(config.dbConfig)
    }

    getConnection() {
        console.log('---Begin check connect---')
        this.createPool().getConnection((err, connection) => {
            if (err) {
                console.log('---Connect error---')
                throw err
            }
            console.log('---Connect success---')
            console.log('---End check connect---')
        });
    }

    buildWhere(conds) {
        return ' WHERE 1' + this.buildConds(conds)
    }

    buildConds(conds) {
        var where = ' '
        for (let k in conds) {
            if (typeof conds[k] == 'object') {
                var g_cond = ""
                var objArray = conds[k]
                for (let i in objArray) {
                    var dk = i.toLowerCase()
                    if (dk.indexOf(">") > 0 || dk.indexOf("<") > 0 || dk.indexOf("=") > 0 || dk.indexOf(" like") > 0) {
                        g_cond += k + " " + i + " '" + objArray[i] + "' "
                    } else if (dk.indexOf(" in") > 0) {
                        where += " AND " + k + " (" + conds[k] + ")"
                    } else {
                        g_cond += k + " " + i + "= '" + objArray[i] + "' "
                    }
                }
                if (g_cond != "") {
                    g_cond = g_cond.slice(k.length)
                    where += " AND (" +g_cond+ ")"
                } 
            } else {
                var dk = k.toLowerCase()
                if (dk.indexOf(">") > 0 || dk.indexOf("<") > 0 || dk.indexOf("=") > 0 || dk.indexOf(" like") > 0) {
                    where += " AND " + k + " '" + conds[k] + "'"
                } else if (dk.indexOf(" in") > 0) {
                    where += " AND " + k + " (" + conds[k] + ")"
                } else {
                    where += " AND " + k + "= '" + conds[k] + "'"
                }
            }
        }
        return where
    }

    /**
     * set fields are using in select (first, find, paging)
     * @param {* String list fields or Array fields} fields 
     */
    selectFields(fields) {
        if (typeof fields === 'array') {
            this.selectFields = ''
            for (let i = 0; i < fields.length; i++) { 
                this.selectFields += "`" + fields[i] + "`,"
            }
            if (this.selectFields != "") {
                this.selectFields = this.selectFields.slice(0, -1)
            } else {
                this.selectFields = '*'
            }
        } else {
            this.selectFields = fields
        }
    }

    /**
     * set join table of select (first, find, paging)
     * @param {* table name} _table 
     * @param {* join condition} _join 
     * @param {* type of join (left, right, inner)} _type 
     */
    join(_table, _join, _type) {
        this.join += " " + _type  + " JOIN " + _table + " ON " + _join + " "
    }

    /**
     * get record by primary key
     * @param {* primary key (id) value of the record} key 
     */
    getById(primaryKey) {
        return new Promise((resolve, reject) => {
            try {
                var sql = "SELECT " + this.selectFields + " FROM `" + this.table  + "`" + this.join + " WHERE `" + this.primaryKey + "`='" + primaryKey + "'"
                this.createPool().query(sql, function(err, result) {
                    if (err) reject(err)
                    resolve(result[0])
                })
            } catch(ex) {
                reject(ex)
            }
        })
    }

    /**
     * insert the object (one record) to the table
     * @param {* value of one record} obj 
     */
    insert(obj) {
        return new Promise((resolve, reject) => {
            try {
                var sql = "INSERT INTO `" + this.table + "` SET ?"
                this.createPool().query(sql, obj, function(err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            } catch(ex) {
                reject(ex)
            }
        })
    }

    /**
     * insert all records of array objects to the table
     * @param {* array objects (list records)} objs 
     */
    insertAll(objs) {
        return new Promise((resolve, reject) => {
            try {
                var fields = ""
                var obj = objs[0]
                for (let k in obj) { 
                    fields += k + "`,`"
                }
                if (fields != "") fields = fields.slice(0, -3)
                var objsArray = []
                for (let i = 0; i<objs.length; i++) {
                    var objArray = []
                    var obj = objs[i]
                    for (var k in obj) {
                        objArray.push(obj[k])
                    }
                    objsArray.push(objArray)
                }
                var sql = "INSERT INTO `" + this.table + "` (`" + fields + "`) VALUES ?"
                this.createPool().query(sql, [objsArray], function(err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            } catch(ex) {
                reject(ex)
            }
        })
    }

    /**
     * update the object (one record) to the table
     * @param {* the object (one record)} obj 
     * @param {* array condition to update, for handle multi update} conds 
     */
    update(obj, conds) {
        return new Promise((resolve, reject) => {
            try {
                var where = this.buildConds(conds)
                var sql = "UPDATE `" + this.table + "` SET ? WHERE `" + this.primaryKey + "`= ? " + where;
                this.createPool().query(sql, [obj,obj[this.primaryKey]], (err, result) => {
                    if (err) reject(err)
                    if (result.affectedRows == 0) {
                        err = 'No match'
                        reject(err)
                    } else {
                        resolve(result)
                    }
                })
            } catch(ex) {
                reject(ex)
            }
        })
    }

    /**
     * delete the record by key value
     * @param {* primary key (id) value of the record} key 
     */
    delete(primaryKey) {
        return new Promise((resolve, reject) => {
            try {
                var sql = "DELETE from `" + this.table + "` WHERE `" + this.primaryKey + "`= ?"

                this.createPool().query(sql, [primaryKey], function(err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            } catch(ex) {
                reject(ex)
            }
        })
    }

    /**
     * delete all record by array keys value
     * @param {* array of keys value} keys 
     */
    deleteAll(keys) {
        return new Promise((resolve, reject) => {
            try {
                var sql = "DELETE from `" + this.table + "` WHERE (`" + this.primaryKey + "`) IN (?)"

                this.createPool().query(sql, [keys], function(err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            } catch(ex) {
                reject(ex)
            }
        })
    }

    /**
     * find the first record by array condition
     * @param {* array of condition} conds 
     */
    first(conds) {
        return new Promise((resolve, reject) => {
            try {
                this.find(conds, [], function(err, result) {
                    if (err) reject(err)
                    if (result[0]) {
                        resolve(result[0])
                    } else {
                        resolve(result)
                    }
                })
            } catch(ex) {
                reject(ex)
            }
        })
    }

    /**
     * find all record by array condition
     * @param {* array of condition} conds 
     * @param {* array of orderby} orders 
     * @param {* number limit (optional)} limit 
     */
    find(conds, orders, limit) {
        return new Promise((resolve, reject) => {
            try {
                var where = this.buildWhere(conds)
                var order_by = ''
                for (let k in orders) {
                    order_by += k + " " + orders[k] + ","
                }
                if (order_by != '') {
                    order_by = order_by.slice(0, -1)
                    order_by = ' ORDER BY ' + order_by 
                }

                var sql = "SELECT " + this.selectFields + " FROM `" + this.table  + "`" + this.join + where + order_by
               
                if (limit && limit > 0) {
                    sql += ' LIMIT ' + limit
                }

                this.createPool().query(sql, function(err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            } catch(ex) {
                reject(ex)
            }
        })
    }

    /**
     * find and paging 
     * @param {* array of condition} conds 
     * @param {* array of orderby} orders 
     * @param {* page number of result} page 
     * @param {* row (record) per page} row_per_page 
     */
    paging(conds, orders, page, row_per_page) {
        return new Promise((resolve, reject) => {
            try {
                var where = this.buildWhere(conds)
                var total_record = 0
                var sql_c = "SELECT COUNT(*) as r_count FROM `" + this.table + "`" + this.join + where
                this.createPool().query(sql_c, (err, result) => {
                    if (err) { 
                        reject(err)
                    } else {
                        total_record = result[0].r_count
                        var limit = ''
                        if (total_record > row_per_page) {
                            if (page<1) {
                                page = 1
                            } else if (page*row_per_page > total_record) {
                                page = parseInt((total_record-1)/row_per_page) + 1
                            }
                            var start = (page-1)*row_per_page
                            //var end = start +
                            limit = ' LIMIT '+ row_per_page + ' OFFSET ' + start
                        } else {
                            page = 1
                        }
                        var paging = {}
                        paging.current_page = page
                        paging.row_per_page = row_per_page
                        paging.total_record = total_record
                        var order_by = ''
                        for (let k in orders) {
                            order_by += k + " " + orders[k] + ","
                        }
                        if (order_by != '') {
                            order_by = order_by.slice(0, -1)
                            order_by = ' ORDER BY ' + order_by 
                        }
                
                        var sql = "SELECT " + this.selectFields + " FROM `" + this.table + "`" + this.join + where + order_by + limit
                        this.createPool().query(sql, (err, result) => {
                            if (err) reject(err)
                            var data = {
                                data_list : result,
                                paging : paging
                            }
                            resolve(data)
                        })
                    }
                })
            } catch(ex) {
                reject(ex)
            }
        })
    }

    /**
     * query
     * @param {* sql statement} sql 
     */
    query(sql) {
        return new Promise((resolve, reject) => {
            try {
                this.createPool().query(sql, function(err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            } catch(ex) {
                reject(ex)
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
            try {
                this.createPool().query(sql, param, function(err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            } catch(ex) {
                reject(ex)
            }
        })
    }
}