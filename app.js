var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var bodyParser = require("body-parser")
var jsonParser = bodyParser.json()
var router = express.Router()
var users = require('./users/users')
var groups = require('./groups/groups')
var orders = require('./orders/orders')
var async = require('async')
const upload = require('./helper');

var con = require('./connection/connection');

app.get('/', function (req, res, next) {
	res.sendFile(__dirname + '/index.html')
});

app.use(bodyParser.urlencoded({ extended: true }))
app.use('/api', router)

router.post('/register', users.register)
router.post('/login', users.login)
router.post('/check_email_exist', users.check_email_exist)
router.get('/get_cities', users.get_cities)
router.post('/check_user_verified', users.check_user_verified)
router.get('/get_strings_data', users.get_strings_data)
router.post('/edit_profile', users.edit_profile)
router.post('/update_user_device_token', users.update_user_device_token)
router.get('/logout', users.logout)
router.get('/get_inappropriate_words', users.get_inappropriate_words)
router.post('/get_encrypted_password', users.get_encrypted_password)
router.post('/forgot_password', users.forgot_password)
router.post('/update_user_online_status', users.update_user_online_status)
router.get('/get_user_profile', users.get_user_profile)
router.post('/check_pending_approval_status', users.check_pending_approval_status)

router.get('/get_groups', groups.get_groups)
router.get('/test', groups.test)
router.post('/get_group_details', groups.get_group_details)
router.post('/search_groups_messages', groups.search_groups_messages)
router.post('/mark_favourite_unfavourite', groups.mark_favourite_unfavourite)
router.post('/mute_unmute_group', groups.mute_unmute_group)
router.post('/add_survey_answers', groups.add_survey_answers)
router.post('/update_group', groups.update_group)
router.post('/pin_unpin_group', groups.pin_unpin_group)
router.post('/create_product', groups.create_product)
router.get('/get_dominance_categories', groups.get_dominance_categories)
router.post('/edit_product', groups.edit_product)
router.post('/delete_product', groups.delete_product)
router.post('/get_groups_user_settings', groups.get_groups_user_settings)
router.get('/get_products', groups.get_products);
router.post('/get_products_details', groups.get_products_details);
router.post('/get_search_products', groups.get_search_products);
router.post('/update_order_status', groups.update_order_status);
router.post('/get_product_with_searchString', groups.get_product_with_searchString);
router.post('/search_groups_messages_faster', groups.search_groups_messages_faster)

// router.post('/get_groups_user_setting',groups.get_groups_user_setting)

router.post('/create_stock', groups.create_stock)
router.post('/edit_stock', groups.edit_stock)
router.post('/delete_stock', groups.delete_stock)
router.get('/get_stocks_based_on_categories', groups.get_stocks_based_on_categories)
router.post('/post_image', groups.postImage);

router.get('/get_groups_v2', groups.get_groups_v2)
router.post('/get_group_details_v2', groups.get_group_details_v2)
router.post('/mark_favourite_unfavourite_v2', groups.mark_favourite_unfavourite_v2)
router.post('/mute_unmute_group_v2', groups.mute_unmute_group_v2)
router.post('/add_survey_answers_v2', groups.add_survey_answers_v2)
router.post('/get_chat', groups.get_chat)

router.post('/place_order', orders.place_order);
router.get('/get_user_orders', orders.get_user_orders);
router.post('/get_filter_orders', orders.get_user_filter_orders);
router.post('/get_search_orders', orders.get_search_orders);
router.post('/get_order_detail', orders.get_order_detail);
router.post('/edit_order', orders.edit_order);


// router.post('/place_order',orders.place_order);
// router.get('/get_user_orders',orders.get_user_orders);
// router.get('/get_order_detail', orders.get_order_detail);
// router.get('/get_filter_orders', orders.get_user_filter_orders);
// router.get('/get_search_orders', orders.get_search_orders);
// router.get('/edit_order', orders.edit_order);

http.listen(3000, function () {
	console.log('app started listening on 3000')
});

