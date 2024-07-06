<script lang="ts" setup>
import { reactive } from 'vue'
import {
  ElAutocomplete,
  ElButton,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn
} from 'element-plus'
import { getProductByTypeApi } from '@/api/product/goods'

interface TableRow {
  id: string
  productName: string
  productModel: string
  productType: string
  price: string
  quantity: number
}

const productTypes = [
  'CPU',
  '主板',
  '显卡',
  '内存',
  '固态硬盘',
  '机械硬盘',
  '散热器',
  '机箱',
  '风扇',
  '显示器',
  '键盘',
  '鼠标',
  '音响',
  '耳机'
]

const majorComponents = ['CPU', '主板', '显卡', '内存', '固态硬盘', '机械硬盘', '散热器', '机箱']

const tableData = reactive<TableRow[]>([
  {
    id: '',
    productName: '',
    productModel: '',
    productType: '',
    price: '',
    quantity: 0
  }
])

const editState = reactive<{ editing: boolean; backup: TableRow | null }[]>([
  {
    editing: true,
    backup: null
  }
])

interface RestaurantItem {
  value: string
  price: string
}

// Store suggestions for each row separately
const productSuggestions = reactive<{ [key: number]: RestaurantItem[] }>({})

const querySearch = (index: number, queryString: string, cb: any) => {
  const results = queryString
    ? productSuggestions[index]?.filter(createFilter(queryString)) || []
    : productSuggestions[index] || []
  cb(results)
}

const createFilter = (queryString: string) => {
  return (product: RestaurantItem) => {
    return product.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
  }
}

const fetchSuggestionsForType = async (type: string) => {
  if (type) {
    const response = await getProductByTypeApi({ type: type })
    const products = response.data
    console.log(products)
    return products.map((product: any) => {
      console.log({
        value: product.name,
        price: product.price
      })
      return {
        value: product.name,
        price: product.price
      }
    })
  }
  return []
}

const initializeRows = async (rowCount: number) => {
  tableData.splice(0, tableData.length)
  editState.splice(0, editState.length)
  // productSuggestions.splice(0, Object.keys(productSuggestions).length) // clear productSuggestions

  let typesToUse: string[]
  if (rowCount === 8) {
    typesToUse = majorComponents
  } else if (rowCount === 14) {
    typesToUse = productTypes
  } else {
    typesToUse = []
  }
  const fetchPromises: Promise<any>[] = []
  for (let i = 0; i < rowCount; i++) {
    const type = typesToUse[i] || ''
    tableData.push({
      id: '',
      productName: '',
      productModel: '',
      productType: type,
      price: '',
      quantity: 0
    })
    editState.push({
      editing: true,
      backup: null
    })
    //productSuggestions[i] = await fetchSuggestionsForType(type) // initialize suggestions for each row
    fetchPromises.push(fetchSuggestionsForType(type))
    // Wait for all promises to resolve
    const suggestions = await Promise.all(fetchPromises)

    // Assign suggestions to corresponding rows
    suggestions.forEach((suggestion, index) => {
      productSuggestions[index] = suggestion
    })
  }

  if (rowCount === 1) {
    tableData.push({
      id: '',
      productName: '',
      productModel: '',
      productType: '',
      price: '',
      quantity: 0
    })
    editState.push({
      editing: true,
      backup: null
    })
    //productSuggestions[1] = [] // initialize empty suggestions for each row
    fetchPromises.push(fetchSuggestionsForType(''))
  }
}

const addRow = async () => {
  const newIndex = tableData.length
  tableData.push({
    id: '',
    productName: '',
    productModel: '',
    productType: '',
    price: '',
    quantity: 0
  })
  editState.push({
    editing: true,
    backup: null
  })
  productSuggestions[newIndex] = [] // initialize empty suggestions for new row
}

const startEdit = (index: number) => {
  const row = tableData[index]
  editState[index] = {
    editing: true,
    backup: { ...row }
  }
}

const saveEdit = (index: number) => {
  editState[index].editing = false
  editState[index].backup = null
  ElMessage({
    message: '保存成功',
    type: 'success'
  })
}

const cancelEdit = (index: number) => {
  const backup = editState[index].backup
  if (backup) {
    tableData[index] = { ...backup }
    editState[index].editing = false
    editState[index].backup = null
  }
}

const deleteRow = (index: number) => {
  ElMessageBox.confirm('此操作将永久删除该条记录, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      tableData.splice(index, 1)
      editState.splice(index, 1)
      delete productSuggestions[index]
      ElMessage({
        type: 'success',
        message: '删除成功!'
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除'
      })
    })
}

