<script setup>
import { MapLocation, Plus, EditPen } from '@element-plus/icons-vue'

const props = defineProps({
  addresses: {
    type: Array,
    required: true
  },
  fromOrder: {
    type: Boolean,
    default: false
  },
  orderHallId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select', 'edit', 'addNew'])

/**
 * 格式化展位显示逻辑
 * Logic: 将展厅名称与展位号进行拼接，例如 "8.0" + "A01" -> "8.0A01"
 */
const formatBooth = (hallName, boothCode, displayVenue = '') => {
  let hall = hallName
  if (!hall && displayVenue) {
    const parts = displayVenue.split(' - ')
    hall = parts[parts.length - 1]
  }
  if (!hall || !boothCode) return boothCode || ''
  const cleanHall = hall.replace(/展厅/g, '').trim()
  return `${cleanHall}${boothCode}`
}

const handleSelect = (addr) => {
  emit('select', addr)
}

const handleEdit = (addr) => {
  emit('edit', addr)
}

const handleAddNew = () => {
  emit('addNew')
}
</script>

<template>
  <div class="p-3 animate-fade-in">
    <!-- 演示模式提醒 -->
    <div v-if="fromOrder" class="mb-3 px-3 py-2 bg-blue-50 text-blue-600/80 rounded block text-[13px] border border-blue-100">
      <span class="font-bold">演示模式</span>: 当前模拟从 [{{ orderHallId }}] 商品提单页跳转而来
    </div>

    <!-- 地址列表区 -->
    <div class="space-y-3 mb-6">
      <div 
        v-for="addr in addresses" 
        :key="addr.id"
        @click="handleSelect(addr)"
        class="bg-white rounded-[14px] p-3 shadow-sm border-[1.5px] transition-colors relative cursor-pointer active:bg-blue-50/30"
        :class="addr.isDefault ? 'border-blue-500' : 'border-transparent'"
      >
        <!-- 状态标签 -->
        <div v-if="addr.isDefault" class="absolute right-0 top-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-bl-[14px] rounded-tr-[12px] font-bold">
          当前使用
        </div>
        
        <div class="flex items-start">
           <div class="bg-blue-100 text-blue-600 rounded p-1.5 mr-3 shrink-0 mt-1">
              <el-icon><MapLocation /></el-icon>
           </div>
           <div class="flex-1 pr-8">
              <div class="text-[13px] text-gray-500 mb-1 leading-none">{{ addr.displayVenue }}</div>
              <div class="font-extrabold text-gray-900 text-[18px] mb-2 leading-none">
                展位：{{ formatBooth(addr.hallName, addr.boothCode || addr.displayBooth, addr.displayVenue) }}
              </div>
              <div class="text-[14px] text-gray-700 font-medium">
                {{ addr.contactName }} &nbsp; 
                <span class="text-gray-400 font-normal">
                  {{ addr.userPhone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }}
                </span>
              </div>
              <!-- 发票信息简览 -->
              <div v-if="addr.invoiceTitle" class="mt-2 bg-yellow-50/50 rounded flex items-center p-1.5 text-[12px] text-gray-500 w-fit max-w-full">
                <span class="bg-gray-200 text-gray-600 px-1 py-0.5 rounded mr-1 leading-none shrink-0">票</span>
                <span class="truncate block">{{ addr.invoiceTitle }}</span>
              </div>
           </div>
           <!-- 编辑入口 -->
           <div 
             @click.stop="handleEdit(addr)" 
             class="absolute right-3 bottom-3 text-gray-400 p-2 cursor-pointer active:bg-gray-100 rounded-full transition-colors flex items-center justify-center shrink-0"
           >
             <el-icon class="text-lg"><EditPen /></el-icon>
           </div>
        </div>
      </div>
    </div>

    <!-- 底部添加按钮区 (Logic: 满配时变灰禁止) -->
    <div class="mt-8 flex justify-center">
       <el-button 
         type="primary" 
         plain 
         size="large" 
         class="w-full max-w-[300px] font-bold rounded-full border-none h-[44px]"
         :class="addresses.length >= 3 
           ? '!bg-gray-100 !text-gray-400 !border-gray-200 cursor-not-allowed' 
           : '!border-blue-200 !text-blue-600'
         "
         :disabled="addresses.length >= 3"
         @click="handleAddNew"
       >
         <el-icon class="mr-1"><Plus /></el-icon>
         {{ addresses.length >= 3 ? '无法新增地址(3/3)' : '新增收餐地址' }}
       </el-button>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes fadeSlideUp {
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
