// 用户表

// 1. 引包
var mongoose = require('mongoose')

// 2. 连接数据库
mongoose.connect('mongodb://localhost/bysj',{useNewUrlParser: true})

// 3. 创建表结构

var Schema = mongoose.Schema

var userSchema = new Schema({
	email : {
		type : String,
		require : true
	},
	nickname : {
		type : String,
		require : true
	},
	password : {
		type : String,
		require : true
	},// 这个是创建时间
	create_time : {
		type : Date,
		// 注意“ 这里不要写 Date.now() 因为会即刻调用
		// 这里直接给了一个方法： Date.now
		// 当你去 new Model 的时候，如果没有传递 create_time, 则 mongoose 就会调用
		// default 制定的 Date.now 方法，使用其返回值作为默认值
		default : Date.now
	},// 最后修改时间
	last_modified_time: {
		type : Date,
		default : Date.now
	},// 默认头像
	avatar : {
		type : String,
		default : '/public/img/avatar-default.png'
	},// 个人简介
	bio : {
		type : String,
		default : ''
	},// 性别
	gender : {
		type : Number,
		enum : [0, 1] // 枚举 限定只能选择 0 或 1
	},
	birthday : {
		type : Date
	},
	status : {
		type : Number,
		// 0 没有权限限制
		// 1 不可以评论
		// 2 不可以登陆
		enum : [0, 1, 2],
		default : 0
	}

})

module.exports = mongoose.model('User', userSchema)