const getAllData = () => {
  const hasUnsavedRows = editState.some((state) => state.editing)
  if (hasUnsavedRows) {
    ElMessage({
      message: '请先保存数据后再执行获取操作',
      type: 'warning'
    })
    return
  }
  const data = tableData.filter((row) => row.price !== '')
  ElMessage({
    message: data,
    type: 'success'
  })
}

const saveAllRows = () => {
  editState.forEach((state, index) => {
    if (state.editing) {
      saveEdit(index)
    }
  })
}

const handleTypeChange = async (index: number) => {
  const type = tableData[index].productType
  tableData[index].productName = ''
  productSuggestions[index] = await fetchSuggestionsForType(type)
}

const handleAutocompleteSelect = (index: number, selectedValue: any) => {
  console.log(selectedValue)
  selectedValue = selectedValue.value
  const product = productSuggestions[index]?.find((item: any) => item.value === selectedValue)
  if (product) {
    tableData[index].price = product.price // 设置选择的产品的价格
  }
}
</script>

<template>
  <div>
    <el-button @click="initializeRows(1)" type="primary">初始化</el-button>
    <el-button @click="initializeRows(14)" type="primary" style="margin-left: 10px"
      >手工录入14件</el-button
    >
    <el-button @click="initializeRows(8)" type="primary" style="margin-left: 10px"
      >手工录入8大件</el-button
    >
    <el-button @click="getAllData" type="primary" style="margin-left: 10px">获取全部数据</el-button>
    <el-button @click="saveAllRows" type="primary" style="margin-left: 10px"
      >保存全部行的数据</el-button
    >
    <el-table :data="tableData" style="width: 100%; margin-top: 20px" border>
      <el-table-column prop="id" label="ID" width="100">
        <template #default="{ row, $index }">
          <div v-if="!editState[$index]?.editing">{{ row.id }}</div>
          <el-input v-else v-model="row.id" placeholder="ID" />
        </template>
      </el-table-column>
      <el-table-column prop="productType" label="产品类型" width="150">
        <template #default="{ row, $index }">
          <div v-if="!editState[$index]?.editing">{{ row.productType }}</div>
          <el-select
            v-else
            v-model="row.productType"
            placeholder="请选择"
            @change="() => handleTypeChange($index)"
          >
            <el-option v-for="type in productTypes" :key="type" :label="type" :value="type" />
            <el-option label="其他" value="其他" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="productName" label="产品名称" width="400">
        <template #default="{ row, $index }">
          <div v-if="!editState[$index]?.editing">{{ row.productName }}</div>
          <el-autocomplete
            v-else
            v-model="row.productName"
            :fetch-suggestions="(queryString, cb) => querySearch($index, queryString, cb)"
            placeholder="请输入产品名称"
            :popper-append-to-body="false"
            @select="(value) => handleAutocompleteSelect($index, value)"
            clearable
            style="width: 100%"
          />
        </template>
      </el-table-column>
      <el-table-column prop="productModel" label="产品型号">
        <template #default="{ row, $index }">
          <div v-if="!editState[$index]?.editing">{{ row.productModel }}</div>
          <el-input v-else v-model="row.productModel" placeholder="产品型号" />
        </template>
      </el-table-column>
      <el-table-column prop="price" label="单价">
        <template #default="{ row, $index }">
          <div v-if="!editState[$index]?.editing">{{ row.price }}元</div>
          <el-input
            v-else
            v-model="row.price"
            placeholder="价格，单位：元"
            type="number"
            step="0.01"
          />
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="数量">
        <template #default="{ row, $index }">
          <div v-if="!editState[$index]?.editing">{{ row.quantity }}</div>
          <el-input-number v-else v-model="row.quantity" :min="1" />
        </template>
      </el-table-column>
      <el-table-column prop="countPrice" label="总价">
        <template #default="{ row }"> {{ row.price * row.quantity }}元 </template>
      </el-table-column>
      <el-table-column label="操作" width="230">
        <template #default="{ $index }">
          <div v-if="!editState[$index]?.editing">
            <el-button @click="startEdit($index)" type="primary">编辑</el-button>
            <el-button @click="deleteRow($index)" type="danger">删除</el-button>
          </div>
          <div v-else>
            <el-button @click="saveEdit($index)" type="success">保存</el-button>
            <el-button @click="cancelEdit($index)">取消</el-button>
            <el-button @click="deleteRow($index)" type="danger">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-button @click="addRow" type="primary" style="margin-top: 20px">添加新行</el-button>
  </div>
</template>
