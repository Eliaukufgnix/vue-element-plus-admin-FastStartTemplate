import request from '@/axios'
import type { DictTableData } from './types'
export const getTableApi = (params: any) => {
  return request.get({ url: '/SysDict/GetEntitiesByWhereToPageAsync', params })
}

export const deleteTableApi = (ids: string[] | number[]) => {
  return request.delete({ url: '/SysDict/DeleteEntitiesAsync', data: { ids } })
}

export const saveTableApi = (data: Partial<DictTableData>) => {
  return request.post({ url: '/SysDict/SaveEntity', data })
}
