<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { ref, computed } from 'vue'
import { getRedisInfoApi, getRedisStatusApi } from '@/api/system/redis'
import { BaseButton } from '@/components/Button'
import { ElTag } from 'element-plus'

defineOptions({
  name: 'Redis'
})

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

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

const commandStats = computed(() => {
  const stats = redisInfo.value?.stats?.commandStats || []
  return stats.slice(0, 10).map((item) => ({
    command: item.command,
    calls: item.calls,
    usec: item.usec
  }))
})

const memoryInfo = computed(() => {
  const memory = redisInfo.value?.memory || {}
  return [
    { key: '已用内存', value: memory.usedMemoryHuman || formatBytes(memory.usedMemory || 0) },
    { key: '内存碎片率', value: memory.memFragmentationRatio || '-' },
    { key: '最大内存', value: memory.maxMemoryHuman || '-' },
    { key: '内存分配器', value: memory.allocator || '-' },
    { key: 'RSS内存', value: memory.rssHuman || '-' }
  ]
})

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
            <div class="stat-label">Redis版本</div>
            <div class="stat-value">{{ redisInfo.version || '-' }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon mode-icon">M</div>
          <div class="stat-info">
            <div class="stat-label">运行模式</div>
            <div class="stat-value">{{ redisInfo.mode || '-' }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon port-icon">P</div>
          <div class="stat-info">
            <div class="stat-label">端口</div>
            <div class="stat-value">{{ redisInfo.tcpPort || '-' }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon clients-icon">C</div>
          <div class="stat-info">
            <div class="stat-label">客户端数</div>
            <div class="stat-value">{{ redisInfo.connectedClients || 0 }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon uptime-icon">↑</div>
          <div class="stat-info">
            <div class="stat-label">运行时间(天)</div>
            <div class="stat-value">{{ Math.floor((redisInfo.uptime || 0) / 86400) + '天' }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon memory-icon">M</div>
          <div class="stat-info">
            <div class="stat-label">使用内存</div>
            <div class="stat-value">{{
              redisInfo.memory?.usedMemoryHuman || formatBytes(redisInfo.memory?.usedMemory || 0)
            }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon cpu-icon">C</div>
          <div class="stat-info">
            <div class="stat-label">使用CPU</div>
            <div class="stat-value">{{ redisInfo.cpu?.usedCpuSys || '-' }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon memory-config-icon">M</div>
          <div class="stat-info">
            <div class="stat-label">内存配置</div>
            <div class="stat-value">{{ redisInfo.memory?.maxMemoryHuman || '-' }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon aof-icon">A</div>
          <div class="stat-info">
            <div class="stat-label">AOF是否开启</div>
            <div class="stat-value">{{ redisInfo.aofEnabled ? '是' : '否' }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rdb-icon">R</div>
          <div class="stat-info">
            <div class="stat-label">RDB是否成功</div>
            <div class="stat-value">{{
              redisInfo.persistence?.lastSaveStatus === 'ok' ? '是' : '否'
            }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon keys-icon">K</div>
          <div class="stat-info">
            <div class="stat-label">Key数量</div>
            <div class="stat-value">{{ redisInfo.dbSize || 0 }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon network-icon">N</div>
          <div class="stat-info">
            <div class="stat-label">网络入口/出口</div>
            <div class="stat-value">{{
              `${formatBytes(redisInfo.stats?.totalNetInputBytes || 0)}/${formatBytes(redisInfo.stats?.totalNetOutputBytes || 0)}`
            }}</div>
          </div>
        </div>
      </div>

      <!-- 命令统计和内存信息 -->
      <div v-if="redisStatus === 'online'" style="margin-top: 20px; display: flex; gap: 20px">
        <ContentWrap style="flex: 1">
          <template #title>
            <h3>命令统计</h3>
          </template>
          <div style="padding: 10px">
            <el-table :data="commandStats" style="width: 100%">
              <el-table-column prop="command" label="命令" width="100" />
              <el-table-column prop="calls" label="调用次数" />
              <el-table-column prop="usec" label="执行时间(微秒)" />
            </el-table>
          </div>
        </ContentWrap>
        <ContentWrap style="flex: 1">
          <template #title>
            <h3>内存信息</h3>
          </template>
          <div style="padding: 10px">
            <el-table :data="memoryInfo" style="width: 100%">
              <el-table-column prop="key" label="指标" width="120" />
              <el-table-column prop="value" label="值" />
            </el-table>
          </div>
        </ContentWrap>
      </div>
    </ContentWrap>
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
  gap: 8px;
  flex-wrap: wrap;
}

.stat-card {
  width: calc((100% - 200px) / 6);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  align-items: center;
  color: #fff;
  height: 70px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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

.stat-card:nth-child(7) {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: #fff;
}

.stat-card:nth-child(8) {
  background: linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%);
  color: #333;
}

.stat-card:nth-child(9) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #333;
}

.stat-card:nth-child(10) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #333;
}

.stat-card:nth-child(11) {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #333;
}

.stat-card:nth-child(12) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  margin-right: 10px;
}

.stat-card:nth-child(6) .stat-icon {
  background: rgba(0, 0, 0, 0.1);
}

.stat-card:nth-child(7) .stat-icon {
  background: rgba(255, 255, 255, 0.2);
}

.stat-card:nth-child(8) .stat-icon {
  background: rgba(0, 0, 0, 0.1);
}

.stat-card:nth-child(9) .stat-icon {
  background: rgba(0, 0, 0, 0.1);
}

.stat-card:nth-child(10) .stat-icon {
  background: rgba(0, 0, 0, 0.1);
}

.stat-card:nth-child(11) .stat-icon {
  background: rgba(0, 0, 0, 0.1);
}

.stat-card:nth-child(12) .stat-icon {
  background: rgba(255, 255, 255, 0.2);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  font-size: 14px;
  opacity: 0.85;
  margin-top: 2px;
}
</style>
