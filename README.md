# 毕业设计
## 文件目录
+  npm i express express-art-template body-parser path fs blueimp-md5 mongoose express-session art-template  formidable
+ npm i jquery bootstrap@3.3.7  npm i multiparty util

```
└─bysj
    ├─models
    ├─node_modules
    ├─public
    ├─routers
    └─views

```
promisse
```
User.findOne({
	username : 'aaa'
})
.then(function (user) {
	if (user) {
		// 用户已存在，不能注册
		console.log('用户已存在')
	} else {
		// 用户不存在，可以注册
		return new User({
			username : 'aaa',
			password : '123',
			email : 'dasda'
		}).save()
	}
})
.then(function (ret) {
})


var data = {}
$.get('http://localhost:3000/users/1')
	.then(function (user) {
		data.user = user
		return $.get('http://localhost:3000/jobs')
	})
	.then(function (jobs) {
		data.jobs = jobs
		var htmlStr = template('tpl', data)
		document.querySelector('#user_form').innerHTML = htmlStr
	})

```

```
router.get('/guoman', function (req, res,next) {
	var obj = {}
	//当前页,前端用户通过get传递过来的页数，或没有传递时默认当前页数为1；
	var page=Number(req.query.page)||1

	var limit=5//每页显示的条数；

	//获取总条数；
	Data.countDocuments().then(function (count) {
		//计算总页数；
       var pages=Math.ceil(count/limit)

        //当前页不能大于总页数；
        page=Math.min(page,pages)

        //当前页不能小于1
        page=Math.max(page,1)

        var skip=(page-1)*limit;//忽略数

         //从数据库中读取所有的用户数据
		Data.find().limit(limit).skip(skip).then(function (data) {
				
			res.render('guoman.html', {
				data : data,
                page:page,
                count:count,
                pages:pages,
                limit:limit,
                user : req.session.user
			})
		})

	})
})
```
输出条数
```
Rm.find({
		$or: [
         {title: 1}, 
         {cont: 1}
      ]
	}).countDocuments().then(function(ret){
		console.log(ret)
	})
```



###	难点

+ 获取表单数据
+ 回调地狱
+ 页数
+ 数据表 
+ 要上传的图片路径
+ 模板过滤 时间



帖子表

| 谁发的      | 标题   | 内容 | 评论时间    | 表的类型 |
| ----------- | ------ | ---- | ----------- | -------- |
| publish_man | titile | cont | create_time | style    |

评论表

| 谁评论的 | 评论了那张表 | 评论内容 | 评论时间    |      |
| -------- | ------------ | -------- | ----------- | ---- |
| talk_man | talk_title   | cont     | create_time |      |



上传路径 头疼！！！

```javascript
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
    });
```

可以使用数组
{{ each fruits }}
          <div class="col-xs-6 col-sm-3 placeholder">
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="200" height="200" class="img-responsive" alt="Generic placeholder thumbnail">
            <h4>{{ $value }}</h4>
            <span class="text-muted">Something else</span>
          </div>
          {{ /each }}


	//查询单个字段
	      db.datas.find({name : 'ls'},{name : 1})





+ 最后难点
+ 如何获取评论人头像
+ 删帖子权限
+ 可以通过数组 push 获取它受保护的 对象
+ 删除帖子 也要把帖子的评论都删除掉



可以通过数组 查找多条信息，然后第二个参数是显示数组结果

```javascript
// 发帖人数组
			var arr = [];
		    for(var key in ret.data){
		    	arr.push(ret.data[key].publish_man)
		    }
// 用用户名查找发表评论人的信息  查询单条 图片
			User.find({nickname : arr},{avatar : 1,nickname : 1}).then(function (avatar) {
				ret.avatar = avatar
				res.render('riman.html', {
					data : ret.data,// 用户数据
	                page:ret.page,// 当前页
	                count:ret.count,// 总条数
	                pages:ret.pages,// 总页数
	                limit:ret.limit,// 忽略数
	                avatar : ret.avatar, // 发帖人头像
	                user : req.session.user
				})
			})
```



可以通过 赋值 变量，然后第二次遍历判断 最后数据图片结果

```html
{{set comment = $value.comment_man}}
								{{each avatar}}
								{{if comment == avatar[$index].nickname}}
								<img src="{{avatar[$index].avatar || /public/img/avatar-max-img.png}}" class="col-md-1">
								{{/if}}
								{{/each}}
```





可以通过 session 判断  给权限

```html
{{if user}}
			    		{{if user.nickname == $value.publish_man}}
			    		<button type="button" class="btn btn-danger"  delete_table="{{$value._id}}" name="del">（危险）Danger</button>
			    		{{/if}}
			    		{{/if}}
```



先删除评论表的 评论 然后再删除 帖子

```javascript
var delete_table = req.body.delete_table.replace(/"/g,'')
	Comment.deleteMany({comment_table : delete_table})
	.then(function () {
		Rm.deleteMany({_id : delete_table}, function (err){
			if (err) { return next (err)}
			return res.status(200).json({err_code : 0, message : 'ok'})
		})
	})
```



+ 重点要分清楚表与表之间的关系

| avator | bio  | status | email | nickname | password | create_time | last_modified_time | gender |
| ------ | ---- | ------ | ----- | -------- | -------- | ----------- | ------------------ | ------ |
| 头像   | 爱好 | 状态   | 账号  | 账号     | 密码     | 创建时间    | 修改时间           | 性别   |

```
db.users.update({},{$unset:{'birthday':''}},false, true)
db.users.find()
```