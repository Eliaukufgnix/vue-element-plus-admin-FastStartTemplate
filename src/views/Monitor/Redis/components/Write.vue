<script setup lang="tsx">
import { reactive } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { PropType } from 'vue'

defineOptions({
  name: 'RedisWrite'
})

const props = defineProps({
  currentRow: {
    type: Object as PropType<Recordable>,
    default: () => null
  }
})

const formSchema = reactive<FormSchema[]>([
  {
    field: 'key',
    label: '键名',
    component: 'Input',
    componentProps: {
      disabled: !!props.currentRow
    }
  },
  {
    field: 'type',
    label: '数据类型',
    component: 'Select',
    componentProps: {
      disabled: !!props.currentRow,
      options: [
        { label: '字符串', value: 'string' },
        { label: '列表', value: 'list' },
        { label: '集合', value: 'set' },
        { label: '有序集合', value: 'zset' },
        { label: '哈希', value: 'hash' }
      ]
    }
  },
  {
    field: 'value',
    label: '值',
    component: 'Input',
    componentProps: {
      type: 'textarea',
      rows: 6
    }
  },
  {
    field: 'ttl',
    label: 'TTL(秒)',
    component: 'InputNumber',
    componentProps: {
      min: -1,
      placeholder: '-1表示永不过期'
    }
  }
])
</script>

<template>
  <Form :schema="formSchema" :initial-params="currentRow" />
</template>
