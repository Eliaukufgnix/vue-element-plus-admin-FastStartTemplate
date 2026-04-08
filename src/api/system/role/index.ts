import request from '@/axios'
import type { RoleTableData } from './types'
export const getTableApi = (params: any) => {
  return request.get({ url: '/SysRole/GetEntitiesByWhereToPageAsync', params })
}

export const deleteTableApi = (ids: string[] | number[]) => {
  return request.delete({ url: '/SysRole/DeleteEntitiesAsync', data: { ids } })
}

export const saveTableApi = (data: Partial<RoleTableData>) => {
  return request.post({ url: '/SysRole/SaveEntity', data })
}
