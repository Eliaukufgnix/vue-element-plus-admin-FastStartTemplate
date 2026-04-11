<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Dialog } from '@/components/Dialog'
import { Table, TableColumn } from '@/components/Table'
import { useI18n } from '@/hooks/web/useI18n'
import { ref, reactive, unref } from 'vue'
import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { getRedisKeysApi, deleteRedisKeyApi, deleteRedisKeysApi } from '@/api/system/redis'
import { BaseButton } from '@/components/Button'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({
  name: 'CacheList'
})

const { t } = useI18n()

const keys = ref<string[]>([])
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getRedisKeysApi({
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
    const res = await deleteRedisKeysApi(unref(keys))
    return !!res
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, refresh } = tableMethods

const searchLoading = ref(false)
const searchParams = ref<Recordable>({})
const setSearchParams = async (params: any) => {
  searchLoading.value = true
  searchParams.value = params
  await getList().finally(() => {
    searchLoading.value = false
  })
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
    field: 'key',
    label: '键名',
    search: {
      component: 'Input'
    }
  },
  {
    field: 'type',
    label: '数据类型',
    formatter: (_: Recordable, __: TableColumn, cellValue: string) => {
      const typeMap: Recordable = {
        string: '字符串',
        list: '列表',
        set: '集合',
        zset: '有序集合',
        hash: '哈希',
        stream: '流'
      }
      return typeMap[cellValue] || cellValue
    },
    search: {
      component: 'Select',
      componentProps: {
        style: {
          width: '100%'
        },
        options: [
          { label: '字符串', value: 'string' },
          { label: '列表', value: 'list' },
          { label: '集合', value: 'set' },
          { label: '有序集合', value: 'zset' },
          { label: '哈希', value: 'hash' },
          { label: '流', value: 'stream' }
        ]
      }
    }
  },
  {
    field: 'ttl',
    label: 'TTL(秒)',
    formatter: (_: Recordable, __: TableColumn, cellValue: number) => {
      if (cellValue === -1) return '永不过期'
      if (cellValue === -2) return '已过期'
      return cellValue.toString()
    }
  },
  {
    field: 'value',
    label: '值',
    search: {
      hidden: true
    }
  },
  {
    field: 'action',
    width: '180px',
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
              <BaseButton type="primary" onClick={() => viewValue(data.row)}>
                查看
              </BaseButton>
              <BaseButton type="danger" onClick={() => delKey(data.row)}>
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
const currentKey = ref<string>('')
const currentValue = ref<string>('')
const currentType = ref<string>('')

const viewValue = (row: { key: string; type: string; value: string }) => {
  dialogTitle.value = '查看缓存值'
  currentKey.value = row.key
  currentValue.value = row.value
  currentType.value = row.type
  dialogVisible.value = true
}

const delKey = async (row: { key: string }) => {
  try {
    await ElMessageBox.confirm('确定要删除该缓存吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteRedisKeyApi(row.key)
    ElMessage.success('删除成功')
    getList()
  } catch {
    // 取消操作
  }
}

const handleSelectionChange = (rows: { key: string }[]) => {
  keys.value = rows.map((row) => row.key)
}

const batchDeleteLoading = ref(false)

const batchDelete = async () => {
  if (keys.value.length === 0) {
    ElMessage.warning('请先选择要删除的缓存')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${keys.value.length} 个缓存吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    batchDeleteLoading.value = true
    await deleteRedisKeysApi(keys.value)
    ElMessage.success('删除成功')
    getList()
  } catch {
    // 取消操作
  } finally {
    batchDeleteLoading.value = false
  }
}
</script>

<template>
  <div>
    <ContentWrap>
      <Search
        :schema="allSchemas.searchSchema"
        @search="setSearchParams"
        @reset="setSearchParams"
        showExpand
        :expand="false"
        :searchLoading="searchLoading"
      />
    </ContentWrap>

    <ContentWrap style="margin-top: 10px">
      <Table
        height="calc(100vh - 380px)"
        v-model:pageSize="pageSize"
        v-model:currentPage="currentPage"
        :columns="allSchemas.tableColumns"
        :data="dataList"
        :loading="loading"
        :pagination="{
          total: total,
          small: true
        }"
        showAction
        @register="tableRegister"
        @refresh="refresh"
        @selection-change="handleSelectionChange"
      >
        <template #toolbar>
          <BaseButton type="danger" @click="batchDelete" :loading="batchDeleteLoading">
            批量删除
          </BaseButton>
        </template>
      </Table>
    </ContentWrap>

    <Dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <div class="key-value-view">
        <div class="view-item">
          <span class="view-label">键名:</span>
          <span class="view-value key">{{ currentKey }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">数据类型:</span>
          <span class="view-value">{{ currentType }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">值:</span>
          <el-input v-model="currentValue" type="textarea" :rows="8" readonly class="value-input" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.key-value-view {
  padding: 10px;
}

.view-item {
  margin-bottom: 15px;
}

.view-item .view-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.view-item .view-value {
  font-size: 14px;
  color: #333;
}

.view-item .view-value.key {
  font-family: monospace;
  word-break: break-all;
}

.value-input {
  margin-top: 5px;
}

.value-input :deep(textarea) {
  font-family: monospace;
}
</style>
