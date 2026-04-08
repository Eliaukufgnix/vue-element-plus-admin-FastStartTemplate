<script setup lang="ts">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch } from 'vue'
import { RoleTableData } from '@/api/system/role/types'
//import { useValidator } from '@/hooks/web/useValidator'

//const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<Nullable<RoleTableData>>,
    default: () => null
  },
  formSchema: {
    type: Array as PropType<FormSchema[]>,
    default: () => [
      {
        field: 'status',
        label: '状态',
        component: 'Select',
        componentProps: {
          options: [
            {
              label: '停用',
              value: 0
            },
            {
              label: '启用',
              value: 1
            }
          ]
        }
      }
    ]
  }
})

const rules = reactive({})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose } = formMethods

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    return await getFormData()
  }
}

watch(
  () => props.currentRow,
  (currentRow) => {
    if (!currentRow) return
    setValues(currentRow)
  },
  {
    deep: true,
    immediate: true
  }
)

defineExpose({
  submit
})
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="formSchema" />
</template>
