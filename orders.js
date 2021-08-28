var con = require('../connection/connection')
var jwt = require('jsonwebtoken')
var secret_key = 'S1@E2@C3#R4$E5%T6^_K7&E8*Y9)+_)(*&&^%$$#@!'
var async = require('async')
var rn = require('random-number');

module.exports.place_order = function (req, res) {
    jwt.verify(req.headers.authorization.split(' ')[1], secret_key, function (err, decoded) {
        if (err) {
            res.send({
                "status": 0,
                "message": err.message
            })
        } else {
            var created_at = Math.floor(new Date().valueOf() / 1000);
            con.query("UPDATE users SET last_loggedin = '" + created_at + "' where id = '" + decoded.user_id + "' ", function (err_last_loggedin, result_last_loggedin) {
                if (err_last_loggedin) {
                    res.send({
                        "status": 0,
                        "message": "שגיאה בעת עדכון הנתונים"
                    })
                } else {
                    var options = {
                        min: 1000000000,
                        max: 9999999999,
                        integer: true
                    }
                    var order_number = rn(options);
                    con.query("INSERT into orders(user_id, product_id, order_number, quantity, total_amount, prescription_date, prescription_file, order_notes, created_at, updated_at) values ('" + decoded.user_id + "', '" + req.body.product_id + "','" + order_number + "', '" + req.body.quantity + "', '" + req.body.total_amount + "', '" + req.body.prescription_date + "', '" + req.body.prescription_file + "', '" + req.body.order_notes + "', '" + created_at + "', '" + created_at + "') ", function (err2, result) {
                        if (err2) {
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים"
                            })
                        } else {
                            res.send({
                                "status": 1,
                                "message": "הצלחה"
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.get_user_orders = function (req, res) {
    jwt.verify(req.headers.authorization.split(' ')[1], secret_key, function (err, decoded) {
        if (err) {
            res.send({
                "status": 0,
                "message": err.message
            })
        } else {
            var created_at = Math.floor(new Date().valueOf() / 1000);
            con.query("UPDATE users SET last_loggedin = '" + created_at + "' where id = '" + decoded.user_id + "' ", function (err_last_loggedin, result_last_loggedin) {
                if (err_last_loggedin) {
                    res.send({
                        "status": 0,
                        "message": "שגיאה בעת עדכון הנתונים"
                    })
                } else {
                    if (req.query.user_type == 'supplier')
                        var query = "SELECT o.order_number, o.order_status, o.created_at, o.total_amount, o.quantity, o.product_id, o.prescription_date, o.prescription_file, o.order_notes, u.first_name, u.last_name, u.image, p.name AS product_name, u.id AS user_id, p.group_id, p.price as products_price, p.stock , p.price_list_id, p.weight, p.description, p.concentration_t, p.concentration_c, p.dominance_id, p.category_id, p.image as products_image, p.images as products_images, p.code, p.barcode   from orders o, products p, users u where o.product_id = p.id and o.user_id = u.id and p.user_id = '" + decoded.user_id + "' "

                    if (req.query.user_type == 'user')
                        var query = "SELECT o.order_number, o.order_status, o.created_at, o.total_amount, o.quantity, o.product_id, o.prescription_date, o.prescription_file, o.order_notes, u.first_name, u.last_name, u.image, p.name AS product_name, u.id AS user_id, p.group_id, p.price as products_price, p.stock , p.price_list_id, p.weight, p.description, p.concentration_t, p.concentration_c, p.dominance_id, p.category_id, p.image as products_image, p.images as products_images, p.code, p.barcode from orders o, users u, products p where o.product_id = p.id and o.user_id = u.id and o.user_id = '" + decoded.user_id + "' "

                    con.query(query, function (err2, rows) {
                        if (err2) {
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים",
                                // err: err2
                            })
                        } else {
                            res.send({
                                "status": 1,
                                "message": "הצלחה",
                                "data": rows,
                                // query :query
                            })
                        }
                    })
                }
            })
        }
    })
}
module.exports.get_user_filter_orders = function (req, res) {
    let query;
    jwt.verify(req.headers.authorization.split(' ')[1], secret_key, function (err, decoded) {
        if (err) {
            res.status(400).send({
                "status": 0,
                "message": err.message
            })
        } else {
            var created_at = Math.floor(new Date().valueOf() / 1000);
            con.query("UPDATE users SET last_loggedin = '" + created_at + "' where id = '" + decoded.user_id + "' ", function (err_last_loggedin, result_last_loggedin) {
                if (err_last_loggedin) {
                    res.status(200).send({
                        "status": 0,
                        "message": "שגיאה בעת עדכון הנתונים"
                    })
                } else {
                    if (req.body.user_type == "user") {

                        query = "SELECT o.id as order_id, o.user_id, o.product_id , p.name as product_name, o.order_number, o.order_status,o.total_amount ,FROM_UNIXTIME(o.created_at, '%d.%m.%Y') AS date FROM orders o left join products p on o.product_id = p.id  WHERE o.user_id ='" + decoded.user_id + "' and o.order_status = '" + req.body.status + "' and ( FROM_UNIXTIME(o.created_at, '%d.%m.%Y') <='" + req.body.from + "' or FROM_UNIXTIME(o.created_at, '%d.%m.%Y') >= '" + req.body.until + "') order by o.created_at desc";

                    }
                    if (req.body.user_type == "supplier") {

                        query = "SELECT o.id as order_id, o.user_id, o.product_id , p.name as product_name, o.order_number, o.order_status,o.total_amount , FROM_UNIXTIME(o.created_at, '%d.%m.%Y') AS date FROM orders o left join products p on o.product_id = p.id  WHERE p.user_id ='" + decoded.user_id + "' and o.order_status = '" + req.body.status + "' and o.product_id = '" + req.body.product_id + "' and ( FROM_UNIXTIME(o.created_at, '%d.%m.%Y') <='" + req.body.from + "' or FROM_UNIXTIME(o.created_at, '%d.%m.%Y') >= '" + req.body.until + "') order by o.created_at desc"
                    }

                    console.log(query);

                    con.query(query, function (err, rows) {
                        if (err) {
                            res.status(500).send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים"
                            })
                        } else {
                            res.status(200).send({
                                "status": 1,
                                "message": "הצלחה",
                                "data": rows,
                                //query:query
                            })
                        }
                    })
                }
            })
        }
    })
}


module.exports.get_search_orders = function (req, res) {
    jwt.verify(req.headers.authorization.split(' ')[1], secret_key, function (err, decoded) {
        if (err) {
            res.status(400).send({
                "status": 0,
                "message": err.message
            })
        } else {
            var created_at = Math.floor(new Date().valueOf() / 1000);
            con.query("UPDATE users SET last_loggedin = '" + created_at + "' where id = '" + decoded.user_id + "' ", function (err_last_loggedin, result_last_loggedin) {
                if (err_last_loggedin) {
                    res.status(500).send({
                        "status": 0,
                        "message": "שגיאה בעת עדכון הנתונים"
                    })
                } else {

                    // let query = "SELECT o.order_number, o.order_status, o.created_at, o.total_amount, u.first_name, u.last_name, u.image, p.name as product_name from orders o left join products p on o.product_id = p.id left join users u on o.user_id = u.id where o.user_id = '" + decoded.user_id + "' and (p.name LIKE '%" + req.body.key + "%' or u.first_name like '%" + req.body.key + "%' or u.last_name like '%" + req.body.key + "%') order by o.created_at desc"

                    let query = "SELECT o.order_number, o.order_status, o.created_at,o.total_amount, u.first_name,u.last_name,  u.id , p.name AS product_name, p.image  FROM orders o LEFT JOIN products p ON o.product_id = p.id left join users u on p.user_id = u.id WHERE o.user_id = '" + decoded.user_id + "' AND p.name LIKE '%" + req.body.key + "%' order BY o.created_at DESC"

                    con.query(query, function (err, rows) {
                        if (err) {
                            res.status(500).send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים",
                                query: query,
                                err: err,
                            });
                        } else {
                            res.status(200).send({
                                "status": 1,
                                "message": "הצלחה",
                                "data": rows
                            })
                        }
                    })
                }
            })
        }
    })
}


module.exports.get_order_detail = function (req, res) {
    let query;

    jwt.verify(req.headers.authorization.split(' ')[1], secret_key, function (err, decoded) {
        if (err) {
            res.status(400).send({
                "status": 0,
                "message": err.message
            })
        } else {
            var created_at = Math.floor(new Date().valueOf() / 1000);
            con.query("UPDATE users SET last_loggedin = '" + created_at + "' where id = '" + decoded.user_id + "' ", function (err_last_loggedin, result_last_loggedin) {
                if (err_last_loggedin) {
                    res.status(500).send({
                        "status": 0,
                        "message": "שגיאה בעת עדכון הנתונים",
                        err: err_last_loggedin
                    })
                } else {
                    if (req.body.user_type == 'user') {


                        query = "SELECT o.id AS orderId, o.product_id, o.order_status, o.quantity AS order_quantity, o.total_amount AS ordered_total_amount, o.order_number, o.order_notes, o.created_at, p.price AS product_price, p.weight AS product_weight, p.concentration_t, p.concentration_c, p.name AS product_name, p.price_list_id, p.image as product_image, p.user_id as supplier_id, c.name as category, d.name AS dominance_name, u.first_name as supplier_first_name, u.last_name as supplier_last_name , u.phone_number as supplier_phone_number, u.image AS supplier_image FROM orders o LEFT JOIN products p ON o.product_id = p.id LEFT JOIN dominance d ON p.dominance_id = d.id LEFT JOIN users u ON p.user_id = u.id left join categories c on p.category_id = c.id WHERE o.user_id = '" + decoded.user_id + "' AND o.product_id = '" + req.body.product_id + "' AND order_number = '" + req.body.order_number + "'";

                        // let query = "SELECT o.id AS orderId, o.user_id, o.product_id, o.order_status, o.quantity as order_quantity, o.total_amount as ordered_total_amount, o.order_number, o.order_notes ,o.created_at , p.price as product_price, p.weight as product_weight, p.concentration_t, p.concentration_c, p.name as product_name, p.price_list_id, d.name as dominance_name, u.first_name, u.last_name, u.phone_number , u.image as user_image FROM orders o LEFT JOIN products p ON o.product_id = p.id left join dominance d on p.dominance_id= d.id left join users u on o.user_id = u.id where o.user_id= '" + decoded.user_id + "'and o.product_id= '" + req.body.product_id + "' and order_number= '" + req.body.order_number + "'";

                    }

                    if (req.body.user_type == 'supplier') {
                        //query = "SELECT o.id AS orderId, o.product_id, o.order_status, o.quantity AS order_quantity,o.total_amount AS ordered_total_amount, o.order_number, o.order_notes, o.created_at, p.price AS product_price, p.weight AS product_weight, p.concentration_t, p.concentration_c, p.name AS product_name, p.price_list_id, p.image AS product_image, p.user_id AS supplier_id, c.name AS category, d.name AS dominance_name, u.first_name AS supplier_first_name, u.last_name AS supplier_last_name, u.phone_number AS supplier_phone_number, u.image AS supplier_image FROM orders o LEFT JOIN products p ON o.product_id = p.id LEFT JOIN dominance d ON p.dominance_id = d.id LEFT JOIN users u ON p.user_id = u.id LEFT JOIN categories c ON p.category_id = c.id WHERE p.user_id = '" + decoded.user_id + "' AND o.product_id = '" + req.body.product_id + "' AND order_number = '" + req.body.order_number + "'"
                        query = "SELECT o.id AS orderId, o.product_id, o.order_status, o.quantity AS order_quantity,o.total_amount AS ordered_total_amount, o.order_number, o.order_notes, o.created_at , p.price AS product_price, p.weight AS product_weight, p.concentration_t, p.concentration_c, p.name AS product_name, p.price_list_id, p.image AS product_image, p.user_id AS supplier_id, c.name AS category, d.name AS dominance_name, u.first_name AS supplier_first_name, u.last_name AS supplier_last_name, u.phone_number AS supplier_phone_number, u.image AS supplier_image FROM orders o LEFT JOIN products p ON o.product_id = p.id LEFT JOIN dominance d ON p.dominance_id = d.id LEFT JOIN users u ON p.user_id = u.id LEFT JOIN categories c ON p.category_id = c.id WHERE p.user_id = '" + decoded.user_id + "' AND o.product_id = '" + req.body.product_id + "' AND order_number = '" + req.body.order_number + "'"

                    }



                    con.query(query, function (err, row) {
                        if (err) {
                            res.status(500).send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים",
                                err: err
                            })
                        } else {
                            res.status(200).send({
                                "status": 1,
                                "message": "הצלחה",
                                "data": row[0]
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.edit_order = function (req, res) {
    let query;
    jwt.verify(req.headers.authorization.split(' ')[1], secret_key, function (err, decoded) {
        if (err) {
            res.status(400).send({
                "status": 0,
                "message": err.message
            })
        } else {
            var created_at = Math.floor(new Date().valueOf() / 1000);
            con.query("UPDATE users SET last_loggedin = '" + created_at + "' where id = '" + decoded.user_id + "' ", function (err_last_loggedin, result_last_loggedin) {
                if (err_last_loggedin) {
                    res.status(500).send({
                        "status": 0,
                        "message": "שגיאה בעת עדכון הנתונים"
                    })
                } else {
                    //let decoded = {user_id:'199'}
                    if (req.body.user_type == 'supplier') {
                        query = "UPDATE `orders` SET order_status = '" + req.body.order_status + "' WHERE order_number = '" + req.body.order_number + "' AND user_id = '" + decoded.user_id + "' AND product_id = '" + req.body.product_id + "'";

                        console.log(query);
                        con.query(query, function (err, rows) {
                            if (err) {
                                res.status(500).send({
                                    "status": 0,
                                    "message": "שגיאה בעת עדכון הנתונים",
                                    err: err
                                })
                            } else {
                                res.status(200).send({
                                    "status": 1,
                                    "message": "הצלחה"
                                })
                            }
                        })
                    } else {
                        res.status(400).send({
                            "status": 0,
                            "message": "שגיאה בעת עדכון הנתונים",
                        })
                    }

                }
            })
        }
    })
}