var express = require('express')
// 导入数据库模型
// 用户
var User = require('./models/user.js')
// 论坛
var Lt = require('./models/lt.js')
// 评论表
var Comment = require('./models/comment.js')
// 引入加密包
var md5 = require("blueimp-md5")
// 引入文件上传包
var multer  = require('multer');
var formidable = require("formidable");

var path = require('path')

var fs = require('fs')

// new Comment({
// 	comment_man : '1',
// 	cont : '1',
// 	comment_table : 1,
// }).save(function(err, ret) {
// 	if (err) {
// 		console.log('保存失败')
// 	}else{
// 		console.log('保存成功')
// 		console.log(ret)
// 	}
// })

var router = express.Router()

router.get('/',  function (req, res) {
	// 直接给用户页面发送 session 
	res.render('index.html',{
		user : req.session.user
	})
})
// 显示登陆页
router.get('/login',  function (req, res) {
	res.render('login.html')
})
// 发送登陆 
router.post('/login',  function (req, res, next) {
	// 1.获取表单数据
	// 2. 查询数据库用户名密码是否正确
	// 3. 发送响应数据
	var body = req.body

	User.findOne({
		email : body.email,
		password : md5(md5(body.password))
	}, function (err, user) {
		if (err) { return next(err) }

		if (!user) { return res.status(200).json({ err_code : 1, message : '密码或者账号错误'})}

		// 用户存在，登陆成功，通过 Session 记录登陆状态
		req.session.user = user

		res.status(200).json({ err_code : 0, message : 'OK' })
	})
})

// 登出
router.get('/logout',  function (req, res) {
	// 清除登陆状态
	req.session.user = null
	// 重定向到登录页
	res.redirect('/login')
})
// 显示注册页
router.get('/register',  function (req, res) {
	res.render('register.html')
})
// 发送注册
router.post('/register',  function (req, res, next) {
	var body = req.body
	// 1. 获取表单提价的数据
	//		req.body
	// 2. 操作数据库
	//		判断修改用户是否存在
	//		如果已存在，不允许注册
	//		如果不存在，注册新用户
	// 3. 发送响应

	User.findOne({
		$or : [
			{
				email : body.email
			},
			{
				nickname : body.nickname
			}
		]
	},function (err, data) {
		if (err) { return next(err) }

		if (data) { return res.status(200).json({ err_code : 1, message : '邮箱或者用户名已存在' })}

			// 加密密码
			// 这里是双重加密 让简单的密码加密得更安全
			body.password = md5(md5(body.password))

		new User(body).save(function (err, user) {
			if (err) { return next(err) }

				// 注册成功，使用 Session 记录用户得登陆状态
				// req.session.user = user

				// express 提供了一个响应方法: json
				// 该方法接收一个对象作为参数，他会自动帮你把对象转为字符串再发送给浏览器
				return res.status(200).json({err_code : 0, message : 'ok'})
		})
	})
})

// guoman

router.get('/guoman', function (req, res,next) {
	res.render('guoman.html',{
		user : req.session.user
	})
})

// luntan 

router.get('/luntan', function (req, res,next) {
	var ret = {}
//当前页,前端用户通过get传递过来的页数，或没有传递时默认当前页数为1；
	var page=Number(req.query.page)||1

	var limit=10//每页显示的条数；

	//获取总条数；
	Lt.countDocuments().then(function (count) {
		//计算总页数；
       var pages=Math.ceil(count/limit)


  //       //当前页不能大于总页数；
        page=Math.min(page,pages)

  //       //当前页不能小于1
        page=Math.max(page,1)

        var skip=(page-1)*limit;//忽略数
  //        //从数据库中读取所有的用户数据
		Lt.find().limit(limit).skip(skip).sort({create_time:-1}).then(function (data) {
			ret.data = data // 用户数据
			ret.page = page // 当前页
            ret.count = count // 总条数
            ret.pages = pages // 总页数
            ret.limit = limit // 忽略数
            return ret
		}).then(function (ret) {
			// 发帖人数组
			var arr = [];
		    for(var key in ret.data){
		    	arr.push(ret.data[key].publish_man)
		    }
		    // 用用户名查找发表评论人的信息  查询单条 图片
			User.find({nickname : arr},{avatar : 1,nickname : 1}).then(function (avatar) {
				ret.avatar = avatar
				res.render('luntan.html', {
					data : ret.data,// 用户数据
	                page:ret.page,// 当前页
	                count:ret.count,// 总条数
	                pages:ret.pages,// 总页数
	                limit:ret.limit,// 忽略数
	                avatar : ret.avatar, // 发帖人头像
	                user : req.session.user
				})
			})
			
		})

	})

})

// 发帖页
router.get('/fatie', function (req, res) {
	res.render('fatie.html',{
		user : req.session.user
	})
})

// 发帖
router.post('/fatie',function (req, res,) {
	new Lt(req.body).save(function(err, ret) {
		if (err) { return next(err) }
			return res.status(200).json({err_code : 0, message : 'ok'})
	})
})

