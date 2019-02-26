// 导入主框架
var express = require('express')
// 导入路径包
var path = require('path')
// 导入解析 post包
var bodyParser = require('body-parser')
// 导入模板 包
var template = require('art-template')

var app = express()

// 引入 session 包
var session = require('express-session')
// 导入 路由包
var router = require('./router')

app.use('/public/', express.static(path.join(__dirname, '/public/')))
app.use('/node_modules/', express.static(path.join(__dirname, '/node_modules/')))

// 配置插件模板
app.engine('html', require('express-art-template'))
app.set('views', path.join(__dirname, './views')) // 默认目录就是 ./views 目录
// 配置时间
template.defaults.imports.dateFormat = dateFormat;
//时间戳转换
		function dateFormat(date, format) {
      date = new Date(date);
      var map = {
        "M": date.getMonth() + 1, //月份
        "d": date.getDate(), //日
        "h": date.getHours(), //小时
        "m": date.getMinutes(), //分
        "s": date.getSeconds(), //秒
        "q": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
      };
      format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
        var v = map[t];
        if (v !== undefined) {
          if (all.length > 1) {
            v = '0' + v;
            v = v.substr(v.length - 2);
          }
          return v;
        } else if (t === 'y') {
          return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
      });
      return format;
    };

// 配置解析表单 POST 请求体插件 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
//配置session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
// 挂载路由
app.use(router)

// 配置一个处理 404 得中间件
app.use(function (req, res) {
	res.render('404.html')
})

//配置一个全局错误处理中间件
app.use(function (err, req, res, next) {
	res.status(500).json({
		err_code : 500,
		message : err.message
	})
})

app.listen(3000, function () {
	console.log('running....')
})