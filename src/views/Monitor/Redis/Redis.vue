<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Dialog } from '@/components/Dialog'
import { Table, TableColumn } from '@/components/Table'
import { useI18n } from '@/hooks/web/useI18n'
import { ref, reactive, unref } from 'vue'
import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import {
  getRedisInfoApi,
  getRedisStatusApi,
  getRedisKeysApi,
  deleteRedisKeyApi,
  deleteRedisKeysApi
} from '@/api/system/redis'
import { BaseButton } from '@/components/Button'
import { ElTag, ElMessage, ElMessageBox } from 'element-plus'

defineOptions({
  name: 'Redis'
})

const { t } = useI18n()

const redisInfo = ref<Recordable>({})
const redisStatus = ref<'online' | 'offline' | 'error'>('offline')
const infoLoading = ref(false)

const fetchRedisInfo = async () => {
  infoLoading.value = true
  try {
    const statusRes = await getRedisStatusApi()
    redisStatus.value = statusRes.data.status as 'online' | 'offline' | 'error'
    if (statusRes.data.status === 'online') {
      const infoRes = await getRedisInfoApi()
      redisInfo.value = infoRes.data || {}
    }
  } catch (error) {
    redisStatus.value = 'error'
  } finally {
    infoLoading.value = false
  }
}

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

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}天 ${hours}小时`
  if (hours > 0) return `${hours}小时 ${minutes}分钟`
  return `${minutes}分钟`
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'online':
      return 'success'
    case 'offline':
      return 'warning'
    case 'error':
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'online':
      return '已连接'
    case 'offline':
      return '未连接'
    case 'error':
      return '连接错误'
    default:
      return status
  }
}

fetchRedisInfo()
</script>

<template>
  <div>
    <ContentWrap title="Redis缓存监控" style="margin-bottom: 10px">
      <div class="status-header">
        <ElTag :type="getStatusType(redisStatus)" size="large">
          {{ getStatusText(redisStatus) }}
        </ElTag>
        <BaseButton
          type="primary"
          :loading="infoLoading"
          @click="fetchRedisInfo"
          style="margin-left: 10px"
        >
          刷新状态
        </BaseButton>
      </div>
      <div v-if="redisStatus === 'online'" class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon version-icon">V</div>
          <div class="stat-info">
            <div class="stat-value">{{ redisInfo.version || '-' }}</div>
            <div class="stat-label">版本</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon uptime-icon">↑</div>
          <div class="stat-info">
            <div class="stat-value">{{ formatUptime(redisInfo.uptime || 0) }}</div>
            <div class="stat-label">运行时间</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon memory-icon">M</div>
          <div class="stat-info">
            <div class="stat-value">{{
              redisInfo.memory?.usedMemoryHuman || formatBytes(redisInfo.memory?.usedMemory || 0)
            }}</div>
            <div class="stat-label">内存使用</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon keys-icon">K</div>
          <div class="stat-info">
            <div class="stat-value">{{ redisInfo.dbSize || 0 }}</div>
            <div class="stat-label">键数量</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon clients-icon">C</div>
          <div class="stat-info">
            <div class="stat-value">{{ redisInfo.connectedClients || 0 }}</div>
            <div class="stat-label">客户端连接</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon hitrate-icon">%</div>
          <div class="stat-info">
            <div class="stat-value">{{ redisInfo.stats?.keyspaceHitRate || '0%' }}</div>
            <div class="stat-label">命中率</div>
          </div>
        </div>
      </div>
    </ContentWrap>

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
.status-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.stats-cards {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 140px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  color: #fff;
}

.stat-card:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-card:nth-child(5) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-card:nth-child(6) {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #333;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  margin-right: 12px;
}

.stat-card:nth-child(6) .stat-icon {
  background: rgba(0, 0, 0, 0.1);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 4px;
}

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
</style>
