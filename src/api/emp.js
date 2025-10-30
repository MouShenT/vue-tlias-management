import request from '@/utils/request'
// 查询所有员工信息
export const queryPageApi = (name,gender,begin,end,page,pageSize) => {
  return request.get(`/emps?name=${name}&gender=${gender}&begin=${begin}&end=${end}&page=${page}&pageSize=${pageSize}`)
}
// 添加员工信息
export const addApi = (emp) => {
  return request.post('/emps', emp)
}
//根据id查询
export const queryInfoApi = (id) => {
  return request.get(`/emps/${id}`)
}
// 修改员工信息
export const updateApi = (emp) => {
  return request.put('/emps', emp)
}
//删除员工信息
export const deleteApi = (ids) => {
  return request.delete(`/emps?ids=${ids}`)
}