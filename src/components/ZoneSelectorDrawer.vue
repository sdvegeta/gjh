<script setup>
import { ref, computed } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { mockZoneDict } from '../mock.js'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible', 'select-hall'])

// mockZoneDict 结构: [{ value: 'A_ZONE', label: 'A区', children: [ { value: '1F', label: '1F', children: [...] } ] }]
const areaList = mockZoneDict.map(z => ({ code: z.value, name: z.label }))

// 内部状态
const activeTabCode = ref(areaList.length > 0 ? areaList[0].code : 'A_ZONE')
const selectedFloorCode = ref('')

const currentZone = computed(() => {
  return mockZoneDict.find(z => z.value === activeTabCode.value) || { children: [] }
})

// 计算该区下的合法楼层
const currentFloors = computed(() => {
  return currentZone.value.children.map(f => ({ code: f.value, name: f.label }))
})

// 计算确定了区、层后，铺开展示的具体展厅
const currentHalls = computed(() => {
  if (!selectedFloorCode.value) return []
  const floor = currentZone.value.children.find(f => f.value === selectedFloorCode.value)
  return floor ? floor.children.map(h => ({ id: h.value, name: h.label })) : []
})

// 切区重置楼层
const handleTabClick = (tab) => {
  activeTabCode.value = tab.props.name
  selectedFloorCode.value = ''
}

// 选楼层
const selectFloor = (f_code) => {
  selectedFloorCode.value = f_code
}

// 选展厅(终点) - 抛出完整定位
const selectHall = (h) => {
  const req = {
    areaCode: activeTabCode.value,
    areaName: areaList.find(x=>x.code === activeTabCode.value)?.name || '',
    floorCode: selectedFloorCode.value,
    hallId: h.id,
    hallName: h.name
  }
  emit('select-hall', req)
  close()
}

const close = () => {
  emit('update:visible', false)
  // 延迟重置清理状态，防动画跳屏
  setTimeout(() => {
    activeTabCode.value = areaList.length > 0 ? areaList[0].code : 'A_ZONE'
    selectedFloorCode.value = ''
  }, 300)
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    direction="btt"
    size="75%"
    :with-header="false"
    :show-close="false"
    @close="close"
    class="rounded-t-2xl overflow-hidden"
  >
    <div class="flex flex-col h-full bg-white relative">
      <!-- 极简 Header -->
      <div class="px-5 py-4 flex justify-between items-center border-b border-gray-100 shrink-0">
        <h3 class="font-bold text-lg text-gray-800">请选择所在展馆</h3>
        <!-- 反馈4: 放大关闭按钮的热区和视觉体积 -->
        <div @click="close" class="p-2 -mr-2 cursor-pointer active:bg-gray-100 rounded-full flex items-center justify-center transition-colors">
          <el-icon class="text-gray-500 text-2xl"><Close /></el-icon>
        </div>
      </div>

      <!-- 四大区 Tab 平铺直铺 -->
      <div class="px-5 mt-2 shrink-0 custom-tabs-wrapper">
        <el-tabs v-model="activeTabCode" @tab-click="handleTabClick">
          <el-tab-pane 
            v-for="area in areaList" 
            :key="area.code" 
            :label="area.name" 
            :name="area.code"
          />
        </el-tabs>
      </div>

      <!-- 下半区内容滚动容器 -->
      <div class="flex-1 overflow-y-auto px-5 pb-8">
        
        <!-- Step 1: 选楼层 (网格按钮) -->
        <div class="mt-4">
          <div class="text-sm font-bold text-gray-600 mb-3">楼层 ({{ currentFloors.length }})</div>
          <div class="grid grid-cols-4 gap-3">
            <button
              v-for="floor in currentFloors"
              :key="floor.code"
              @click="selectFloor(floor.code)"
              class="h-10 rounded shadow-sm text-sm font-medium transition-colors border"
              :class="selectedFloorCode === floor.code 
                ? 'bg-blue-50 border-blue-500 text-blue-600' 
                : 'bg-white border-gray-200 text-gray-700 active:bg-gray-50'"
            >
              {{ floor.name }}
            </button>
          </div>
        </div>

        <!-- Step 2: 选展厅 (当区和楼层明确时才展示) -->
        <div v-if="selectedFloorCode" class="mt-8 animate-fade-in">
          <div class="text-sm font-bold text-gray-600 mb-3">展厅名称 ({{ currentHalls.length }})</div>
          <template v-if="currentHalls.length > 0">
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="hall in currentHalls"
                :key="hall.id"
                @click="selectHall(hall)"
                class="h-14 rounded shadow-sm text-sm font-medium transition-colors border bg-white border-gray-200 text-gray-800 active:bg-blue-50 active:border-blue-300"
              >
                {{ hall.name }}
              </button>
            </div>
          </template>
          <template v-else>
            <div class="text-center py-6 text-gray-400 text-sm">
              当前网络或字典设定该楼层暂无开放展厅
            </div>
          </template>
        </div>

      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
:deep(.el-drawer) {
  border-radius: 20px 20px 0 0;
}
:deep(.el-drawer__body) {
  padding: 0;
}
/* 私有化美化 Element UI 粗糙的下划线 Tab */
:deep(.custom-tabs-wrapper .el-tabs__header) {
  margin-bottom: 0;
}
:deep(.custom-tabs-wrapper .el-tabs__item) {
  font-size: 16px;
  font-weight: bold;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
