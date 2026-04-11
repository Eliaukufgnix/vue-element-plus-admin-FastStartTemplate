<script setup lang="tsx">
import { Form, FormSchema, FormSetProps } from '@/components/Form'
import { PropType, computed, unref, ref, watch, onMounted } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { useForm } from '@/hooks/web/useForm'
import { findIndex } from '@/utils'
import { cloneDeep, set } from 'lodash-es'
import { initModel } from '@/components/Form/src/helper'
import ActionButton from './components/ActionButton.vue'
import { SearchProps } from './types'
import { FormItemProp } from 'element-plus'
import { isObject, isEmptyVal } from '@/utils/is'

const props = defineProps({
  // 生成Form的布局结构数组
  schema: {
    type: Array as PropType<FormSchema[]>,
    default: () => []
  },
  // 是否需要栅格布局
  isCol: propTypes.bool.def(false),
  // 表单label宽度
  labelWidth: propTypes.oneOfType([String, Number]).def('auto'),
  // 操作按钮风格位置
  layout: propTypes.string.validate((v: string) => ['inline', 'bottom'].includes(v)).def('inline'),
  // 底部按钮的对齐方式
  buttonPosition: propTypes.string
    .validate((v: string) => ['left', 'center', 'right'].includes(v))
    .def('center'),
  showSearch: propTypes.bool.def(true),
  showReset: propTypes.bool.def(true),
  // 是否显示伸缩
  showExpand: propTypes.bool.def(false),
  // 默认是否展开（false表示默认折叠）
  expand: propTypes.bool.def(true),
  // 伸缩的界限字段
  expandField: propTypes.string.def(''),
  // 默认显示前N个查询字段，默认为4（一行）
  showFirstN: propTypes.number.def(4),
  inline: propTypes.bool.def(true),
  // 是否去除空值项
  removeNoValueItem: propTypes.bool.def(true),
  model: {
    type: Object as PropType<Recordable>,
    default: () => ({})
  },
  searchLoading: propTypes.bool.def(false),
  resetLoading: propTypes.bool.def(false)
})

const emit = defineEmits(['search', 'reset', 'register', 'validate'])

const visible = ref(props.expand)

// 表单数据
const formModel = ref<Recordable>(props.model)

const newSchema = computed(() => {
  const propsComputed = unref(getProps)
  let schema: FormSchema[] = cloneDeep(propsComputed.schema)

  // 计算可显示的字段数量（排除action按钮和hidden字段）
  const visibleCount = schema.filter((v) => v.field !== 'action' && v.hidden !== true).length

  // 只有当showExpand为true、且字段数大于showFirstN时才需要展开按钮
  const needExpand = propsComputed.showExpand && visibleCount > propsComputed.showFirstN

  // 只有当showExpand为true、visible为false（折叠）、且字段数大于showFirstN时才折叠
  if (propsComputed.showExpand && !unref(visible) && visibleCount > propsComputed.showFirstN) {
    let shownCount = 0
    schema.map((v) => {
      // 跳过action按钮
      if (v.field === 'action') {
        return v
      }
      // 如果当前字段原本是隐藏的，保持隐藏
      if (v.hidden === true) {
        return v
      }
      shownCount++
      // 超过showFirstN个就隐藏
      if (shownCount > propsComputed.showFirstN) {
        v.hidden = true
      }
      return v
    })
  }

  if (propsComputed.layout === 'inline') {
    schema = schema.concat([
      {
        field: 'action',
        formItemProps: {
          labelWidth: '0px',
          slots: {
            default: () => {
              return (
                <div>
                  <ActionButton
                    showSearch={propsComputed.showSearch}
                    showReset={propsComputed.showReset}
                    showExpand={needExpand}
                    searchLoading={propsComputed.searchLoading}
                    resetLoading={propsComputed.resetLoading}
                    visible={visible.value}
                    onExpand={setVisible}
                    onReset={reset}
                    onSearch={search}
                  />
                </div>
              )
            },
            label: () => {
              return <span>&nbsp;</span>
            }
          }
        }
      }
    ])
  }
  return schema
})

