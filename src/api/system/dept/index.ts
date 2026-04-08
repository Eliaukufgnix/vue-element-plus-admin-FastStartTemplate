import request from '@/axios'
import type { DeptTableData } from './types'
export const getTableApi = (params: any) => {
  return request.get({ url: '/SysDept/GetEntitiesByWhereToPageAsync', params })
}

export const deleteTableApi = (ids: string[] | number[]) => {
  return request.delete({ url: '/SysDept/DeleteEntitiesAsync', data: { ids } })
}

export const saveTableApi = (data: Partial<DeptTableData>) => {
  return request.post({ url: '/SysDept/SaveEntity', data })
}
