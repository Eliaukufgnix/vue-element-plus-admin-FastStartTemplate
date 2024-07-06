import request from '@/axios'
import type { UserType } from './types'

interface RoleParams {
  UserId: string | undefined
}

export const loginApi = (data: UserType): Promise<IResponse<UserType>> => {
  // return request.post({ url: '/mock/user/login', data })
  return request.post({ url: '/Login/Login', data })
}

export const loginOutApi = (): Promise<IResponse> => {
  // return request.get({ url: '/mock/user/loginOut' })
  return request.get({ url: '/Login/LoginOut' })
}

export const getAdminRoleApi = (
  params: RoleParams
): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  // return request.get({ url: '/mock/role/list', params })
  return request.get({ url: '/SysMenu/GetMenuTreeByUserId', params })
}

export const getTestRoleApi = (params: RoleParams): Promise<IResponse<string[]>> => {
  return request.get({ url: '/mock/role/list2', params })
}
