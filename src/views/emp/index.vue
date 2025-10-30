<script setup>
import { ref ,watch ,onMounted} from 'vue';
import { queryPageApi,addApi,queryInfoApi,updateApi,deleteApi } from '@/api/emp';
import { queryAllApi as queryAllDeptApi} from '@/api/dept';
import { ElMessage,ElMessageBox } from 'element-plus';



  
const token = ref();
const searchEmp = ref({name: '',gender: '',date: [],begin: '',end: ''});
const search = async () => { 
  const result = await queryPageApi(searchEmp.value.name,
  searchEmp.value.gender,searchEmp.value.begin,searchEmp.value.end,currentPage.value,pageSize.value);
  if (result.code) {
    empList.value=result.data.rows;
    total.value=result.data.total;
  }
};
//清空
const clear = () => {
  searchEmp.value={name: '',gender: '',date: [],begin: '',end: ''};
  search();
};
//watch监听
watch(()=>searchEmp.value.date, (newVal,oldVal) => {
  if(newVal.length==2) {
    searchEmp.value.begin=newVal[0];
    searchEmp.value.end=newVal[1];
  }else{
    searchEmp.value.begin='';
    searchEmp.value.end='';
  }
});
onMounted(() => {
  search();
  queryAllDepts();
  getToken();
});
const getToken = () => {
  const loginUser = JSON.parse(localStorage.getItem('loginUser'));
  if (loginUser && loginUser.token) {
    token.value = loginUser.token;
    console.log('Token:', token.value);
  }  else {
    ElMessage.error('请先登录');
    // 可以添加跳转到登录页的逻辑
  }
  return token.value;
};
//获取部门列表
const queryAllDepts = async () => {
  const result = await queryAllDeptApi();
  if (result.code) {
    depts.value=result.data;
  }
}
//员工列表
const empList=ref([]);
//分页

const currentPage = ref(1)//页码
const pageSize = ref(10) //每页条数
const background = ref(true)//是否显示背景色
const total = ref(0)//总条数
//每页展示记录数变化
const handleSizeChange = () => {
  search
}
//当前页码变化
const handleCurrentChange = () => {
  search();
}
  
const experienceNumber=ref(0);
//新增员工
const addEmp = () => {
  employee.value={
    username:'',
    name:'',
    gender:'',
    phone:'',
    job:'',
    salary:'',
    deptId:'',
    entryDate:'',
    image:'',
    exprList:[
    
    ],
  }
  if(empFormRef.value) {
    empFormRef.value.resetFields();
  };
  dialogFormVisible.value = true;
  dialogTitle.value = '新增员工';
}

const addWorkExperience = () => {
  experienceNumber.value++;
  employee.value.exprList.push({
    begin:'',
    end:'',
    company:'',
    job:'',
    exprDate:['','']
  })
}
const deleteExprItem = (index) => {
  employee.value.exprList.splice(index,1);
}




const employee=ref({
  username:'',
  name:'',
  gender:'',
  phone:'',
  job:'',
  salary:'',
  deptId:'',
  entryDate:'',
  image:'',
  exprList:[
    {
      begin:'',
      end:'',
      company:'',
      job:''
    }
  ],
});
watch(() => employee.value?.exprList, (newVal) => {
  if (newVal?.length > 0) {
    newVal.forEach(item => {
      if (item.exprDate?.length === 2) {
        item.begin = item.exprDate[0]
        item.end = item.exprDate[1]
      }
    })
  }
}, { deep: true })
const jobs=ref([
  {value:1,name:'班主任'},
  {value:2,name:'讲师'},
  {value:3,name:'学工主管'},
  {value:4,name:'教研主管'},
  {value:5,name:'咨询师'},
  {value:6,name:'其他'},
]);
const genders=ref([
  {value:'1',name:'男'},  // 值改为字符串类型
  {value:'2',name:'女'},
]);
const depts=ref([]);

