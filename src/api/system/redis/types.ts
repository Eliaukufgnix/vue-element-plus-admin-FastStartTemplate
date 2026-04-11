export interface RedisInfo {
  version: string
  os: string
  mode: string
  dbSize: number
  connectedClients: number
  connectedSlaves: number
  totalCommandsReceived: number
  uptime: number
  memory: RedisMemory
  persistence: RedisPersistence
  stats: RedisStats
}

export interface RedisMemory {
  usedMemory: number
  usedMemoryHuman: string
  usedMemoryRss: number
  usedMemoryRssHuman: string
  usedMemoryPeak: number
  usedMemoryPeakHuman: string
  memFragmentationRatio: number
  allocatorAllocated: number
  allocatorActive: number
  allocatorResident: number
}

export interface RedisPersistence {
  loading: boolean
  rdbChangesSinceLastSave: number
  lastSaveTime: number
  lastSaveStatus: string
}

export interface RedisStats {
  totalConnectionsReceived: number
  totalCommandsProcessed: number
  instantaneousOpsPerSec: number
  totalNetInputBytes: number
  totalNetOutputBytes: number
  keyspaceHits: number
  keyspaceMisses: number
  keyspaceHitRate: string
  latestForkUsec: number
}

export interface RedisKey {
  key: string
  type: string
  ttl: number
  value: string
  size: number
}

export interface RedisKeyList {
  list: RedisKey[]
  total: number
}

export type RedisStatus = 'online' | 'offline' | 'error'
