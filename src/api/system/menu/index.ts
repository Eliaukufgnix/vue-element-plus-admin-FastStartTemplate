import request from '@/axios'
import type { MenuTableData } from './types'
export const getTableApi = (params: any) => {
  return request.get({ url: '/SysMenu/GetEntitiesByWhereToPageAsync', params })
}

export const deleteTableApi = (ids: string[] | number[]) => {
  return request.delete({ url: '/SysMenu/DeleteEntitiesAsync', data: { ids } })
}

export const saveTableApi = (data: Partial<MenuTableData>) => {
  return request.post({ url: '/SysMenu/SaveEntity', data })
}
