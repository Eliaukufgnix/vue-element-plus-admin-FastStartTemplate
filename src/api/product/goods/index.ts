import request from '@/axios'

export const getProductByTypeApi = (params: any) => {
  return request.get({ url: '/Product/GetProductByType', params })
}
