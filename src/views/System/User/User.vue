<script setup lang="tsx">
//import { ElInput } from 'element-plus'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Dialog } from '@/components/Dialog'
import { Table, TableColumn } from '@/components/Table'
import { useI18n } from '@/hooks/web/useI18n'
import { ref, reactive, unref } from 'vue'
import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { getTableApi, deleteTableApi, saveTableApi } from '@/api/system/user'
import { BaseButton } from '@/components/Button'
import { UserTableData } from '@/api/system/user/types'
import Write from './components/Write.vue'

defineOptions({
  name: 'User'
})

const { t } = useI18n()
const ids = ref<string[]>([])
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getTableApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    return {
      list: res.data.list,
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    const res = await deleteTableApi(unref(ids))
    return !!res
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList, refresh } = tableMethods

const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'selection',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    },
    table: {
      type: 'selection'
    }
  },
  {
    field: 'userId',
    label: '用户ID',
    search: {
      hidden: true
    }
  },
  {
    field: 'userName',
    label: '用户账号',
    search: {
      component: 'Input'
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'nickName',
    label: '用户昵称'
  },
  {
    field: 'sex',
    label: '用户性别',
    search: {
      hidden: true
    },
    formatter: (_: Recordable, __: TableColumn, cellValue: string) => {
      return cellValue == '0' ? '男' : cellValue == '1' ? '女' : '未知'
    },
    form: {
      component: 'Select',
      componentProps: {
        style: {
          width: '100%'
        },
        options: [
          {
            label: '男',
            value: '0'
          },
          {
            label: '女',
            value: '1'
          },
          {
            label: '未知',
            value: '2'
          }
        ]
      }
    }
  },
  {
    field: 'phonenumber',
    label: '手机号码'
  },
  {
    field: 'email',
    label: '用户邮箱'
  },
  {
    field: 'loginIp',
    label: '最后登录IP',
    search: {
      hidden: true
    }
  },
  {
    field: 'loginDate',
    label: '最后登录时间',
    search: {
      hidden: true
    },
    form: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetime'
      }
    }
  },
  {
    field: 'createBy',
    label: '创建者',
    search: {
      hidden: true
    }
  },
  {
    field: 'createTime',
    label: '创建时间',
    search: {
      hidden: true
    },
    form: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetime'
      }
    }
  },
  {
    field: 'updateBy',
    label: '更新者',
    search: {
      hidden: true
    }
  },
  {
    field: 'updateTime',
    label: '更新时间',
    search: {
      hidden: true
    },
    form: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetime'
      }
    }
  },
  {
    field: 'remark',
    label: '备注',
    search: {
      hidden: true
    },
    form: {
      component: 'Input',
      componentProps: {
        type: 'textarea',
        rows: 4
      },
      colProps: {
        span: 24
      }
    }
  },
  {
    field: 'action',
    width: '126px',
    label: t('tableDemo.action'),
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          return (
            <>
              <BaseButton type="primary" onClick={() => action(data.row, 'edit')}>
                {t('exampleDemo.edit')}
              </BaseButton>
              <BaseButton type="danger" onClick={() => delData(data.row)}>
                {t('exampleDemo.del')}
              </BaseButton>
            </>
          )
        }
      }
    }
  }
])
const { allSchemas } = useCrudSchemas(crudSchemas)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentRow = ref<UserTableData | null>(null)
const actionType = ref('')

const AddAction = () => {
  dialogTitle.value = t('exampleDemo.add')
  currentRow.value = null
  dialogVisible.value = true
  actionType.value = ''
}

const delLoading = ref(false)

const delData = async (row: UserTableData | null) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row
    ? [row.userId]
    : elTableExpose?.getSelectionRows().map((v: UserTableData) => v.userId) || []
  delLoading.value = true
  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
  })
}

const action = (row: UserTableData, type: string) => {
  dialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.detail')
  actionType.value = type
  currentRow.value = row
  dialogVisible.value = true
}

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    const res = await saveTableApi(formData)
      .catch(() => {})
      .finally(() => {
        saveLoading.value = false
      })
    if (res) {
      dialogVisible.value = false
      currentPage.value = 1
      getList()
    }
  }
}
</script>

<template>
  <ContentWrap title="用户管理" message="用于修改整个系统登陆人员信息" style="margin-bottom: 10px">
    <Search
      :schema="allSchemas.searchSchema"
      @search="setSearchParams"
      @reset="setSearchParams"
      showExpand
      :expand="false"
    />
  </ContentWrap>
  <ContentWrap>
    <Table
      height="calc(100vh - 400px)"
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="allSchemas.tableColumns"
      :data="dataList"
      :loading="loading"
      exportFileName="用户管理"
      :exportData="dataList"
      :pagination="{
        total: total,
        small: true
      }"
      showAction
      @register="tableRegister"
      @refresh="refresh"
    >
      <template #toolbar>
        <BaseButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</BaseButton>
        <BaseButton type="danger" @click="delData(null)" :loading="delLoading">
          {{ t('exampleDemo.del') }}
        </BaseButton>
      </template>
    </Table>
  </ContentWrap>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <Write
      v-if="actionType !== 'detail'"
      ref="writeRef"
      :form-schema="allSchemas.formSchema"
      :current-row="currentRow"
    />

    <template #footer>
      <BaseButton
        v-if="actionType !== 'detail'"
        type="primary"
        :loading="saveLoading"
        @click="save"
      >
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
