<template>
<div>
  <el-container>
    <el-header>
      <h1>Vue + Node CURD增删改查项目</h1>
    </el-header>
    <el-main>
      <el-row>
        <el-col :span="20" :offser='1'>
          <div class='fr margin40'>
            <el-button size='mini' type='primary' icon='el-icon-plus' @click='addDialog = true'>添加</el-button>
            <el-button size='mini' type='danger' icon='el-icon-delete'  @click="deleteAll">删除</el-button>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <!-- toolltip-effect提示效果 -->
          <el-table :data="result" tooltip-effect="dark" style="width:100%" @selection-change="selectionButton" >
            <el-table-column type="selection" width="55" >

            </el-table-column>
            <el-table-column prop='username' width="100" label="用户名" >

            </el-table-column>
            <el-table-column prop='name' width="80" label="姓名" sortable>

            </el-table-column>
            <el-table-column prop='phone' label="手机" >

            </el-table-column>
            <el-table-column prop='email' label="邮箱" >

            </el-table-column>
            <el-table-column prop='create_time' label="注册日期" sortable>

            </el-table-column>
            <el-table-column prop="is_active" label="状态" width="75">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.is_active==true?'success':'danger'">
                    {{scope.row.is_active|formatter}}
                  </el-tag>
                </template>
              </el-table-column>
            <el-table-column label="操作" width="250">
              <template slot-scope="scope">
                <el-button type='success' size="small" @click="setUser(scope.row)">编辑</el-button>
                <el-button type="danger" size='small' @click="deleteUser(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <el-row>
          <el-col :span="24">
            <div class="block">
              <el-pagination layout="prev,pager,next" :total="total" :page-size="5" >
              </el-pagination>
            </div>
          </el-col>
        </el-row>
    </el-main>
  </el-container>
 <!-- 添加部分 -->
  <el-dialog title="添加新用户" :visible.sync="addDialog" @close="resetForm('addForm')"> 
    <el-form :model="addForm" :rules="addRules" ref="addForm" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input type="text" v-model="addForm.username" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input type="text" v-model="addForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="text" v-model="addForm.password" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="repeat_password">
        <el-input type="text" v-model="addForm.repeat_password" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="phone">
        <el-input type="text" v-model.number="addForm.phone" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input type="email" v-model="addForm.email" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="是否启用">
        <el-switch v-model="addForm.is_active"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('addForm')">提交</el-button>
        <el-button @click="resetForm('addForm')">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
 <!-- 修改部分 -->
  <el-dialog title="修改用户" :visible.sync="editDialog" @close="resetForm('editForm')">
      <el-form :model="editForm" :rules="addRules" ref="editForm" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input type="text" v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input type="text" v-model.number="editForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="email" v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="是否启用" prop="is_active">
          <el-switch v-model="editForm.is_active"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateUser">修改</el-button>
          <el-button @click="resetForm('editForm')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
