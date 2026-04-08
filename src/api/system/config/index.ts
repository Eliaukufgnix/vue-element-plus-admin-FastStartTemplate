import request from '@/axios'
import type { ConfigTableData } from './types'
export const getTableApi = (params: any) => {
  return request.get({ url: '/SysConfig/GetEntitiesByWhereToPageAsync', params })
}

export const deleteTableApi = (ids: string[] | number[]) => {
  return request.delete({ url: '/SysConfig/DeleteEntitiesAsync', data: { ids } })
}

export const saveTableApi = (data: Partial<ConfigTableData>) => {
  return request.post({ url: '/SysConfig/SaveEntity', data })
}