const { formRegister, formMethods } = useForm()
const { getElFormExpose, getFormData, getFormExpose } = formMethods

// useSearch传入的props
const outsideProps = ref<SearchProps>({})

const mergeProps = ref<SearchProps>({})

const getProps = computed(() => {
  const propsObj = { ...props }
  Object.assign(propsObj, unref(mergeProps))
  return propsObj
})

const setProps = (props: SearchProps = {}) => {
  mergeProps.value = Object.assign(unref(mergeProps), props)
  // @ts-ignore
  outsideProps.value = props
}

const schemaRef = ref<FormSchema[]>([])

// 监听表单结构化数组，重新生成formModel
watch(
  () => unref(newSchema),
  async (schema = []) => {
    formModel.value = initModel(schema, unref(formModel))
    schemaRef.value = schema
  },
  {
    immediate: true,
    deep: true
  }
)

const filterModel = async () => {
  const model = await getFormData()
  if (unref(getProps).removeNoValueItem) {
    // 使用reduce过滤空值，并返回一个新对象
    return Object.keys(model).reduce((prev, next) => {
      const value = model[next]
      if (!isEmptyVal(value)) {
        if (isObject(value)) {
          if (Object.keys(value).length > 0) {
            prev[next] = value
          }
        } else {
          prev[next] = value
        }
      }
      return prev
    }, {})
  }
  return model
}

const search = async () => {
  const elFormExpose = await getElFormExpose()
  await elFormExpose?.validate(async (isValid) => {
    if (isValid) {
      const model = await filterModel()
      emit('search', model)
    }
  })
}

const reset = async () => {
  const elFormExpose = await getElFormExpose()
  elFormExpose?.resetFields()
  const model = await filterModel()
  emit('reset', model)
}

const bottomButtonStyle = computed(() => {
  return {
    textAlign: unref(getProps).buttonPosition as unknown as 'left' | 'center' | 'right'
  }
})

const setVisible = async () => {
  visible.value = !unref(visible)
}

const setSchema = (schemaProps: FormSetProps[]) => {
  const { schema } = unref(getProps)
  for (const v of schema) {
    for (const item of schemaProps) {
      if (v.field === item.field) {
        set(v, item.path, item.value)
      }
    }
  }
}

// 对表单赋值
const setValues = async (data: Recordable = {}) => {
  formModel.value = Object.assign(props.model, unref(formModel), data)
  const formExpose = await getFormExpose()
  formExpose?.setValues(data)
}

const delSchema = (field: string) => {
  const { schema } = unref(getProps)

  const index = findIndex(schema, (v: FormSchema) => v.field === field)
  if (index > -1) {
    schema.splice(index, 1)
  }
}

const addSchema = (formSchema: FormSchema, index?: number) => {
  const { schema } = unref(getProps)
  if (index !== void 0) {
    schema.splice(index, 0, formSchema)
    return
  }
  schema.push(formSchema)
}

const defaultExpose = {
  getElFormExpose,
  setProps,
  setSchema,
  setValues,
  delSchema,
  addSchema
}

onMounted(() => {
  emit('register', defaultExpose)
})

defineExpose(defaultExpose)

const onFormValidate = (prop: FormItemProp, isValid: boolean, message: string) => {
  emit('validate', prop, isValid, message)
}
</script>

<template>
  <Form
    :model="formModel"
    :is-custom="false"
    :label-width="getProps.labelWidth"
    hide-required-asterisk
    :inline="getProps.inline"
    :is-col="getProps.isCol"
    :schema="schemaRef"
    @register="formRegister"
    @validate="onFormValidate"
  />

  <template v-if="layout === 'bottom'">
    <div :style="bottomButtonStyle">
      <ActionButton
        :show-reset="getProps.showReset"
        :show-search="getProps.showSearch"
        :show-expand="getProps.showExpand"
        :search-loading="getProps.searchLoading"
        :reset-loading="getProps.resetLoading"
        @expand="setVisible"
        @reset="reset"
        @search="search"
      />
    </div>
  </template>
</template>
