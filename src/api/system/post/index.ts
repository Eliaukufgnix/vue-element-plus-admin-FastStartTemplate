import request from '@/axios'
import type { PostTableData } from './types'
export const getTableApi = (params: any) => {
  return request.get({ url: '/SysPost/GetEntitiesByWhereToPageAsync', params })
}

export const deleteTableApi = (ids: string[] | number[]) => {
  return request.delete({ url: '/SysPost/DeleteEntitiesAsync', data: { ids } })
}

export const saveTableApi = (data: Partial<PostTableData>) => {
  return request.post({ url: '/SysPost/SaveEntity', data })
}
