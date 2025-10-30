<script setup>
import { ref ,onMounted} from 'vue'
import { queryAllApi ,addApi,queryByIdApi,updateApi,deleteByIdApi} from '@/api/dept';
import { ElMessage ,ElMessageBox } from 'element-plus'





onMounted(() => {
  search()
})
//查询
const deptList=ref([])
const search=async () => { 
  const result = await queryAllApi();
  if (result.code) {
    deptList.value=result.data
  }
}
//dialog对话框
const dialogFormVisible=ref(false);
const formTitle=ref('');
const dept=ref({name:''});

const save=async ()=>{ 
  //表单验证
  if(!deptFormRef.value) return;
  deptFormRef.value.validate(async (valid)=>{
    if(valid){
        let result;
        if(dept.value.id) {
          //有id是修改       
           result = await updateApi(dept.value); 
        }else{
          //无id是新增
           result = await addApi(dept.value);
        }  
        if (result.code) {
          ElMessage.success('保存成功');
          dialogFormVisible.value=false;
          search();
            }else{
                ElMessage.error(result.msg);
              } 
}else{
      console.log('表单验证失败');
    }
  });
};
//新增部门
const addDept=()=>{ 
  dialogFormVisible.value=true;
  formTitle.value='新增部门';
  dept.value={name:''};
  //重置表单校验规则
  if(deptFormRef.value) {
    deptFormRef.value.resetFields();
  };
};


const rules = ref({
  name: [
    { required: true, message: '部门名称不能为空', trigger: 'blur' },
    { min: 2, max: 10, message: '部门名称长度应为 2 到 10 个字符', trigger: 'blur' },
  ]
})
const deptFormRef = ref();

//编辑
const edit =async (id) => { 
  formTitle.value='编辑部门';
  //重置表单校验规则
  if(deptFormRef.value) {
    deptFormRef.value.resetFields();
  };
  const result = await queryByIdApi(id);
  if(result.code) {
    dialogFormVisible.value=true;
    dept.value=result.data;
};
 
}

//删除
const delById=async (id)=>{
  //弹出确认框
   ElMessageBox.confirm('是否确认删除该部门?','提示',
    {confirmButtonText: '确认',cancelButtonText: '取消',type: 'warning',}
  )//确认
    .then(async() => {
      const result = await deleteByIdApi(id);
      if(result.code) {
       ElMessage.success('删除成功');
       search();
      }else{
        ElMessage.error(result.msg);
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}

</script>

<template>
  <h1>部门管理</h1>
  <!-- 表格 -->
  <div class="container">
    <el-button type="primary" @click="addDept">新增部门</el-button> 
  </div>
  <div>
     <el-table :data="deptList" border style="width: 100%">
    <el-table-column type="index"label="序号" width="60" align="center" />
    <el-table-column prop="name" label="部门名称" width="160"  align="center" />
    <el-table-column prop="createTime" label="创建时间" width="300" align="center" />
    <el-table-column prop="updateTime" label="最后操作事件" width="300" align="center" />
    <el-table-column label="操作" align="center" >
        <template #default="scope">
          <el-button type="primary" size="small" @click="edit(scope.row.id)">编辑</el-button>
          <el-button type="danger" size="small" @click="delById(scope.row.id)">删除</el-button>
        </template>
    </el-table-column>
  </el-table>
  </div>
  <!-- Dialog对话框 -->
   <el-dialog v-model="dialogFormVisible" :title="formTitle" width="500">
    <el-form :model="dept" :rules="rules" ref="deptFormRef">
      <el-form-item label="部门名称" :label-width="'80px'" prop="name">
        <el-input v-model="dept.name"  />
      </el-form-item>
     
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="save">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.container {
  margin: 10px 0px; ;
}

</style>
