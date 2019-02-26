// 评论表

// 1. 引包
var mongoose = require('mongoose')

// 2. 连接数据库
mongoose.connect('mongodb://localhost/bysj',{useNewUrlParser: true})

// 3. 创建表结构

var Schema = mongoose.Schema

var commentSchema = new Schema({
	comment_man : {
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
	comment_table : {
		type : String,
		require : true
	}
})
// 首字母要大写
module.exports = mongoose.model('Comment', commentSchema)