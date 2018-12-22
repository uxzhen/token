//引入数据库连接文件
const db = require('../model/db')
//引入User集合
const User = require('../model/User')
const Test = require('../model/Test')

//引入密码加密的模块
const sha1 = require('sha1')
//引入格式化日期的moment模块
const moment = require('moment')
//引入创建token的方法
const createToken = require('../token/createToken')
//post请求/reigster的处理函数
//因为这个处理函数需要将用户名.密码写入数据库，所以呢，我们需要在数据库中创建User集合
//通过controller/user.js这个文件，来对数据库进行增删改查操作....
const register = async ctx=>{
  let username = ctx.request.body.username;
  let password = ctx.request.body.password;
  //1.判断数据库是否同名的用户，如果存在，则不允许注册
  //2.需要验证下数据的合法性--- validator验证，也可以不验证，保险的话，前端验完，后端再验一次
  //3.注册的时候通过都需要对时间进行格式化/密码进行加密
  //4.将注册用户的信息保存在数据库中
  //5.生成token，将成功的注册信息以及token放回给前端
  let doc = await User.getUserByName(username);
  if(doc){
    //说明数据库中有重名的用户
    //直接返回一个对象，提醒用户不允许重复注册
    ctx.status = 200;
    ctx.body = {
      success:false,
      message:'用户名不允许重复'
    }
  }else{
    //说明数据库里面没有重名的用户
    //可以放心注册了
    //这里一般为了安全，还会对username/password进行二次验证
    //为了节省时间，我就不验证了，可以利用node里面的一个模块
    //可以很方便的进行验证 ---- validator模块

    //也可以使用crypto模块-node原生的加密模块进行加密
    password = sha1(password);
    let date = new Date();
    let create_time = moment(date).format('YYYY-MM-DD HH:mm:ss') //当前时间就被格式化为年月日、时分秒了
    //生成token
    let token = createToken(username)
    //创建新用户
    let newUser = new User({
      username,
      password,
      token,
      create_time
    })
    //将新用户保存到User集合里面
    let userInfo = await new Promise((resolve,reject)=>{
      newUser.save((err,doc)=>{
        if(err){
          reject(err)
        }
        resolve(doc)
      })
    })
    ctx.status = 200;
    ctx.body = {
      success:true,
      message:'注册成功',
      data:userInfo //有些网站是注册后就直接登录了，所以，这里，把用户的信息也返回了，就是为了兼容那些注册后就直接登录的网站.
    }
  }
}
//登录逻辑
const login = async ctx=>{
  //1.检查用户名是否存在
  //2.检查密码是否正确
  //3.生成token，将token返回给前端.用户登录后token就保留到了客户端了
  //每次请求的时候我们都会让用户带着token来访问服务器，服务器呢，通过判断token,来确定用户是否是登录状态
  //例如某些需要登陆后才能访问的页面，就可以用这个实现权限管理了.
  let username = ctx.request.body.username;
  let password = ctx.request.body.password;
  let doc = await User.getUserByName(username);
  if(doc){
    //用户名存在
    if(doc.password == sha1(password)){
      //密码一样
      let token = createToken(username);
      //赋值给doc新的token值
      doc.token = token;
      //重新保存下doc
      await new Promise((resolve,reject)=>{
        doc.save((err,doc)=>{
          if(err){
            reject(err)
          }else{
            resolve()
          }
        })
      })
      ctx.status = 200
      console.log(doc.username);
      ctx.body = {
        success:true,
        message:'登录成功',
        token:doc.token, //用户的token信息
        username:doc.username //登录的用户名
        //如果有头像的话，也可以将用户的头像信息返回
      }
    }else{
      //密码不一样
      ctx.status = 200;
      ctx.body = {
        success:false,
        message:'密码错误，请重新输入'
      }
    }
  }else{
    //用户名不存在
    ctx.status =  200;
    ctx.body = {
      success:false,
      message:'用户名不存在'
    }
  }
}
//首页业务逻辑
const home = async ctx=>{

  }
//添加
const home1 = async ctx=>{
  ctx.status = 200;
  let date = new Date();
  let create_time = moment(date).format('YYYY-MM-DD HH:mm:ss')
  username = ctx.request.body.username;
  name = ctx.request.body.name;
  password = ctx.request.body.password;
  phone = ctx.request.body.phone;
  email = ctx.request.body.email;
  is_active = ctx.request.body.is_active;
  let doc = await Test.getUserByName(username);
  if(doc){
    ctx.body = {
      success:false,
      message:'用户名不能重复'
    }
  }else{
    let newTest = new Test({
      username,
      name,
      password,
      is_active,
      phone,
      email,
      create_time
    })
    let userTest = await new Promise((resolve,reject)=>{
      newTest.save((err,doc)=>{
        if(err){
          reject(err)
        }
        resolve(doc)
      })
    })
    ctx.status = 200;
    ctx.body = {
      success:true,
      message:'添加成功',
      data:userTest //有些网站是注册后就直接登录了，所以，这里，把用户的信息也返回了，就是为了兼容那些注册后就直接登录的网站.
  }
}}
//获取列表
const getUsers = async ctx=>{
  var page = parseInt(ctx.request.body.page);
  var pageSize = parseInt(ctx.request.body.pageSize);
  var skip = parseInt((page - 1) * pageSize);
  await Test.find({}).then(async data=>{
    
  //  let conunts =  Test.count({},function(err,count){
  //     // ctx.body={
  //     //   status:'0',
  //     //   message:'添加成功',
  //     //   result:data,
  //     //   count:count
  //     // }
  //     return count
  // })
    var counts = await Test.count({},function(err,count){ counts=count })

    ctx.body={
      status:'0',
      message:'添加成功',
      result:data,
      count:counts
    }
  })
}
//修改用户
const updateUser = async ctx=>{
  // console.log(ctx.request.body);
  await Test.findOne({'_id':ctx.request.body.editDialog._id}).then(editDialog=>{
    editDialog.name = ctx.request.body.editDialog.name;
    editDialog.phone = ctx.request.body.editDialog.phone;
    editDialog.email = ctx.request.body.editDialog.email;
    editDialog.is_active = ctx.request.body.editDialog.is_active;
    
    editDialog.save().then(data=>{
      
    })
    ctx.body  = {
      status:'0',
      message:'修改成功'
    }
  })
}

//删除用户
const deleteUser = async ctx=>{
  // console.log(ctx.request.body.row._id)
  let _id =  ctx.request.body.row._id;
  Test.remove({'_id':_id}).then(data=>{
    
  })
  ctx.body  = {
    status:'0',
    message:'删除成功'
  }
}
//删除全部
const deleteAll = async ctx=>{
  let delAllUser = ctx.request.body.multipleSelection;
  delAllUser.forEach((data)=>{
    Test.remove({"_id":data._id}).then(()=>{
    })
  })
  ctx.body  = {
    status:'0',
    message:'删除全部成功'
  }
}
module.exports = {
  register,
  login,
  home,
  home1,
  getUsers,
  updateUser,
  deleteUser,
  deleteAll
}