// 看帖子页
router.get('/tiezi', function (req, res) {
	// 作者标题
	var arr_title = []
	// 作者标题的id
	var arr_title_id = []
	// 作者人 
	var arr_title_publish_man = []
	// console.log(req.query)
	var ret = {}
	// 作者 发表的 帖子 的 id
	var id = req.query.id.replace(/"/g,'')
	// 查询本篇作者的内容
	Lt.find({_id : id}).then(function (data) {
		ret = data
		return ret
	}).then(function (ret) {
		// 作者的所有标题
		return Lt.find({ publish_man: req.query.publish_man}).then(function (count) {
			ret.count = count
		    return ret
		})
	}).then(function (ret) {
		// 作者的个人信息
		return User.find({nickname : req.query.publish_man}).then(function (ainfo) {
			ret.ainfo = ainfo
			return ret
			
		})
		
	}).then(function (ret) {
		// 评论表的信息
		return Comment.find({comment_table : id}).then(function (comment){
			ret.comment = comment
			return ret
		})
	}).then(function (ret) {
		// 评论人数组
		var arr = [];
	    for(var key in ret.comment){
	    	arr.push(ret.comment[key].comment_man)
	    }
		// 用用户名查找发表评论人的信息  查询单条 图片
		User.find({nickname : arr},{avatar : 1,nickname : 1}).then(function (avatar) {
			ret.avatar = avatar
			res.render('tiezi.html',{
				data : ret, // 当前页的作者发的帖
				count : ret.count,// 作者的所有帖子 信息
				ainfo : ret.ainfo,// 作者的个人信息
				comment : ret.comment,// 评论人发出去的信息
				avatar : ret.avatar,// 评论人的头像
				user : req.session.user // 本人登陆的信息
			})	
		})
		
	})
	
})

// 发表评论
router.post('/tiezi', function (req, res, next) {
	req.body.comment_table = req.body.comment_table.replace(/"/g,'')
	new Comment(req.body).save(function (err,ret) {
		if (err) { return next (err)}
			return res.status(200).json({err_code : 0, message : 'ok'})
	})
	// console.log(req.body)
})

// 删帖子
router.post('/deltiezi', function (req, res, next) {
	var delete_table = req.body.delete_table.replace(/"/g,'')
	Comment.deleteMany({comment_table : delete_table})
	.then(function () {
		Lt.deleteMany({_id : delete_table}, function (err){
			if (err) { return next (err)}
			return res.status(200).json({err_code : 0, message : 'ok'})
		})
	})
})

// 个人信息

router.get('/gerenxinxi', function (req, res) {
	// console.log(req.session.user)
	// replace
	// 字符串模式
	// 简单，但是不支持全局和忽略大小写问题
	// 正则表达式模式
	// 强大支持全局和忽略大小写
	// 修改传的id有 “” 符号
	// User.findById(req.query.id.replace(/"/g,''), function (err, student) {
	// 	if (err) { return res.status(500).send('Server error') }
	// 		// console.log(student)
	// 		res.render('update.html', {
	// 			student : student
	// 		})
	// })
	res.render('gerenxinxi.html',{
		user : req.session.user
	})
})
// 修改个人信息
router.post('/gerenxinxi', function (req, res, next) {
	 var form = new formidable.IncomingForm();  //上传文件的保存路径 //保存扩展名
	 form.uploadDir = path.join(__dirname, '/uploads/') 
	 form.keepExtensions = true
	//表单传递的input数据  //  包含非文件字段  fields
       //上传文件数据  //  包含文件 files
    form.parse(req, function(err, fields, files) { 
        // 文件名字
        if (err) {
         	return next(err)
        }
        if (files.avatar != null) {
		    // 赋值给 文件路径
	        // 文件公开路径
	        var uploadedPath =  '/public/img/uploads/'+ path.basename(files.avatar.path)
	        // 赋值存放
	        fields.avatar = uploadedPath
	        // 文件绝对路径
	        var newPath = __dirname + '/public/img/uploads/' + path.basename(files.avatar.path)
	        // 修改 session 的值
	        var user = req.session.user
	        for (var key in user ){ 
				if (fields[key] != undefined) 
					{user[key] = fields[key]}
				else{
					user[key] = user[key]
				}
			}
			// 把上传文件 移到 img 文件里
        	fs.rename(files.avatar.path, newPath,  function(err) {
                if(err){
                   console.log('rename error: ' + err);
                } else {
	                console.log('rename ok');
	                User.findByIdAndUpdate(fields.id, fields, function (err) {
					if (err) { return next(err) }
						res.render('gerenxinxi.html',{
							user : req.session.user
						})
					})
                }
            });     
        }else {
			// 删除对象的 无用 avatar
			delete fields.avatar
        	User.findByIdAndUpdate(fields.id, fields, function (err) {
				if (err) { return next(err) }
			}).then(function () {
				// 再次查询  输出 session
				User.find({_id : fields.id}, function (err, user) {
					if(err) { return next(err) }
						req.session.user = user[0]
						res.status(200).json({ err_code : 0, message : 'OK' ,user : user})
				})
			})
        }

  
    });  
	

})

module.exports = router