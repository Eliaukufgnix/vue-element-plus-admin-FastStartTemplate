import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

export interface ExportColumn {
  field: string
  label: string
}

export const exportToExcel = (data: Recordable[], columns: ExportColumn[], fileName: string) => {
  if (!data || data.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }

  const filterColumns = columns.filter(
    (col) => col.field && col.label && col.field !== 'selection' && col.field !== 'action'
  )

  const header = filterColumns.map((col) => col.label)
  const fieldKeys = filterColumns.map((col) => col.field)

  const exportData = data.map((row) => {
    return fieldKeys.map((key) => {
      const value = row[key]
      if (value === null || value === undefined) {
        return ''
      }
      if (typeof value === 'boolean') {
        return value ? '是' : '否'
      }
      return String(value)
    })
  })

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...exportData])

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  const timeStr = dayjs().format('YYYY-MM-DD_HH-mm-ss')
  const finalFileName = `${fileName}_${timeStr}.xlsx`

  XLSX.writeFile(workbook, finalFileName)
}