//对话框
const dialogFormVisible = ref(false);
const dialogTitle = ref('新增员工');
const handleAvatarSuccess = (res) => {
  if (res.code) {
    employee.value.image=res.data;
    ElMessage.success('上传成功');
  }else{
    ElMessage.error(res.msg);
  }
};
const beforeAvatarUpload = (file) => {
  const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;
  // 检查token是否存在
  const currentToken = getToken();
  if (!currentToken) {
    ElMessage.error('请先登录系统');
    return false;
  }

  if (!isJPGorPNG) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
    return false;
  }
  return isJPGorPNG && isLt2M;
};
const save=async()=>{ 
  // 转换工作经历数据格式
  const payload = {
    ...employee.value,
    salary: Number(employee.value.salary), // 添加类型转换
    exprList: employee.value.exprList.map(expr => ({
      begin: expr.begin,
      end: expr.end,
      company: expr.company,
      job: expr.job
    }))
  };
  if (empFormRef.value) {
    empFormRef.value.validate(async (valid) => {
      if (valid) {
        let result;
        if(employee.value.id){
           result = await updateApi(payload);
        }else{
             result = await addApi(payload); 
        }
        if (result.code) {
          ElMessage.success('保存成功');
          dialogFormVisible.value = false;
          search();
        } else {
          ElMessage.error(result.msg);
        }
      } else {
        ElMessage.error('请填写完整信息');
      }
    });
  }
}

  
  
 
//表单引用
const empFormRef = ref();
const rules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }
    , { min: 2, max: 20, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }
    , { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }
    , {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur'}
  ],
  
});
//编辑
const edit = async (id) => { 

  const result = await queryInfoApi(id);
  
   if (result.code) { 
   employee.value = result.data;
     dialogFormVisible.value = true;
    dialogTitle.value = '编辑员工';
   }
  //  对工作时间进行处理
  if (employee.value.exprList?.length > 0) {
    employee.value.exprList.forEach(item => {
      if (item.begin && item.end) {
        item.exprDate = [item.begin, item.end]
      }
    })
  }

}
//删除
const deleteById =  (id) => {
  ElMessageBox.confirm('此操作将永久删除该员工, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const result = await deleteApi(id);
    if (result.code) {
      ElMessage.success('删除成功');
      search();
    } else {
      ElMessage.error(result.msg);
    }
  })
}
//记录勾选员工id
const selectedIds = ref([])
// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => {
    return item.id
  })
}
const deleteByIds = () => {
  
  ElMessageBox.confirm(`此操作将永久删除选中的 ${selectedIds.value.length} 位员工, 是否继续?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    if (selectedIds.value.length === 0) {
      ElMessage.error('请选择要删除的项');
      return;
    }
    const result = await deleteApi(selectedIds.value);
    if (result.code) {
      ElMessage.success('删除成功');
      search();
      selectedIds.value = []
    } else {
      ElMessage.error(result.msg);
    }
  })
}

</script>

<template>

  <h1>员工管理</h1>
  <!-- 搜索栏 -->
  <div class="container">
    <el-form 
      :inline="true" 
      :model="searchEmp" 
      class="demo-form-inline"
      style="display: flex; align-items: center; gap: 10px;"
    >
      <el-form-item label="姓名" style="margin-right: 0">
        <el-input v-model="searchEmp.name" placeholder="请输入员工姓名" clearable style="width: 140px"/>
      </el-form-item>

      <el-form-item label="性别" style="margin-right: 0">
        <el-select 
          v-model="searchEmp.gender" 
          placeholder="请选择性别" 
          style="width: 120px"
        >
          <el-option label="男" value=1 />
          <el-option label="女" value=2 />
        </el-select>
      </el-form-item>

      <el-form-item label="入职时间" style="margin-right: 0">
        <el-date-picker
          v-model="searchEmp.date"
          type="daterange"
          range-separator="到"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 320px"
        />
      </el-form-item>

      <el-form-item style="margin-left: auto">
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>
  </div>
  <!-- 功能按钮 -->
   <div class="container">
    <el-button type="primary" @click="addEmp">+新增员工</el-button>
    <el-button type="danger" @click="deleteByIds">-批量删除</el-button>
   </div>
   <!-- 数据展示表格 -->
   <div class="container">
     <el-table :data="empList" border style="width: 100%" @selection-change="handleSelectionChange">
     <el-table-column type="selection" width="45" align="center" /> 
    <el-table-column prop="name" label="姓名" width="110" align="center" /> 
    <el-table-column prop="gender" label="性别" width="110" align="center" >
      <template #default="scope">
        <el-tag v-if="scope.row.gender==='1'" type="success">男</el-tag>
        <el-tag v-if="scope.row.gender==='2'" type="danger">女</el-tag>
        </template>
      </el-table-column>
    <el-table-column prop="image" label="头像" width="110" align="center" >
      <template #default="scope">
        <el-image :src="scope.row.image" style="width: 50px; height: 50px;"></el-image>
      </template>
    </el-table-column>
    <el-table-column prop="deptName" label="所属部门" width="110" align="center" />
    <el-table-column prop="job" label="职务" width="110" align="center" >
      <template #default="scope">
        <span v-if="scope.row.job===1">班主任</span>
        <span v-else-if="scope.row.job===2">讲师</span>
        <span v-else-if="scope.row.job===3">学工主管</span>
        <span v-else-if="scope.row.job===4">教研主管</span>
        <span v-else-if="scope.row.job===5">咨询师</span>
        <span v-else>其他</span>
      </template>
    </el-table-column>
    <el-table-column prop="entryDate" label="入职时间" width="110" align="center" />
    <el-table-column prop="updateTime" label="更新时间" width="110" align="center" />
    <el-table-column label="操作" align="center">
    <template #default="scope">
          <el-button type="primary" size="small" @click="edit(scope.row.id)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteById(scope.row.id)">删除</el-button>
        </template>
    </el-table-column>
  </el-table>
   </div>
   <!-- 分页组件 -->
   <div class="container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20, 40]"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
   </div>
   <!-- 新增员工/修改员工对话框 -->
   
    <el-dialog v-model="dialogFormVisible" :title="dialogTitle" width="800">
   
    <el-form :model="employee" :rules="rules" ref="empFormRef" label-width="80px">
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="employee.username" placeholder="请输入用户名" />
          </el-form-item>
        </el-col>
        <el-col :span="12"> 
          <!-- 姓名 -->
          <el-form-item label="姓名" prop="name">
            <el-input v-model="employee.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
    </el-row>
    <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="employee.gender" placeholder="请选择性别">
              <el-option v-for="item in genders" :key="item.value" :label="item.name" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="employee.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
    </el-row>
    <!-- 职位，薪资 -->
    <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="职务">
            <el-select v-model="employee.job" placeholder="请选择职务">
              <el-option v-for="item in jobs" :key="item.value" :label="item.name" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
  <el-form-item label="薪资">
    <el-input 
      v-model="employee.salary" 
      placeholder="请输入薪资" 
      type="number"
      min="0"
      step="1"
      oninput="value=value.replace(/[^\d]/g,'')"
    />
  </el-form-item>
</el-col>
    </el-row>
    <!-- 所属部门，入职日期 -->
    <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属部门">
            <el-select v-model="employee.deptId" placeholder="请选择所属部门">
              <el-option v-for="item in depts" :key="item.id" :value="item.id" :label="item.name" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入职时间">
            <el-date-picker v-model="employee.entryDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择入职时间" />
          </el-form-item>
        </el-col>
    </el-row>
    <!-- 头像 -->
    <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="头像">
            <el-upload
              class="avatar-uploader"
              action="/api/upload"
              :headers="{'token': getToken()}"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
            <!-- 限制一下展示图片大小 -->
            <img v-if="employee.image" :src="employee.image" class="avatar" width="100px" height="100px" />
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-form-item>
        </el-col>
    </el-row>
     <!-- 工作经历：里面有一个工作经历的按钮，点开 ，下面输入工作经历包括时间，公司，职务 -->
    <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="工作经历">
            <el-button type="primary" @click="addWorkExperience">添加</el-button>
          </el-form-item>
        </el-col>
    </el-row>
    <el-row :gutter="4" v-for="expr,index in employee.exprList">
        <!-- 开始时间和结束时间在组件中 -->
          <el-col :span="10">
          <el-form-item  label="时间" label-width="60px">
            <el-date-picker v-model="expr.exprDate" type="daterange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" value-format="YYYY-MM-DD" placeholder="请选择开始时间" />
          </el-form-item>
        </el-col>

        <el-col :span="5">
          <el-form-item label="公司" label-width="40px">
            <el-input v-model="expr.company" placeholder="请输入公司" />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="职务" label-width="40px">
            <el-input v-model="expr.job" placeholder="请输入职务" />
          </el-form-item>
        </el-col>
        <el-col :span="1">
          <el-form-item label="删除" label-width="40px">
            <el-button type="danger" @click="deleteExprItem(index)">删除</el-button>
          </el-form-item>
        </el-col>
    </el-row>
    
     
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="save">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>

</template>

<style scoped>
.container {
  margin: 10px 15px;
}

</style>