<script lang="tsx">
import { defineComponent, unref, computed, PropType, ref } from 'vue'
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ComponentSize } from 'element-plus'
import { Icon } from '@/components/Icon'
import { useI18n } from '@/hooks/web/useI18n'
import { useAppStore } from '@/store/modules/app'
import { TableColumn } from '../types'
import { exportToExcel } from '@/utils/export'
import ColumnSetting from './ColumnSetting.vue'

export default defineComponent({
  name: 'TableActions',
  components: {
    ColumnSetting
  },
  props: {
    columns: {
      type: Array as PropType<TableColumn[]>,
      default: () => []
    },
    exportData: {
      type: Array as PropType<Recordable[]>,
      default: () => []
    },
    exportFileName: {
      type: String,
      default: '导出数据'
    }
  },
  emits: ['refresh', 'changSize', 'confirm'],
  setup(props, { emit }) {
    const appStore = useAppStore()
    const { t } = useI18n()
    const sizeMap = computed(() => appStore.sizeMap)
    const showSetting = ref(false)

    const refresh = () => {
      emit('refresh')
    }

    const changSize = (size: ComponentSize) => {
      emit('changSize', size)
    }

    const confirm = (columns: TableColumn[]) => {
      emit('confirm', columns)
    }

    const showColumnSetting = () => {
      showSetting.value = true
    }

    const handleExport = () => {
      if (!props.exportData || props.exportData.length === 0) {
        return
      }
      const exportColumns = props.columns
        .filter(
          (col: TableColumn) =>
            col.field && col.label && col.field !== 'selection' && col.field !== 'action'
        )
        .map((col: TableColumn) => ({
          field: col.field as string,
          label: col.label as string
        }))
      exportToExcel(props.exportData, exportColumns, props.exportFileName)
    }

    return () => (
      <>
        <div class="text-right h-28px flex items-center justify-end">
          <div title="刷新" class="w-30px h-20px flex items-center justify-end" onClick={refresh}>
            <Icon
              icon="ant-design:sync-outlined"
              class="cursor-pointer"
              hover-color="var(--el-color-primary)"
            />
          </div>

          <ElDropdown trigger="click" onCommand={changSize}>
            {{
              default: () => {
                return (
                  <div title="尺寸" class="w-30px h-20px flex items-center justify-end">
                    <Icon
                      icon="ant-design:column-height-outlined"
                      class="cursor-pointer"
                      hover-color="var(--el-color-primary)"
                    />
                  </div>
                )
              },
              dropdown: () => {
                return (
                  <ElDropdownMenu>
                    {{
                      default: () => {
                        return unref(sizeMap).map((v) => {
                          return (
                            <ElDropdownItem key={v} command={v}>
                              {t(`size.${v}`)}
                            </ElDropdownItem>
                          )
                        })
                      }
                    }}
                  </ElDropdownMenu>
                )
              }
            }}
          </ElDropdown>

          <div
            title="导出"
            class="w-30px h-20px flex items-center justify-end"
            onClick={handleExport}
          >
            <Icon
              icon="ant-design:export-outlined"
              class="cursor-pointer"
              hover-color="var(--el-color-primary)"
            />
          </div>

          <div
            title="列设置"
            class="w-30px h-20px flex items-center justify-end"
            onClick={showColumnSetting}
          >
            <Icon
              icon="ant-design:setting-outlined"
              class="cursor-pointer"
              hover-color="var(--el-color-primary)"
            />
          </div>
        </div>
        <ColumnSetting v-model={showSetting.value} columns={props.columns} onConfirm={confirm} />
      </>
    )
  }
})
</script>
