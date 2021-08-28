var con = require('../connection/connection')
var jwt = require('jsonwebtoken')
var secret_key = 'S1@E2@C3#R4$E5%T6^_K7&E8*Y9)+_)(*&&^%$$#@!'
var async = require('async')
var groupModel = require('../models/group_model')
var userModel = require('../models/user_model')
const upload = require('../helper');
const fs = require('fs');
const e = require('express')

module.exports.get_groups = function (req, res) {
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
                        // error :err_last_loggedin
                    })
                } else {
                    con.query("SELECT g.*, 2 as type, count(d.id) as unread_msgs, c.message as last_message, c.image as last_msg_image, c.stock_image, c.product_id, u.first_name as sender_name, u.nick_name, c.created_at as last_msg_time_unix from groups g LEFT JOIN messages c ON g.id = c.group_id and c.created_at = (select MAX(messages.created_at) from messages where g.id = messages.group_id) LEFT JOIN messages d ON g.id = d.group_id and d.created_at > (select last_loggedin from group_members where g.id = group_members.group_id && group_members.user_id = '" + decoded.user_id + "') && d.sender_id != '" + decoded.user_id + "' LEFT JOIN users u ON c.sender_id = u.id where group_type = 'group' and g.is_deleted = 'No' and g.status != 'Suspended' group by g.id order by c.created_at DESC", function (err, rows) {
                        if (err) {
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת אחזור נתונים"
                                //error :err
                            })
                        } else {
                            for (var i = 0; i < rows.length; i++) {
                                rows[i].is_favorite = 0
                                rows[i].is_mute = 1
                                rows[i].is_pin = 0
                                rows[i].likes_count = 0
                                rows[i].show_survey = 'No'

                                if (rows[i].nick_name == null)
                                    rows[i].nick_name = ''

                                if (rows[i].last_message == '') {
                                    rows[i].last_message = rows[i].last_msg_image
                                    rows[i].last_message_type = 'image'
                                } else {
                                    rows[i].last_message_type = 'text'
                                }

                                if (rows[i].image != '') {
                                    var idk = rows[i].image.includes('/ckfinder/')
                                    if (idk)
                                        rows[i].image = 'https://cannabiotic.shtibel.com' + rows[i].image
                                }

                                if (rows[i].stock_image != '')
                                    rows[i].last_message_type = 'stock_image'

                                if (rows[i].product_id != 0)
                                    rows[i].last_message_type = 'product'

                                if (rows[i].product_id == null || rows[i].stock_image == null)
                                    rows[i].last_message_type = ''
                            }
                            con.query("SELECT g.*, 0 as type, count(d.id) as unread_msgs, c.message as last_message, c.image as last_msg_image, c.stock_image, c.product_id, u.first_name as sender_name, u.nick_name, c.created_at as last_msg_time_unix from groups g LEFT JOIN messages c ON g.id = c.group_id and c.created_at = (select MAX(messages.created_at) from messages where g.id = messages.group_id) LEFT JOIN messages d ON g.id = d.group_id and d.created_at > (select last_loggedin from group_members where g.id = group_members.group_id && group_members.user_id = '" + decoded.user_id + "') && d.sender_id != '" + decoded.user_id + "' LEFT JOIN users u ON c.sender_id = u.id where group_type = 'stock' and g.is_deleted = 'No' and g.status != 'Suspended' group by g.id order by c.created_at DESC", function (err2, rows2) {
                                if (err2) {
                                    res.send({
                                        "status": 0,
                                        "message": "שגיאה בעת אחזור נתונים"
                                        //error :err2
                                    })
                                } else {
                                    for (var j = 0; j < rows2.length; j++) {
                                        rows2[j].is_favorite = 0
                                        rows2[j].is_mute = 1
                                        rows2[j].is_pin = 0
                                        rows2[j].likes_count = 0
                                        rows2[j].show_survey = 'No'

                                        if (rows2[j].nick_name == null)
                                            rows2[j].nick_name = ''

                                        if (rows2[j].last_message == '') {
                                            rows2[j].last_message = rows2[j].last_msg_image
                                            rows2[j].last_message_type = 'image'
                                        } else {
                                            rows2[j].last_message_type = 'text'
                                        }

                                        if (rows2[j].image != '') {
                                            var idk2 = rows2[j].image.includes('/ckfinder/')
                                            if (idk2)
                                                rows2[j].image = 'https://cannabiotic.shtibel.com' + rows2[j].image
                                        }

                                        if (rows2[j].stock_image != '')
                                            rows2[j].last_message_type = 'stock_image'

                                        if (rows2[j].product_id != 0)
                                            rows2[j].last_message_type = 'product'

                                        if (rows2[j].product_id == null || rows2[j].stock_image == null)
                                            rows2[j].last_message_type = ''
                                    }
                                    con.query("SELECT g.*, 1 as type, count(d.id) as unread_msgs, c.message as last_message, c.image as last_msg_image, c.stock_image, c.product_id, u.first_name as sender_name, u.nick_name, c.created_at as last_msg_time_unix from groups g LEFT JOIN messages c ON g.id = c.group_id and c.created_at = (select MAX(messages.created_at) from messages where g.id = messages.group_id) LEFT JOIN messages d ON g.id = d.group_id and d.created_at > (select last_loggedin from group_members where g.id = group_members.group_id && group_members.user_id = '" + decoded.user_id + "') && d.sender_id != '" + decoded.user_id + "' LEFT JOIN users u ON c.sender_id = u.id where group_type = 'species' and g.is_deleted = 'No' and g.status != 'Suspended' group by g.id order by c.created_at DESC", function (err3, rows3) {
                                        if (err3) {
                                            res.send({
                                                "status": 0,
                                                "message": "שגיאה בעת אחזור נתונים"
                                                // error :err3
                                            })
                                        } else {
                                            for (var k = 0; k < rows3.length; k++) {
                                                rows3[k].is_favorite = 0
                                                rows3[k].is_mute = 1
                                                rows3[k].is_pin = 0
                                                rows3[k].likes_count = 0
                                                rows3[k].show_survey = 'No'

                                                if (rows3[k].nick_name == null)
                                                    rows3[k].nick_name = ''

                                                if (rows3[k].last_message == '') {
                                                    rows3[k].last_message = rows3[k].last_msg_image
                                                    rows3[k].last_message_type = 'image'
                                                } else {
                                                    rows3[k].last_message_type = 'text'
                                                }

                                                if (rows3[k].image != '') {
                                                    var idk3 = rows3[k].image.includes('/ckfinder/')
                                                    if (idk3)
                                                        rows3[k].image = 'https://cannabiotic.shtibel.com' + rows3[k].image
                                                }

                                                if (rows3[k].stock_image != '')
                                                    rows3[k].last_message_type = 'stock_image'

                                                if (rows3[k].product_id != 0)
                                                    rows3[k].last_message_type = 'product'

                                                if (rows3[k].product_id == null || rows3[k].stock_image == null)
                                                    rows3[k].last_message_type = ''
                                            }
                                            res.send({
                                                "status": 1,
                                                "message": "הצלחה",
                                                "groups": rows,
                                                "stocks": rows2,
                                                "species": rows3
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.search_groups_messages = function (req, res) {
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
                    req.body.search_key = req.body.search_key.toLowerCase()
                    con.query("SELECT groups.*, (SELECT count(id) as id FROM group_members where groups.id = group_members.group_id && group_members.is_favorite = '1') as likes_count, b.is_favorite, b.is_mute, b.is_pin, 2 as type, count(d.id) as unread_msgs, c.message as last_message, c.image as last_msg_image, b.show_survey, users.first_name as sender_name, users.nick_name, from_unixtime(c.created_at, '%Y-%m-%d %H:%i:%s') as last_msg_time from groups LEFT JOIN group_members b ON groups.id = b.group_id && b.user_id = '" + decoded.user_id + "' LEFT JOIN messages c ON groups.id = c.group_id and c.created_at = (select MAX(messages.created_at) from messages where groups.id = messages.group_id) LEFT JOIN messages d ON groups.id = d.group_id and d.created_at > (select last_loggedin from group_members where groups.id = group_members.group_id && group_members.user_id = '" + decoded.user_id + "') && d.sender_id != '" + decoded.user_id + "' LEFT JOIN users ON c.sender_id = users.id where LOWER(name) like '%" + req.body.search_key + "%' and group_type = 'group' and groups.is_deleted = 'No' and groups.status != 'Suspended' group by groups.id order by b.is_pin DESC, c.created_at DESC, b.id DESC", function (err, rows) {
                        if (err) {
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת אחזור נתונים"
                            })
                        } else {
                            con.query("SELECT groups.*, (SELECT count(id) as id FROM group_members where groups.id = group_members.group_id && group_members.is_favorite = '1') as likes_count, b.is_favorite, b.is_mute, b.is_pin, 0 as type, count(d.id) as unread_msgs, c.message as last_message, c.image as last_msg_image, b.show_survey, users.first_name as sender_name, users.nick_name, from_unixtime(c.created_at, '%Y-%m-%d %H:%i:%s') as last_msg_time from groups LEFT JOIN group_members b ON groups.id = b.group_id && b.user_id = '" + decoded.user_id + "' LEFT JOIN messages c ON groups.id = c.group_id and c.created_at = (select MAX(messages.created_at) from messages where groups.id = messages.group_id) LEFT JOIN messages d ON groups.id = d.group_id and d.created_at > (select last_loggedin from group_members where groups.id = group_members.group_id && group_members.user_id = '" + decoded.user_id + "') && d.sender_id != '" + decoded.user_id + "' LEFT JOIN users ON c.sender_id = users.id where LOWER(name) like '%" + req.body.search_key + "%' and group_type = 'stock' and groups.is_deleted = 'No' and groups.status != 'Suspended' group by groups.id order by b.is_pin DESC, c.created_at DESC, b.id DESC", function (err2, rows2) {
                                if (err2) {
                                    res.send({
                                        "status": 0,
                                        "message": "שגיאה בעת אחזור נתונים"
                                    })
                                } else {
                                    con.query("SELECT groups.*, (SELECT count(id) as id FROM group_members where groups.id = group_members.group_id && group_members.is_favorite = '1') as likes_count, b.is_favorite, b.is_mute, b.is_pin, 1 as type, count(d.id) as unread_msgs, c.message as last_message, c.image as last_msg_image, b.show_survey, users.first_name as sender_name, users.nick_name, from_unixtime(c.created_at, '%Y-%m-%d %H:%i:%s') as last_msg_time from groups LEFT JOIN group_members b ON groups.id = b.group_id && b.user_id = '" + decoded.user_id + "' LEFT JOIN messages c ON groups.id = c.group_id and c.created_at = (select MAX(messages.created_at) from messages where groups.id = messages.group_id) LEFT JOIN messages d ON groups.id = d.group_id and d.created_at > (select last_loggedin from group_members where groups.id = group_members.group_id && group_members.user_id = '" + decoded.user_id + "') && d.sender_id != '" + decoded.user_id + "' LEFT JOIN users ON c.sender_id = users.id where LOWER(name) like '%" + req.body.search_key + "%' and group_type = 'species' and groups.is_deleted = 'No' and groups.status != 'Suspended' group by groups.id order by b.is_pin DESC, c.created_at DESC, b.id DESC", function (err3, rows3) {
                                        if (err) {
                                            res.send({
                                                "status": 0,
                                                "message": "שגיאה בעת אחזור נתונים"
                                            })
                                        } else {
                                            con.query("SELECT messages.*, users.first_name as sender_name, users.image as sender_image, users.nick_name from messages INNER JOIN users on messages.sender_id = users.id where LOWER(messages.message) like '%" + req.body.search_key + "%' and messages.is_deleted = 'No' order by id DESC", function (err4, rows4) {
                                                if (err4) {
                                                    res.send({
                                                        "status": 0,
                                                        "message": "שגיאה בעת אחזור נתונים"
                                                    })
                                                } else {
                                                    res.send({
                                                        "status": 1,
                                                        "message": "הצלחה",
                                                        "groups": rows,
                                                        "stocks": rows2,
                                                        "species": rows3,
                                                        "messages": rows4
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.mark_favourite_unfavourite = function (req, res) {
    let query;
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
                    con.query("select * from group_members where user_id = '" + decoded.user_id + "' and group_id = '" + req.body.group_id + "' ", (err1, result) => {
                        if (err1) {
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים"
                            })
                        } else {
                            if (result[0].is_pin == 0 && result[0].is_mute == 1 && req.body.is_favorite == 0) {
                                query = "UPDATE group_members SET is_favorite = '" + req.body.is_favorite + "', updated_at = '" + created_at + "' , setting_changed = 'No' where user_id = '" + decoded.user_id + "' and group_id = '" + req.body.group_id + "' ";
                            } else {
                                query = "UPDATE group_members SET is_favorite = '" + req.body.is_favorite + "', updated_at = '" + created_at + "' , setting_changed = 'Yes' where user_id = '" + decoded.user_id + "' and group_id = '" + req.body.group_id + "' ";
                            }
                            con.query(query, function (err2, result2) {
                                if (err2) {
                                    res.send({
                                        "status": 0,
                                        "messages": "שגיאה בעת עדכון הנתונים"
                                    })
                                } else {
                                    let query2 = "update groups set likes =(SELECT COUNT(id) AS id FROM group_members WHERE group_id= '" + req.body.group_id + "' && group_members.is_favorite = '1') where id ='" + req.body.group_id + "'";
                                    //console.log(query2);
                                    con.query(query2, (err3, result3) => {
                                        if (err3) {
                                            console.log(err3)
                                            res.send({
                                                "status": 0,
                                                "messages": "שגיאה בעת עדכון הנתונים"
                                            })
                                        } else {
                                            console.log(result3)
                                            res.send({
                                                "status": 1,
                                                "messages": "הצלחה"
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })

                }
            })
        }
    })
}

module.exports.mute_unmute_group = function (req, res) {
    let query;
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
                    con.query("select * from group_members where user_id = '" + decoded.user_id + "' and group_id = '" + req.body.group_id + "' ", (err1, result) => {
                        if (err1) {
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים"
                            })
                        } else {
                            if (result[0].is_pin == 0 && req.body.is_mute == 1 && result[0].is_favorite == 0) {
                                query = "UPDATE group_members SET is_mute = '" + req.body.is_mute + "', updated_at = '" + created_at + "' , setting_changed = 'No' where user_id = '" + decoded.user_id + "' and group_id = '" + req.body.group_id + "' "
                            } else {
                                query = "UPDATE group_members SET is_mute = '" + req.body.is_mute + "', updated_at = '" + created_at + "' , setting_changed = 'Yes' where user_id = '" + decoded.user_id + "' and group_id = '" + req.body.group_id + "' "
                            }
                            con.query(query, function (err2, result) {
                                if (err2) {
                                    res.send({
                                        "status": 0,
                                        "messages": "שגיאה בעת עדכון הנתונים"
                                    })
                                } else {
                                    res.send({
                                        "status": 1,
                                        "messages": "הצלחה"
                                    })
                                }
                            })
                        }

                    })
                }
            })
        }
    })
}

module.exports.get_group_details = function (req, res) {
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
                    con.query("SELECT * from groups where id = '" + req.body.group_id + "' and is_deleted = 'No'", function (err2, rows) {
                        if (err2) {
                            res.send({
                                "status": 0,
                                "messages": "שגיאה בעת אחזור נתונים"
                            })
                        } else {
                            if (!rows.length) {
                                res.send({
                                    "status": 0,
                                    "messages": "אין קבוצה"
                                })
                            } else {
                                if (rows[0].image != '') {
                                    var idk = rows[0].image.includes('/ckfinder/')
                                    if (idk)
                                        rows[0].image = 'https://' + req.get('host') + rows[0].image
                                }
                                con.query("SELECT survey_questions.id as id, survey_questions.question, SUM(survey_answers.good) as good, SUM(survey_answers.average) as average, SUM(survey_answers.bad) as bad FROM survey_questions LEFT JOIN survey_answers ON survey_questions.id = survey_answers.question_id where survey_questions.group_id = '" + req.body.group_id + "' group by survey_questions.id ", function (err3, rows2) {
                                    if (err3) {
                                        res.send({
                                            "status": 0,
                                            "messages": "שגיאה בעת אחזור נתונים"
                                        })
                                    } else {
                                        rows[0].survey = rows2
                                        if (!rows2.length) {
                                            res.send({
                                                "status": 1,
                                                "messages": "פרטי הקבוצה",
                                                "data": rows[0]
                                            })
                                        } else {
                                            var final_data = [];
                                            var i = 0;
                                            async.mapSeries(rows2, function (data, callback) {
                                                con.query("SELECT * from survey_answers where user_id = '" + decoded.user_id + "' and question_id = '" + data.id + "' ", function (err4, rows3) {
                                                    if (err4)
                                                        throw err4;

                                                    if (!rows3.length) {
                                                        data.answer = '';
                                                        data.good = 0
                                                        data.average = 0
                                                        data.bad = 0
                                                    } else {
                                                        if (rows3[0].good > 0)
                                                            data.answer = 'good';

                                                        if (rows3[0].average > 0)
                                                            data.answer = 'average';

                                                        if (rows3[0].bad > 0)
                                                            data.answer = 'bad';
                                                    }

                                                    final_data[i] = rows;
                                                    final_data[i].survey = data;
                                                    i++;
                                                    return callback(null, final_data[0]);
                                                });
                                            }, function (err, results) {
                                                res.send({
                                                    "status": 1,
                                                    "messages": "הצלחה",
                                                    "data": final_data[0][0]
                                                })
                                            });
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
    })
}

module.exports.add_survey_answers = function (req, res) {
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
                    var parsed_data = JSON.parse(req.body.data)
                    var i = 0
                    parsed_data.answers.forEach(function (element) {
                        con.query("INSERT into survey_answers(user_id, question_id, good, average, bad, created_at, updated_at) values ('" + decoded.user_id + "', '" + element.question_id + "', '" + element.good + "', '" + element.average + "', '" + element.bad + "', '" + created_at + "', '" + created_at + "')", function (err2, result) {
                            if (err2)
                                throw err2;

                            i++;
                            if (i == parsed_data.answers.length) {
                                con.query("UPDATE group_members SET show_survey = 'No' where group_id = '" + req.body.group_id + "' and user_id = '" + decoded.user_id + "' ", function (err3, result2) {
                                    if (err3) {
                                        res.send({
                                            "status": 0,
                                            "messages": "שגיאה בעת עדכון הנתונים"
                                        })
                                    } else {
                                        res.send({
                                            "status": 1,
                                            "messages": "הצלחה"
                                        })
                                    }
                                })
                            }
                        })
                    })
                }
            })
        }
    })
}

module.exports.update_group = function (req, res) {
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
                        "message": "שגיאה בעת עדכון הנתונים",
                        "error": err_last_loggedin
                    })
                } else {
                    con.query("UPDATE groups SET image = '" + req.body.image + "', opening_hours = '" + req.body.opening_hours + "', description = '" + req.body.description + "', address = '" + req.body.address + "', phone_number = '" + req.body.phone_number + "', email = '" + req.body.email + "' where id = '" + req.body.group_id + "' ", function (err2, result) {
                        if (err2) {
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים",
                                "error": err2
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

module.exports.pin_unpin_group = function (req, res) {
    let query;
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
                    con.query("select * from group_members where user_id = '" + decoded.user_id + "' and group_id = '" + req.body.group_id + "' ", (err1, result) => {
                        if (err1) {
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים"
                            })
                        } else {
                            if (req.body.is_pin == 0 && result[0].is_mute == 1 && result[0].is_favorite == 0) {
                                query = "UPDATE group_members SET is_pin = '" + req.body.is_pin + "', updated_at = '" + created_at + "' ,setting_changed = 'No' where user_id = '" + decoded.user_id + "' and group_id = '" + req.body.group_id + "' ";
                            } else {
                                query = "UPDATE group_members SET is_pin = '" + req.body.is_pin + "', updated_at = '" + created_at + "' , setting_changed = 'Yes' where user_id = '" + decoded.user_id + "' and group_id = '" + req.body.group_id + "' "
                            }

                            // console.log(result, query);

                            con.query(query, function (err2, result2) {
                                if (err2) {
                                    console.log(err2);
                                    res.send({
                                        "status": 0,
                                        "messages": "שגיאה בעת עדכון הנתונים"
                                    })
                                } else {
                                    res.send({
                                        "status": 1,
                                        "messages": "הצלחה"
                                    })
                                }
                            })
                        }
                    })

                }
            })
        }
    })
}

module.exports.create_product = function (req, res) {
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
                    con.query("INSERT into products(group_id,user_id, name, price, concentration_t, concentration_c, dominance_id, category_id, image, stock, price_list_id, weight,description, code, internal_name, barcode, images, created_at, updated_at) values('" + req.body.group_id +"','"+decoded.user_id+ "', '" + req.body.name + "', '" + req.body.price + "', '" + req.body.concentration_t + "', '" + req.body.concentration_c + "', '" + req.body.dominance_id + "',  '" + req.body.category_id + "', '" + req.body.image + "', '" + req.body.stock + "','" + req.body.price_list_id + "','" + req.body.weight + "','" + req.body.description + "','" + req.body.code + "','" + req.body.internal_name + "','" + req.body.barcode + "','" + req.body.images + "','" + created_at + "', '" + created_at + "')", function (err2, result) {
                        if (err2) {
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים"
                            })
                        } else {
                            res.send({
                                "status": 1,
                                "message": "הצלחה",
                                "product_id": result.insertId
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.get_dominance_categories = function (req, res) {
    jwt.verify(req.headers.authorization.split(' ')[1], secret_key, function (err, decoded) {
        if (err) {
            res.send({
                "status": 0,
                "message": err.message
            })
        } else {
            var created_at = Math.floor(new Date().valueOf() / 1000);
            con.query("UPDATE users SET last_loggedin = '" + created_at + "' where id = '" + decoded.user_id + "' ", function (err2, result) {
                if (err2) {
                    res.send({
                        "status": 0,
                        "message": "שגיאה בעת עדכון הנתונים"
                    })
                } else {
                    con.query("SELECT * from dominance where deleted_at = '' ", function (err3, rows) {
                        if (err3) {
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת אחזור נתונים"
                            })
                        } else {
                            con.query("SELECT * from categories where deleted_at = '' ", function (err4, rows2) {
                                if (err4) {
                                    res.send({
                                        "status": 0,
                                        "message": "שגיאה בעת אחזור נתונים"
                                    })
                                } else {
                                    res.send({
                                        "status": 1,
                                        "message": "הצלחה",
                                        "dominance": rows,
                                        "categories": rows2
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.edit_product = function (req, res) {
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
                    con.query("UPDATE products SET name = '" + req.body.name + "', price = '" + req.body.price + "', concentration_t = '" + req.body.concentration_t + "', concentration_c = '" + req.body.concentration_c + "', dominance_id = '" + req.body.dominance_id + "', category_id = '" + req.body.category_id + "', price_list_id = '" + req.body.price_list_id + "', weight = '" + req.body.weight + "', description ='" + req.body.description + "', image = '" + req.body.image + "', images= '" + req.body.images + "' , code = " + req.body.code + " , internal_name= '" + req.body.internal_name + "', barcode= '" + req.body.barcode + "', updated_at = '" + created_at + "', user_id'"+ decoded.user_id +"' where id = '" + req.body.product_id + "' ", function (err2, result) {
                        if (err2) {
                            res.status(500).send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים"
                            })
                        } else {
                            con.query("SELECT p.*, c.name as category_name, d.name as dominance_name from products p, categories c, dominance d where p.id = '" + req.body.product_id + "' and p.category_id = c.id and p.dominance_id = d.id", function (err3, rows) {
                                if (err3) {
                                    res.status(500).send({
                                        "status": 0,
                                        "message": "שגיאה בעת עדכון הנתונים"
                                    })
                                } else {
                                    res.status(200).send({
                                        "status": 1,
                                        "message": "הצלחה",
                                        "data": rows[0]
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.delete_product = function (req, res) {
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
                    con.query("UPDATE products SET deleted_at = '" + created_at + "' where id = '" + req.body.product_id + "' ", function (err2, result) {
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

module.exports.get_groups_user_settings = function (req, res) {
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
                    // const query = "SELECT g.id, (SELECT count(id) as id FROM group_members where g.id = group_members.group_id && group_members.is_favorite = '1') as likes_count, gm.is_favorite, gm.is_mute, gm.is_pin, gm.show_survey from groups g LEFT JOIN group_members gm ON g.id = gm.group_id and gm.user_id = '" + decoded.user_id + "' where g.id IN(" + req.body.group_ids + ") and g.group_type = '" + req.body.group_type + "' and g.is_deleted = 'No' and g.status != 'Suspended' order by gm.is_pin DESC, gm.id DESC ";

                    const query1 = "SELECT g.id, g.likes as likes_count, gm.is_favorite, gm.is_mute, gm.is_pin , gm.show_survey from groups g LEFT JOIN group_members gm ON g.id = gm.group_id and gm.user_id = '" + decoded.user_id + "' where g.group_type = '" + req.body.group_type + "' and g.is_deleted = 'No' and gm.setting_changed= 'Yes' and g.status != 'Suspended' order by gm.is_pin DESC, gm.id DESC"

                    con.query(query1, function (err1, rows) {
                        if (err1) {
                            console.log(err1);
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת אחזור נתונים"
                            })
                        } else {
                            res.send({
                                "status": 1,
                                "message": "הצלחה",
                                "data": rows,
                                "group_type": req.body.group_type
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.get_groups_user_setting = async function (req, res) {
    let result = [];
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
                    const query1 = "SELECT g.id, (SELECT count(id) as id FROM group_members where g.id = group_members.group_id && group_members.is_favorite = '1') as likes_count, gm.is_favorite, gm.is_mute, gm.is_pin ,gm.show_survey from groups g LEFT JOIN group_members gm ON g.id = gm.group_id and gm.user_id = '" + decoded.user_id + "' where g.group_type = '" + req.body.group_type + "' and g.is_deleted = 'No' and gm.setting_changed= 'Yes' and g.status != 'Suspended' order by gm.is_pin DESC, gm.id DESC"

                    console.log(query1);
                    con.query(query1, function (err1, rows) {
                        if (err1) {
                            console.log(err1)
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת אחזור נתונים"
                            })
                        } else {
                            res.send({
                                "status": 1,
                                "message": "הצלחה",
                                "data": rows,
                                "group_type": req.body.group_type
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.get_groups_v2 = async function (req, res) {
    try {
        const user_id = await userModel.jwt_verify(req.headers.authorization.split(' ')[1]);
        const created_at = Math.floor(new Date().valueOf() / 1000);
        const update_user = await userModel.update_user_last_loggedin(user_id, created_at);
        const groups = await groupModel.get_groups(user_id, 'group', 2, req.get('host'));
        const stocks = await groupModel.get_groups(user_id, 'stock', 0, req.get('host'));
        const species = await groupModel.get_groups(user_id, 'species', 1, req.get('host'));
        return res.send({
            "status": 1,
            "message": "הצלחה",
            "groups": groups,
            "stocks": stocks,
            "species": species
        })
    } catch (error) {
        return res.send({
            "status": 0,
            "message": error
        })
    }
}

module.exports.get_group_details_v2 = async function (req, res) {
    try {
        const user_id = await userModel.jwt_verify(req.headers.authorization.split(' ')[1]);
        const created_at = Math.floor(new Date().valueOf() / 1000);
        const update_user = await userModel.update_user_last_loggedin(user_id, created_at);

        const group_details = await groupModel.get_group_details(req.body.group_id);
        const group_survey = await groupModel.get_group_survey(req.body.group_id, user_id);
        group_details.survey = group_survey
        return res.send({
            "status": 1,
            "message": "הצלחה",
            "groups": group_details
        })
    } catch (error) {
        return res.send({
            "status": 0,
            "message": error
        })
    }
}

module.exports.mark_favourite_unfavourite_v2 = async function (req, res) {
    try {
        const user_id = await userModel.jwt_verify(req.headers.authorization.split(' ')[1]);
        const created_at = Math.floor(new Date().valueOf() / 1000);
        const update_user = await userModel.update_user_last_loggedin(user_id, created_at);

        const mark_favourite_unfavourite = await groupModel.mark_favourite_unfavourite(req.body.group_id, user_id, req.body.is_favorite, created_at);
        return res.send({
            "status": 1,
            "message": "הצלחה"
        })
    } catch (error) {
        return res.send({
            "status": 0,
            "message": error
        })
    }
}

module.exports.mute_unmute_group_v2 = async function (req, res) {
    try {
        const user_id = await userModel.jwt_verify(req.headers.authorization.split(' ')[1]);
        const created_at = Math.floor(new Date().valueOf() / 1000);
        const update_user = await userModel.update_user_last_loggedin(user_id, created_at);

        const mute_unmute_group = await groupModel.mute_unmute_group(req.body.group_id, user_id, req.body.is_favorite, created_at);
        return res.send({
            "status": 1,
            "message": "הצלחה"
        })
    } catch (error) {
        return res.send({
            "status": 0,
            "message": error
        })
    }
}

module.exports.add_survey_answers_v2 = async function (req, res) {
    try {
        const user_id = await userModel.jwt_verify(req.headers.authorization.split(' ')[1]);
        const created_at = Math.floor(new Date().valueOf() / 1000);
        const update_user = await userModel.update_user_last_loggedin(user_id, created_at);

        const add_survey_answers = await groupModel.add_survey_answers(req.body.data, user_id, created_at, req.body.group_id);
        return res.send({
            "status": 1,
            "message": "הצלחה"
        })
    } catch (error) {
        return res.send({
            "status": 0,
            "message": error
        })
    }
}

module.exports.create_stock = function (req, res) {
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
                    con.query("INSERT into stocks(group_id, user_id, name, producer_name, price, price_list_id, concentration_t, concentration_c, dominance_id, category_id, created_at, updated_at) values('" + req.body.group_id + "', '" + decoded.user_id + "', '" + req.body.name + "', '" + req.body.producer_name + "', '" + req.body.price + "', '" + req.body.price_list_id + "', '" + req.body.concentration_t + "', '" + req.body.concentration_c + "', '" + req.body.dominance_id + "',  '" + req.body.category_id + "', '" + created_at + "', '" + created_at + "')", function (err2, result) {
                        if (err2) {
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים"
                            })
                        } else {
                            res.send({
                                "status": 1,
                                "message": "הצלחה",
                                "stock_id": result.insertId
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.edit_stock = function (req, res) {
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
                    con.query("UPDATE stocks SET name = '" + req.body.name + "', producer_name = '" + req.body.producer_name + "', price = '" + req.body.price + "', price_list_id = '" + req.body.price_list_id + "', concentration_t = '" + req.body.concentration_t + "', concentration_c = '" + req.body.concentration_c + "', dominance_id = '" + req.body.dominance_id + "', category_id = '" + req.body.category_id + "', updated_at = '" + created_at + "' where id = '" + req.body.stock_id + "' ", function (err2, result) {
                        if (err2) {
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים"
                            })
                        } else {
                            con.query("SELECT s.*, c.name as category_name, d.name as dominance_name from stocks s, categories c, dominance d where s.id = '" + req.body.stock_id + "' and s.category_id = c.id and s.dominance_id = d.id", function (err3, rows) {
                                if (err3) {
                                    res.send({
                                        "status": 0,
                                        "message": "שגיאה בעת עדכון הנתונים"
                                    })
                                } else {
                                    res.send({
                                        "status": 1,
                                        "message": "הצלחה",
                                        "data": rows[0]
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.delete_stock = function (req, res) {
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
                    con.query("UPDATE stocks SET deleted_at = '" + created_at + "' where id = '" + req.body.stock_id + "' ", function (err2, result) {
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

module.exports.get_stocks_based_on_categories = function (req, res) {
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
                    con.query("SELECT c.id, c.name, s.concentration_t, s.concentration_c from stocks s, categories c where user_id = '" + decoded.user_id + "' and group_id = '" + req.query.group_id + "' and s.category_id = c.id and c.deleted_at = '' and s.deleted_at = '' group by c.id ", function (err2, rows) {
                        if (err2) {
                            res.send({
                                "status": 0,
                                "message": "שגיאה בעת אחזור נתונים"
                            })
                        } else {
                            var final_data = [];
                            var i = 0;
                            async.mapSeries(rows, function (data, callback) {
                                con.query("SELECT s.*, d.name as dominance_name, c.name as category_name from stocks s, dominance d, categories c where s.category_id = '" + data.id + "' and s.user_id = '" + decoded.user_id + "' and s.group_id = '" + req.query.group_id + "' and s.dominance_id = d.id and s.category_id = c.id and s.deleted_at = '' ", function (err3, rows2) {
                                    if (err3)
                                        throw err3;

                                    data.stocks = rows2;
                                    final_data[i] = data;
                                    i++;
                                    return callback(null, final_data);
                                });
                            }, function (err, results) {
                                con.query("SELECT name, image, address, email, phone_number, opening_hours from groups where id = '" + req.query.group_id + "' ", function (err4, rows3) {
                                    if (err4) {
                                        res.send({
                                            "status": 0,
                                            "message": "שגיאה בעת אחזור נתונים"
                                        })
                                    } else {
                                        rows3[0].image = 'https://' + req.get('host') + rows3[0].image
                                        res.send({
                                            "status": 1,
                                            "messages": "הצלחה",
                                            "categories": final_data,
                                            "group_data": rows3[0]
                                        })
                                    }
                                })
                            });
                        }
                    })
                }
            })
        }
    })
}

module.exports.postImage = function postImage(req, res, next) {
    try {
        jwt.verify(req.headers.authorization.split(' ')[1], secret_key, function (err, decoded) {
            if (err) {
                res.send({
                    "status": 0,
                    "message": err.message
                })
            } else {
                upload.single('file')(req, res, function (err) {
                    if (err) {
                        return res.end("Error uploading file. " + err);
                    } else {
                        return res.json({ status: 1, fileUrl: "https://cannabiotic.shtibel.com/public/files/" + req.file.filename });
                    }
                });
            }
        })
    } catch (err) {
        console.log(err);
        res.json({ status: 0, message: err })
    }
}


module.exports.edit_product = function (req, res) {
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
                    con.query("UPDATE products SET name = '" + req.body.name + "', price = '" + req.body.price + "', concentration_t = '" + req.body.concentration_t + "', concentration_c = '" + req.body.concentration_c + "', dominance_id = '" + req.body.dominance_id + "', category_id = '" + req.body.category_id + "', price_list_id = '" + req.body.price_list_id + "', weight = '" + req.body.weight + "', description ='" + req.body.description + "', image = '" + req.body.image + "', images= '" + req.body.images + "' , code = " + req.body.code + " , internal_name= '" + req.body.internal_name + "', barcode= '" + req.body.barcode + "', updated_at = '" + created_at + "' where id = '" + req.body.product_id + "' ", function (err2, result) {
                        if (err2) {
                            res.status(500).send({
                                "status": 0,
                                "message": "שגיאה בעת עדכון הנתונים"
                            })
                        } else {
                            con.query("SELECT p.*, c.name as category_name, d.name as dominance_name from products p, categories c, dominance d where p.id = '" + req.body.product_id + "' and p.category_id = c.id and p.dominance_id = d.id", function (err3, rows) {
                                if (err3) {
                                    res.status(500).send({
                                        "status": 0,
                                        "message": "שגיאה בעת עדכון הנתונים"
                                    })
                                } else {
                                    res.status(200).send({
                                        "status": 1,
                                        "message": "הצלחה",
                                        "data": rows[0]
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.get_search_products = function (req, res) {

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
                    let query = "SELECT id, group_id, name, price, stock, weight, description, image, FROM_UNIXTIME(created_at, '%d.%m.%Y %h:%i:%s') AS created_at FROM `products` WHERE user_id = '199' AND name LIKE '%" + req.body.key + "%' ORDER BY created_at DESC"

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
                                "data": rows
                            })
                        }
                    })
                }
            })
        }
    })


}

