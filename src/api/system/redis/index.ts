import request from '@/axios'
import type { RedisInfo, RedisKeyList, RedisKey } from './types'

export const getRedisInfoApi = () => {
  return request.get<RedisInfo>({ url: '/Redis/GetRedisInfo' })
}

export const getRedisStatusApi = () => {
  return request.get<{ status: string; message?: string }>({ url: '/Redis/GetRedisStatus' })
}

export const getRedisKeysApi = (params: {
  pageIndex: number
  pageSize: number
  keyWord?: string
  dataType?: string
}) => {
  return request.get<RedisKeyList>({ url: '/Redis/GetRedisKeys', params })
}

export const getRedisKeyValueApi = (key: string) => {
  return request.get<RedisKey>({ url: '/Redis/GetRedisKeyValue', params: { key } })
}

export const deleteRedisKeyApi = (key: string) => {
  return request.delete({ url: '/Redis/DeleteRedisKey', data: { key } })
}

export const deleteRedisKeysApi = (keys: string[]) => {
  return request.delete({ url: '/Redis/DeleteRedisKeys', data: { keys } })
}

export const updateRedisKeyApi = (key: string, value: string, ttl?: number) => {
  return request.put({ url: '/Redis/UpdateRedisKey', data: { key, value, ttl } })
}

export const addRedisKeyApi = (key: string, type: string, value: string, ttl?: number) => {
  return request.post({ url: '/Redis/AddRedisKey', data: { key, type, value, ttl } })
}

export const flushRedisDbApi = () => {
  return request.delete({ url: '/Redis/FlushDb' })
}