io.sockets.on('connection', function (socket) {
	socket.on('send_message', function (data) {
		var return_response = {
			"status": 0,
			"status_msg": "??????????????????"
		}
		var created_at = Math.floor(new Date().valueOf() / 1000)
		con.query("UPDATE users SET last_loggedin = '" + created_at + "' where id = '" + data.sender_id + "' ", function (err_last_loggedin, result_last_loggedin) {
			if (err_last_loggedin) {
				io.to(socket.id).emit('message_sent', return_response)
			} else {
				var insert_msg = [data.sender_id, data.group_id, data.product_id, data.stock_image, data.message, data.image, data.parent_msg_id, data.parent_msg_type, created_at, created_at,data.local_id]

				con.query("INSERT into messages(sender_id, group_id, product_id, stock_image, message, image, parent_msg_id, parent_msg_type, created_at, updated_at,local_id) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", insert_msg, function (err, result) {
					if (err) {
						io.to(socket.id).emit('message_sent', return_response)
					} else {
						con.query("SELECT nick_name, first_name, image from users where id = '" + data.sender_id + "' ", function (err2, rows) {
							if (err2) {
								io.to(socket.id).emit('message_sent', return_response)
							}

							if (rows[0].image != '') {
								var idk = rows[0].image.includes('/ckfinder/')
								if (idk)
									rows[0].image = 'https://cannabiotic.shtibel.com' + rows[0].image
							}

							if (data.parent_msg_id && data.parent_msg_type == 'image')
								var query = "SELECT messages.sender_id, messages.image as message, users.first_name as sender_name from messages INNER JOIN users ON messages.sender_id = users.id where messages.id = '" + data.parent_msg_id + "' "

							else if (data.parent_msg_id && data.parent_msg_type == 'text')
								var query = "SELECT messages.sender_id, messages.message as message, users.first_name as sender_name from messages INNER JOIN users ON messages.sender_id = users.id where messages.id = '" + data.parent_msg_id + "' "
							else
								var query = "SELECT messages.sender_id, messages.message, users.first_name as sender_name from messages INNER JOIN users ON messages.sender_id = users.id where messages.id = '" + data.parent_msg_id + "' "

							con.query(query, function (err4, rows3) {
								if (err4) {
									io.to(socket.id).emit('message_sent', return_response)
								}

								con.query("SELECT p.name ,p.stock, p.price_list_id, p.weight,p.image,p.price,p.description, p.image, p.images, p.code, p.internal_name, p.barcode, p.concentration_t, p.concentration_c, cc.id AS category_id, cc.name AS category_name, dd.id AS dominance_id, dd.name AS dominance_name FROM products p LEFT JOIN categories cc ON p.category_id = cc.id LEFT JOIN dominance dd ON p.category_id = dd.id where p.id = '" + data.product_id + "' ", function (err5, rows4) {
									if (err5) {
										io.to(socket.id).emit('message_sent', return_response)
									}

									if (rows4.length) {
										data.products_data = rows4[0]
									} else {
										data.products_data = null
									}

									data.id = result.insertId
									data.created_at = created_at.toString()
									data.updated_at = created_at.toString()
									data.is_deleted = "No"
									data.message_seen = "No"
									data.sender_name = rows[0].first_name
									data.nick_name = rows[0].nick_name
									data.sender_image = rows[0].image
									if (data.parent_msg_id) {
										data.r_sender_id = rows3[0].sender_id
										data.r_sender_name = rows3[0].sender_name
										data.r_message = rows3[0].message
									} else {
										data.r_sender_id = null
										data.r_sender_name = ''
										data.r_message = ''
									}
									
									var date = new Date(data.created_at*1000);
									var options = { year: 'numeric', month: 'long', day: 'numeric' };
									var newDate = date.toLocaleDateString("en-US");
									//rows2[j].date=newDate.replaceAll('/','.');

									var myDate = new Date(newDate);
									//var myDate = myDate1.setDate(myDate1.getDate()+ 8)
									var d = myDate.getDate();
									var m =  myDate.getMonth()+1;
									var y = myDate.getFullYear();

									if(m==10 || m==11 || m==12){
										data.date= d+"."+m+"."+y;
									}else{
										if(d>9)
										   {
										   	data.date= d+".0"+m+"."+y;
										   }else{
												data.date= "0"+d+".0"+m+"."+y;
										}
										
									}

									return_response.status = 1
									return_response.status_msg = "??????????"
									return_response.data = data
									io.sockets.emit('message_sent', return_response);

									con.query("SELECT users.device_token from group_members INNER JOIN users ON group_members.user_id = users.id where group_members.group_id = '" + data.group_id + "' and group_members.user_id != '" + data.sender_id + "' and group_members.is_mute = 0 ", function (err3, rows2) {
										if (err3)
											console.log(err3)

										var sendNotification = function (data) {
											var headers = { "Content-Type": "application/json; charset=utf-8" };

											var options = { host: "onesignal.com", port: 443, path: "/api/v1/notifications", method: "POST", headers: headers };

											var https = require('https');
											var req = https.request(options, function (res) {
												res.on('data', function (data) {
													console.log("Response:");
													console.log(JSON.parse(data));
												});
											});

											req.on('error', function (e) {
												console.log("ERROR:");
												console.log(e);
											});

											req.write(JSON.stringify(data));
											req.end();
										};

										con.query("SELECT groups.created_by, groups.show_survey, groups.group_type, groups.name, groups.image, a.is_favorite, a.is_mute, count(b.id) as likes_count from groups LEFT JOIN group_members a ON groups.id = a.group_id && a.user_id = '" + data.sender_id + "' LEFT JOIN group_members b ON groups.id = b.group_id && b.is_favorite = 1 where groups.id = '" + data.group_id + "' ", function (err4, rows3) {
											if (err4)
												console.log(err4)

											if (rows3[0].image != '') {
												var idk = rows3[0].image.includes('/ckfinder/')
												if (idk)
													rows3[0].image = 'https://cannabiotic.shtibel.com' + rows3[0].image
											}

											for (var i = 0; i < rows2.length; i++) {
												var message = {
													app_id: "badb84c4-7194-4429-9552-222aca973051",
													contents: { "en": data.message },
													include_player_ids: [rows2[i].device_token],
													headings: { "en": rows3[0].name + ' : ?????????? ,' + rows[0].first_name + ' : ?????????? ????????' },
													data: { "sender_id": data.sender_id, "sender_name": rows[0].first_name, "sender_image": rows[0].image, "group_id": data.group_id, "message": data.message, "created_by": rows3[0].created_by, "show_survey": rows3[0].show_survey, "group_type": rows3[0].group_type, "group_name": rows3[0].name, "group_image": rows3[0].image, "is_mute": rows3[0].is_mute, "is_favorite": rows3[0].is_favorite, "likes_count": rows3[0].likes_count }
												};
												sendNotification(message);
											}
										})
									})
								})
							})
						})
					}
				})
			}
		})
	})

	socket.on('get_chat_history', function (data) {
		var return_response = {
			"status": 0,
			"status_msg": "??????????????????",
			"group_id": data.group_id
		}

		var created_at = Math.floor(new Date().valueOf() / 1000);
		con.query("UPDATE users SET last_loggedin = '" + created_at + "' where id = '" + data.user_id + "' ", function (err_last_loggedin, result_last_loggedin) {
			if (err_last_loggedin) {
				io.to(socket.id).emit('chat_history_received', return_response)
			} else {
				con.query("UPDATE group_members SET last_loggedin = '" + created_at + "' where user_id = '" + data.user_id + "' and group_id = '" + data.group_id + "' ", function (err3, result) {
					if (err3) {
						io.to(socket.id).emit('chat_history_received', return_response)
					} else {
						con.query("SELECT FROM_UNIXTIME(created_at, '%d.%m.%Y') as date, created_at from messages group by date order by created_at", function (err, rows) {
							if (err) {
								io.to(socket.id).emit('chat_history_received', return_response)
							} else {
								con.query("SELECT * from stocks where user_id = '" + data.user_id + "' ", function (err3, rows3) {
									if (err3) {
										io.to(socket.id).emit('chat_history_received', return_response)
									} else {
										if (rows3.length) {
											var stock_exist = 1
										} else {
											var stock_exist = 0
										}
										var final_data = []
										var i = 0
										var products_data = {};

										async.mapSeries(rows, function (data2, callback) {
											con.query("SELECT c.first_name as sender_name,g.name as group_name, c.image as sender_image, c.nick_name, a.*, b.sender_id as r_sender_id, b.id as r_id, d.first_name as r_sender_name, b.message as r_message, b.image as r_image,a.product_id as product_id, p.name as product_name, p.image as product_image, p.price, p.concentration_t, p.concentration_c, cc.id as category_id, cc.name as category_name, dd.id as dominance_id, dd.name as dominance_name, u.first_name as supplier_name, u.image as supplier_image ,p.stock, p.price_list_id, p.weight, p.description, p.images as images, p.code,p.deleted_at as deleted_product ,p.internal_name, p.barcode, p.created_at FROM messages a INNER JOIN users c ON a.sender_id = c.id LEFT JOIN messages b ON a.parent_msg_id = b.id LEFT JOIN users d ON b.sender_id = d.id LEFT JOIN products p ON a.product_id = p.id  LEFT JOIN categories cc ON p.category_id = cc.id LEFT JOIN dominance dd ON p.dominance_id = dd.id LEFT JOIN groups g ON p.group_id = g.id LEFT JOIN users u ON g.supplier_id = u.id where a.group_id = '"+ data.group_id +"' and FROM_UNIXTIME(a.created_at, '%d.%m.%Y') = '"+ data2.date +"' ",function(err2,rows2){
							                    if (err2) {
												io.to(socket.id).emit('chat_history_received', return_response)
											} else {
												for (var j = 0; j < rows2.length; j++) {
													
													if (rows2[j].deleted_product != '' && rows2[j].deleted_product != null)
														rows2[j].is_deleted = 'Yes'
													
													if (rows2[j].is_deleted == 'Yes')
														rows2[j].message = 'This message was removed'

													if (rows2[j].parent_msg_type == 'image')
														rows2[j].r_message = rows2[j].r_image

													if (rows2[j].sender_image != '') {
														var idk = rows2[j].sender_image.includes('/ckfinder/')
														if (idk)
															rows2[j].sender_image = 'https://cannabiotic.shtibel.com' + rows2[j].sender_image
													}

													if (rows2[j].product_name != '' && rows2[j].product_name != null) {
														products_data[j] = {
															name: rows2[j].product_name,
															image: rows2[j].product_image,
															price: rows2[j].price,
															concentration_t: rows2[j].concentration_t, concentration_c: rows2[j].concentration_c,
															category_id: rows2[j].category_id,
															category_name: rows2[j].category_name,
															supplier_name: rows2[j].supplier_name,
															supplier_image: rows2[j].supplier_image,
															dominance_id: rows2[j].dominance_id,
															dominance_name: rows2[j].dominance_name,
															stock: rows2[j].stock,
															price_list_id: rows2[j].price_list_id,
															weight: rows2[j].weight,
															description: rows2[j].description,
															product_image: rows2[j].product_image,
															code: rows2[j].code,
															internal_name: rows2[j].internal_name,
															barcode: rows2[j].barcode,
															//created_at: rows2[j].created_at

														}

														rows2[j].products_data = products_data[j]
													} else {
														rows2[j].products_data = null
													}

													delete rows2[j].product_name
													delete rows2[j].product_image
													delete rows2[j].price
													delete rows2[j].concentration_t
													delete rows2[j].concentration_c
													delete rows2[j].category_id
													delete rows2[j].category_name
													delete rows2[j].dominance_id
													delete rows2[j].dominance_name
													delete rows2[j].supplier_name
													delete rows2[j].supplier_image
												}
												if (!rows2.length) {
													delete data2.date
													delete data2.created_at
												} else {
													data2.messages = rows2
													final_data[i] = data2
												}

												i++
												return callback(null, final_data)
											}
										})
									}, function(err, results) {
										socket.join(data.group_id);
										return_response.status = 1
										return_response.status_msg = "??????????"

										var filtered = final_data.filter(function (el) {
											return el != null;
										});
										return_response.data = filtered
										return_response.stock_exist = stock_exist
										io.to(socket.id).emit('chat_history_received', return_response)
									});
							}
						})
					}
				})
			}
		})
	}
		})
	})

socket.on('delete_message', function (data) {
	var return_response = {
		"status": 0,
		"status_msg": "??????????????????",
		"message_id": data.message_id,
		"group_id": data.group_id
	}

	var created_at = Math.floor(new Date().valueOf() / 1000);
	con.query("UPDATE users SET last_loggedin = '" + created_at + "' where id = '" + data.user_id + "' ", function (err_last_loggedin, result_last_loggedin) {
		if (err_last_loggedin) {
			io.to(socket.id).emit('message_deleted', return_response)
		} else {
			con.query("UPDATE messages SET is_deleted = 'Yes' where id = '" + data.message_id + "' ", function (err, result) {
				if (err) {
					io.to(socket.id).emit('message_deleted', return_response);
				} else {
					return_response.status = 1
					return_response.status_msg = "??????????"
					io.sockets.emit('message_deleted', return_response)
				}
			})
		}
	})
})

socket.on('update_message', function (data) {
	var return_response = {
		"status": 0,
		"status_msg": "??????????????????"
	}
	var created_at = Math.floor(new Date().valueOf() / 1000)
	con.query("UPDATE users SET last_loggedin = '" + created_at + "' where id = '" + data.user_id + "' ", function (err_last_loggedin, result_last_loggedin) {
		if (err_last_loggedin) {
			io.to(socket.id).emit('message_sent', return_response)
		} else {
			con.query("UPDATE messages SET message = '" + data.message + "' where id = '" + data.message_id + "' ", function (err, result) {
				if (err) {
					io.to(socket.id).emit('message_updated', return_response)
				} else {
					return_response.status = 1
					return_response.status_msg = "??????????"
					return_response.message = data.message
					return_response.group_id = data.group_id
					return_response.message_id = data.message_id
					return_response.updated_at = created_at
					io.sockets.emit('message_updated', return_response);
				}
			})
		}
	})
})

socket.on('delete_product', function (data) {
	var return_response = {
		"status": 0,
		"status_msg": "??????????????????",
		"data": data
	}

	var created_at = Math.floor(new Date().valueOf() / 1000);
	con.query(data.message, function (err, result) {
		if (err) {
			io.to(socket.id).emit('product_deleted', return_response)
		} else {
			return_response.status = 1
			return_response.status_msg = "??????????"
			return_response.result = result
			console.log(return_response);
			io.to(socket.id).emit('product_deleted', return_response)
		}
	})
})

socket.on('get_groups', function (data) {
	var return_response = {
		"status": 0,
		"status_msg": "??????????????????"
	}

	var created_at = Math.floor(new Date().valueOf() / 1000);
	con.query("UPDATE users SET last_loggedin = '" + created_at + "' where id = '" + data.user_id + "' ", function (err_last_loggedin, result_last_loggedin) {
		if (err_last_loggedin) {
			io.to(socket.id).emit('groups_listing', return_response)
		} else {
			con.query("SELECT g.*, 2 as type, count(d.id) as unread_msgs, c.is_deleted as message_deleted  ,c.message as last_message, c.image as last_msg_image, c.stock_image, c.product_id, u.first_name as sender_name, u.nick_name, c.created_at as last_msg_time_unix, p.image as p_image from groups g LEFT JOIN messages c ON g.id = c.group_id and c.created_at = (select MAX(messages.created_at) from messages where g.id = messages.group_id) LEFT JOIN messages d ON g.id = d.group_id and d.created_at > (select last_loggedin from group_members where g.id = group_members.group_id && group_members.user_id = '" + data.user_id + "') && d.sender_id != '" + data.user_id + "' LEFT JOIN users u ON c.sender_id = u.id LEFT JOIN products p ON c.product_id = p.id where group_type = 'group' and g.is_deleted = 'No' and g.status != 'Suspended' group by g.id order by c.created_at DESC", function (err, rows) {
				if (err) {
					io.to(socket.id).emit('groups_listing', return_response);
				} else {
					for (var i = 0; i < rows.length; i++) {
						rows[i].is_favorite = 0
						rows[i].is_mute = 0
						rows[i].is_pin = 0
						rows[i].likes_count = 0
						rows[i].show_survey = 'No'
						// if(rows[i].message_deleted == "Yes"){
						// 	rows[i].last_message = '?????????? ???? ??????????'
						// 	console.log('here');
						// }

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

						if (rows[i].stock_image != '') {
							rows[i].last_message_type = 'stock_image'
							rows[i].last_message = rows[i].stock_image
						}

						if (rows[i].product_id != 0) {
							rows[i].last_message_type = 'product'
							rows[i].last_message = rows[i].p_image
						}

						if (rows[i].product_id == null || rows[i].stock_image == null)
							rows[i].last_message_type = ''

					}
					con.query("SELECT g.*, 0 as type, count(d.id) as unread_msgs, c.is_deleted as message_deleted ,c.message as last_message, c.image as last_msg_image, c.stock_image, c.product_id, u.first_name as sender_name, u.nick_name, c.created_at as last_msg_time_unix, p.image as p_image from groups g LEFT JOIN messages c ON g.id = c.group_id and c.created_at = (select MAX(messages.created_at) from messages where g.id = messages.group_id) LEFT JOIN messages d ON g.id = d.group_id and d.created_at > (select last_loggedin from group_members where g.id = group_members.group_id && group_members.user_id = '" + data.user_id + "') && d.sender_id != '" + data.user_id + "' LEFT JOIN users u ON c.sender_id = u.id LEFT JOIN products p ON c.product_id = p.id where group_type = 'stock' and g.is_deleted = 'No' and g.status != 'Suspended' group by g.id order by c.created_at DESC", function (err2, rows2) {
						if (err2) {
							io.to(socket.id).emit('groups_listing', return_response);
						} else {
							for (var j = 0; j < rows2.length; j++) {
								rows2[j].is_favorite = 0
								rows2[j].is_mute = 0
								rows2[j].is_pin = 0
								rows2[j].likes_count = 0
								rows2[j].show_survey = 'No'
								// if(rows2[j].message_deleted == "Yes"){
								// 	rows2[j].last_message = '?????????? ???? ??????????'
								// }

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

								if (rows2[j].stock_image != '') {
									rows2[j].last_message_type = 'stock_image'
									rows2[j].last_message = rows2[j].stock_image
								}

								if (rows2[j].product_id != 0) {
									rows2[j].last_message_type = 'product'
									rows2[j].last_message = rows2[j].p_image
								}

								if (rows2[j].product_id == null || rows2[j].stock_image == null)
									rows2[j].last_message_type = ''

							}

							con.query("SELECT g.*, 1 as type, count(d.id) as unread_msgs,c.is_deleted as message_deleted , c.message as last_message, c.image as last_msg_image, c.stock_image, c.product_id, u.first_name as sender_name, u.nick_name, c.created_at as last_msg_time_unix, p.image as p_image from groups g LEFT JOIN messages c ON g.id = c.group_id and c.created_at = (select MAX(messages.created_at) from messages where g.id = messages.group_id) LEFT JOIN messages d ON g.id = d.group_id and d.created_at > (select last_loggedin from group_members where g.id = group_members.group_id && group_members.user_id = '" + data.user_id + "') && d.sender_id != '" + data.user_id + "' LEFT JOIN users u ON c.sender_id = u.id LEFT JOIN products p ON c.product_id = p.id where group_type = 'species' and g.is_deleted = 'No' and g.status != 'Suspended' group by g.id order by c.created_at DESC", function (err3, rows3) {
								if (err3) {
									io.to(socket.id).emit('groups_listing', return_response);
								} else {
									for (var k = 0; k < rows3.length; k++) {
										rows3[k].is_favorite = 0
										rows3[k].is_mute = 0
										rows3[k].is_pin = 0
										rows3[k].likes_count = 0
										rows3[k].show_survey = 'No'
										// if(rows3[k].message_deleted == "Yes"){
										// 	rows3[k].last_message = '?????????? ???? ??????????'
										// }

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

										if (rows3[k].stock_image != '') {
											rows3[k].last_message_type = 'stock_image'
											rows3[k].last_message = rows3[k].stock_image
										}

										if (rows3[k].product_id != 0) {
											rows3[k].last_message_type = 'product'
											rows3[k].last_message = rows3[k].p_image
										}

										if (rows3[k].product_id == null || rows3[k].stock_image == null)
											rows3[k].last_message_type = ''
									}
									return_response.status = 1
									return_response.status_msg = "??????????"
									return_response.groups = rows
									return_response.stocks = rows2
									return_response.species = rows3
									io.to(socket.id).emit('groups_listing', return_response)
								}
							})
						}
					})
				}
			})
		}
	})
})

socket.on('get_groups_user_settings', function (data) {
	var return_response = {
		"status": 0,
		"status_msg": "??????????",
		"group_type": data.group_type
	}

	var created_at = Math.floor(new Date().valueOf() / 1000);
	con.query("UPDATE users SET last_loggedin = '" + created_at + "' where id = '" + data.user_id + "' ", function (err_last_loggedin, result_last_loggedin) {
		if (err_last_loggedin) {
			io.to(socket.id).emit('get_groups_user_settings_received', return_response)
		} else {
			con.query("SELECT g.id, (SELECT count(id) as id FROM group_members where g.id = group_members.group_id && group_members.is_favorite = '1') as likes_count, gm.is_favorite, gm.is_mute, gm.is_pin, gm.show_survey from groups g LEFT JOIN group_members gm ON g.id = gm.group_id and gm.user_id = '" + data.user_id + "' where g.id IN(" + data.group_ids + ") and g.group_type = '" + data.group_type + "' and g.is_deleted = 'No' and g.status != 'Suspended' order by gm.is_pin DESC, gm.id DESC ", function (err, rows) {
				if (err) {
					io.to(socket.id).emit('get_groups_user_settings_received', return_response)
				} else {
					return_response.status = 1
					return_response.status_msg = "??????????"
					return_response.data = rows
					io.to(socket.id).emit('get_groups_user_settings_received', return_response)
				}
			})
		}
	})
})
})