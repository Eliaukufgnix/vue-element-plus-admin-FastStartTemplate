import request from '@/axios'
import type { UserTableData } from './types'
export const getUserTableApi = (params: any) => {
  return request.get({ url: '/SysUser/GetSysUserByWhereToPage', params })
}

export const deleteUserTableApi = (ids: string[] | number[]) => {
  //return request.get({ url: '/mock/user/delete', data: { ids } })
  return request.delete({ url: '/SysUser/DeleteSysUserList', data: { ids } })
}

export const saveUserTableApi = (data: Partial<UserTableData>) => {
  return request.post({ url: '/SysUser/AddSysUser', data })
}
