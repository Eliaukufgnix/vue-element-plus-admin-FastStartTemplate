<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Dialog } from '@/components/Dialog'
import { Table, TableColumn } from '@/components/Table'
import { useI18n } from '@/hooks/web/useI18n'
import { ref, reactive, unref } from 'vue'
import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { getTableApi, deleteTableApi, saveTableApi } from '@/api/system/operlog'
import { BaseButton } from '@/components/Button'
import { OperLogTableData } from '@/api/system/operlog/types'
import Write from './components/Write.vue'

defineOptions({
  name: 'Operlog'
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
    field: 'operId',
    label: '操作日志ID',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'title',
    label: '模块标题',
    search: {
      component: 'Input'
    }
  },
  {
    field: 'businessType',
    label: '业务类型',
    search: {
      hidden: true
    }
  },
  {
    field: 'method',
    label: '方法名称',
    search: {
      hidden: true
    }
  },
  {
    field: 'requestMethod',
    label: '请求方式',
    search: {
      hidden: true
    }
  },
  {
    field: 'operatorType',
    label: '操作类别',
    search: {
      hidden: true
    }
  },
  {
    field: 'operName',
    label: '操作人员',
    search: {
      component: 'Input'
    }
  },
  {
    field: 'deptName',
    label: '部门名称',
    search: {
      hidden: true
    }
  },
  {
    field: 'operUrl',
    label: '请求地址',
    search: {
      hidden: true
    }
  },
  {
    field: 'operIp',
    label: '操作IP',
    search: {
      hidden: true
    }
  },
  {
    field: 'operLocation',
    label: '操作地点',
    search: {
      hidden: true
    }
  },
  {
    field: 'operParam',
    label: '请求参数',
    search: {
      hidden: true
    }
  },
  {
    field: 'jsonResult',
    label: '返回参数',
    search: {
      hidden: true
    }
  },
  {
    field: 'status',
    label: '状态',
    formatter: (_: Recordable, __: TableColumn, cellValue: number) => {
      return cellValue === 0 ? '正常' : '异常'
    },
    search: {
      component: 'Select',
      componentProps: {
        style: {
          width: '100%'
        },
        options: [
          { label: '正常', value: 0 },
          { label: '异常', value: 1 }
        ]
      }
    },
    form: {
      component: 'Select',
      componentProps: {
        options: [
          { label: '正常', value: 0 },
          { label: '异常', value: 1 }
        ]
      }
    }
  },
  {
    field: 'errorMsg',
    label: '错误消息',
    search: {
      hidden: true
    }
  },
  {
    field: 'costTime',
    label: '消耗时间',
    search: {
      hidden: true
    }
  }
])
const { allSchemas } = useCrudSchemas(crudSchemas)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentRow = ref<OperLogTableData | null>(null)
const actionType = ref('')

const AddAction = () => {
  dialogTitle.value = t('exampleDemo.add')
  currentRow.value = null
  dialogVisible.value = true
  actionType.value = ''
}

const delLoading = ref(false)

const delData = async (row: OperLogTableData | null) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row
    ? [row.operId]
    : elTableExpose?.getSelectionRows().map((v: OperLogTableData) => v.operId) || []
  delLoading.value = true
  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
  })
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
  <ContentWrap title="操作日志管理" style="margin-bottom: 10px">
    <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" />
  </ContentWrap>
  <ContentWrap>
    <Table
      height="calc(100vh - 440px)"
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="allSchemas.tableColumns"
      :data="dataList"
      :loading="loading"
      exportFileName="操作日志"
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
