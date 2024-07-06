import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
//import { Layout, getParentLayout } from '@/utils/routerHelper'
import { Layout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'

const { t } = useI18n()

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/product',
    name: 'Root',
    meta: {
      hidden: true
    }
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'Redirect',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  // {
  //   path: '/baseInfoManagement',
  //   component: Layout,
  //   redirect: '/baseInfoManagement/systemSettings/user',
  //   name: 'System',
  //   meta: {
  //     title: t('router.baseInfoManagement'),
  //     icon: 'carbon:skill-level-advanced'
  //   },
  //   children: [
  //     {
  //       path: 'systemSettings',
  //       name: 'SystemSettings',
  //       component: getParentLayout(),
  //       redirect: '/baseInfoManagement/systemSettings/user',
  //       meta: {
  //         title: t('router.systemSettings')
  //       },
  //       children: [
  //         {
  //           path: 'user',
  //           name: 'User',
  //           component: () => import('@/views/System/User.vue'),
  //           meta: {
  //             title: t('router.user')
  //           }
  //         },
  //         {
  //           path: 'role',
  //           name: 'Role',
  //           component: () => import('@/views/System/Role.vue'),
  //           meta: {
  //             title: t('router.role')
  //           }
  //         }
  //       ]
  //     }
  //   ]
  // }
]

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  const resetWhiteNameList = ['Redirect', 'Login', 'NoFind', 'Root']
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !resetWhiteNameList.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
