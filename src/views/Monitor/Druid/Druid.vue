<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { ElAutocomplete } from 'element-plus'
interface RestaurantItem {
  value: string
}

const state1 = ref('')

const restaurants = ref<RestaurantItem[]>([])
const querySearch = (queryString: string, cb: any) => {
  const results = queryString
    ? restaurants.value.filter(createFilter(queryString))
    : restaurants.value
  console.log(results)
  cb(results)
}
const createFilter = (queryString: string) => {
  return (restaurant: RestaurantItem) => {
    return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
  }
}
const loadAll = () => {
  return [
    { value: 'vue' },
    { value: 'element' },
    { value: 'cooking' },
    { value: 'mint-ui' },
    { value: 'vuex' },
    { value: 'vue-router' },
    { value: 'babel' }
  ]
}

const handleSelect = (item: RestaurantItem) => {
  console.log(item)
}

onMounted(() => {
  restaurants.value = loadAll()
})
</script>
<template>
  <el-autocomplete
    style="width: 1000px"
    v-model="state1"
    :fetch-suggestions="querySearch"
    clearable
    class="inline-input"
    placeholder="Please Input"
    @select="handleSelect"
  />
</template>
<style scoped></style>
