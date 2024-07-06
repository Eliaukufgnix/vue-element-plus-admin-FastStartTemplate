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
import { getUserTableApi, deleteUserTableApi, saveUserTableApi } from '@/api/system/user'
import { BaseButton } from '@/components/Button'
import { UserTableData } from '@/api/system/user/types'
import Write from './components/Write.vue'
import Detail from './components/Detail.vue'

defineOptions({
  name: 'User'
})

const { t } = useI18n()
const ids = ref<string[]>([])
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getUserTableApi({
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
    const res = await deleteUserTableApi(unref(ids))
    return !!res
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

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
    label: '用户ID'
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
    formatter: (_: Recordable, __: TableColumn, cellValue: string) => {
      return cellValue == '0' ? '男' : cellValue == '1' ? '女' : '未知'
    },
    search: {
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
    label: '最后登录IP'
  },
  {
    field: 'loginDate',
    label: '最后登录时间',
    form: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetime'
      }
    }
  },
  {
    field: 'createBy',
    label: '创建者'
  },
  {
    field: 'createTime',
    label: '创建时间',
    form: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetime'
      }
    }
  },
  {
    field: 'updateBy',
    label: '更新者'
  },
  {
    field: 'updateTime',
    label: '更新时间',
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
    table: {
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
    },
    search: {
      hidden: true
    }
  },
  {
    field: 'action',
    width: '260px',
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
              <BaseButton type="success" onClick={() => action(data.row, 'detail')}>
                {t('exampleDemo.detail')}
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

//TODO 这里的添加和更新用了同一个方法？
const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    const res = await saveUserTableApi(formData)
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
  <ContentWrap title="用户管理">
    <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" />
    <div class="mb-10px">
      <BaseButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</BaseButton>
      <BaseButton type="danger" @click="delData(null)" :loading="delLoading">
        {{ t('exampleDemo.del') }}
      </BaseButton>
    </div>
    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="allSchemas.tableColumns"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total: total
      }"
      @register="tableRegister"
    />
  </ContentWrap>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <Write
      v-if="actionType !== 'detail'"
      ref="writeRef"
      :form-schema="allSchemas.formSchema"
      :current-row="currentRow"
    />

    <Detail
      v-if="actionType === 'detail'"
      :detail-schema="allSchemas.detailSchema"
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
