// 日漫
// 1. 引包
var mongoose = require('mongoose')

// 2. 连接数据库
mongoose.connect('mongodb://localhost/bysj',{useNewUrlParser: true})

// 3. 创建表结构

var Schema = mongoose.Schema

var ltSchema = new Schema({
	title : {
		type : String,
		require : true
	},
	cont : {
		type : String,
		require : true
	},
	create_time : {
		type : Date,
		default : Date.now
	},
	style : {
		type : Number,
		// 春、夏、秋、冬
		enum : [0, 1, 2, 3],
		default : 0
	},
	publish_man : {
		type : String,
		require : true
	}
})

module.exports = mongoose.model('Lt', ltSchema)