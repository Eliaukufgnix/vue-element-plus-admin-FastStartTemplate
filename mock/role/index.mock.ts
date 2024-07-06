import { MockMethod } from 'vite-plugin-mock'
import { SUCCESS_CODE } from '@/constants'

const timeout = 1000

const adminList = [
  {
    path: '/baseInfoManagement',
    component: '#',
    redirect: '/baseInfoManagement/systemSettings/user',
    name: 'BaseInfoManagement',
    meta: {
      title: 'router.baseInfoManagement',
      icon: 'carbon:skill-level-advanced'
    },
    children: [
      {
        path: 'systemSettings',
        name: 'SystemSettings',
        component: '##',
        redirect: '/baseInfoManagement/systemSettings/user',
        meta: {
          title: 'router.systemSettings'
        },
        children: [
          {
            path: 'user',
            name: 'User',
            component: 'views/System/User/User',
            meta: {
              title: 'router.user'
            }
          },
          {
            path: 'role',
            name: 'Role',
            component: 'views/System/Role/Role',
            meta: {
              title: 'router.role'
            }
          },
          {
            path: 'menu',
            name: 'Menu',
            component: 'views/System/Menu/Menu',
            meta: {
              title: 'router.menuManagement'
            }
          },
          {
            path: 'workOrder',
            name: 'WorkOrder',
            component: 'views/System/WorkOrder/WorkOrder',
            meta: {
              title: 'router.menuManagement'
            }
          }
        ]
      }
    ]
  }
]

const testList: string[] = [
  '/level',
  '/level/menu1',
  '/level/menu1/menu1-1',
  '/level/menu1/menu1-1/menu1-1-1',
  '/level/menu1/menu1-2',
  '/level/menu2'
]

export default [
  // 列表接口
  {
    url: '/mock/role/list',
    method: 'get',
    timeout,
    response: ({ query }) => {
      const { roleName } = query
      return {
        code: SUCCESS_CODE,
        data: roleName === 'admin' ? adminList : testList
      }
    }
  }
] as MockMethod[]
