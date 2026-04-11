import request from '@/axios'
import type { OperLogTableData } from './types'
export const getTableApi = (params: any) => {
  return request.get({ url: '/SysOperLog/GetEntitiesByWhereToPageAsync', params })
}

export const deleteTableApi = (ids: string[] | number[]) => {
  return request.delete({ url: '/SysOperLog/DeleteEntitiesAsync', data: { ids } })
}

export const saveTableApi = (data: OperLogTableData) => {
  return request.post({ url: '/SysOperLog/SaveEntity', data })
}
