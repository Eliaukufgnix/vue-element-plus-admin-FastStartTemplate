import request from '@/axios'
import type { UserTableData } from './types'
export const getTableApi = (params: any) => {
  return request.get({ url: '/SysUser/GetEntitiesByWhereToPageAsync', params })
}

export const deleteTableApi = (ids: string[] | number[]) => {
  return request.delete({ url: '/SysUser/DeleteEntitiesAsync', data: { ids } })
}

export const saveTableApi = (data: Partial<UserTableData>) => {
  return request.post({ url: '/SysUser/SaveEntity', data })
}