</div>
</template>
<script>
  import request from '@/utils/request'
  export default {
      
      name:"Home",
        //组件渲染完毕后调用getUsers,来获取所有的用户列表
       mounted:function(){
         this.getUsers()
      },
      data(){
        //定义密码验证,确认密码h函数
        var checkPass = (rule,value,callback)=>{
           if(value !== this.addForm.password){
            callback(new Error('两次密码输入一样,请重新输入'))
          }else{
            callback();
          }
        };
        return{
          //用于收集新增用户对象
          addForm:{
            username:'',
            name:'',
            passworld:'',
            repeat_passworld:'',
            phone:'',
            email:'',
            is_active:false
          },
          editForm:{
            name:'',
            phone:'',
            email:'',
            is_active:false
          },
          //添加对话框
          addDialog:false,
          //编辑对话框
          editDialog:false,
          result:[],//要添加的的数组
          addRules:{
            //验证
           username:[
                  {required:true,message:'请输入用户名',tigger:'blur'},
                  {min:3,max:16,message:'请输入合法的用户名',tigger:'blur'}
                ],
                name:[
                  {required:true,message:'请输入姓名',tigger:'blur'}
                ],
                password:[
                  {required:true,message:'请输入密码',tigger:'blur'},
                  {min:6,max:12,message:'密码长度不合法',tigger:'blur'}
                ],
                repeat_password:[
                  {validator:checkPass,tigger:'blur'}
                ],
                phone:[
                  {type:'number',required:true,message:'必须是数字类型',tigger:
                  'blur'}
                ],
                email:[
                  {type:'email',required:true,message:'必须是合法邮箱格式',tigger:'blur'}
                ]
          },
          total:0,
          multipleSelection:[]
        }
      },
      methods:{
         submitForm:function(formName){
            //添加
            this.$refs[formName].validate((valid)=>{
                
                if(valid){
                  //提交
                request({
                  url:'/api/home1',
                  method:'post',
                  data:this.addForm
                }).then(({data})=>{
                  let success = data.success;//成功与否的布尔值
                  let message = data.message;
                  let userInfo = data.data;//用户信息
                  if(success){
                    //成功
                    this.getUsers()
                    this.$message.success('ok')
                    this.addDialog = false
                  }else{
                    //失败后给出错误提示
                    this.$message.success(message);
                  }
                }).catch(err=>{
                  console.log(err)
                })
                }else{
                  //验证失败
                  return false
                }
            })
        },
        ////将弹出框关闭
        resetForm:function(formName){
          //将弹出框关闭
          if(formName == 'addForm'){

            this.addDialog = false;
          }else if(formName == 'editForm'){
            //
            this.editDialog = false
          }
          //将弹出框内容清空函数
          this.$refs[formName].resetFields()
        },
        //查询显示
        getUsers:function(page){
    
            request({
              url:'/api/getUsers',
              method:'get',
              data:{
                // result:this.result
                page:page || 1,
                    pageSize:5
              }
              
            }).then(({data})=>{
              if(data.result) {
                // this.result = data.allUser
                this.result = data.result;
                this.total = data.count;
                //  this.$refs.$message(data.message)
              }
               this.addDialog = false;
            }).catch(err=>{
                  console.log(err);
            })
        },
        //打开编辑框
        setUser:function(row){
          this.editDialog = true;
          this.editForm._id = row._id;
          this.editForm.name = row.name;
          this.editForm.phone = row.phone;
          this.editForm.email = row.email;
          this.editForm.is_active = row.is_active;
        }
        ,
        //编辑修改
        updateUser:function(){
          // this.editForm = true;
          this.editDialog = false;
          request({
            url:"/api/updateUser",
            method:'post',
            data:{
              editDialog:this.editForm
            }
          }).then(({data})=>{
            if(data.status){
              this.getUsers();
              this.$message.success('修改成功')
            }
          })
        },
        //删除用户
        deleteUser:function(row){
          console.log(row)
          this.$confirm('是否删除此用户'+ row.username +',是否继续删除？','提示',{
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            center:true
          }).then(()=>{
            request({
              url:'/api/deleteUser',
              method:'post',
              data:{
                row
              }
            })
            this.getUsers();
            this.$message.success('删除成功')
          }).catch(()=>{
            this.$message.info('已取消操作')
          })
        },
        //判断全选
        selectionButton:function (val) {
          this.multipleSelection= val;
          console.log(this.multipleSelection= val)
        },
        //删除全部
        deleteAll:function(){
              this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            center:true
          }).then(()=>{
            request({
              url:'/api/deleteAll',
              method:'post',
              data:{
                multipleSelection: this.multipleSelection
              }
            })
            this.getUsers();
            this.$message.success('删除成功')
          }).catch(()=>{
            this.$message.info('已取消操作')
          })
        },
    
        }

      
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
 h1 {
    text-align:center;
  }
  .clearfix {
    clear:both;
  }
  .fr {
    float:right;
  }
  .fl {
    float:left;
  }
  .margin40 {
    margin-top:40px;
  }
  .block {
    margin-top:20px;
    float:right;
  }
</style>
