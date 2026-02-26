<script setup>
import { ref, computed, nextTick } from 'vue'
import { Search, Warning, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean,
  hallName: String,     // 用于 Input 显示如：8.0展厅
  boothDict: Array      // 父级传入的字典： [{ boothCode: 'D24', deliverPointId: '...'} ]
})

const emit = defineEmits(['update:visible', 'select-booth'])

const searchQuery = ref('')
const searchInputRef = ref(null)

// 响应式模糊过滤（极严验证核心：搜不到就是列表空）
const filteredBooths = computed(() => {
  if (!searchQuery.value) return props.boothDict
  const upperQuery = searchQuery.value.toUpperCase()
  return (props.boothDict || []).filter(item => 
    (item.boothCode || '').toUpperCase().includes(upperQuery)
  )
})

// 处理抽屉打开动画完成，自动获取焦点激活软键盘
const handleOpened = () => {
  nextTick(() => {
    if (searchInputRef.value) {
      searchInputRef.value.focus()
    }
  })
}

const handleClose = () => {
  searchQuery.value = ''
  emit('update:visible', false)
}

// 选中某个展位，同时回传展示用的 boothCode 和后台强绑定的 deliverPointId
const onSelectBooth = (item) => {
  emit('select-booth', {
    boothCode: item.boothCode,
    deliverPointId: item.deliverPointId
  })
  handleClose()
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    direction="btt"
    size="90%"
    :with-header="false"
    :show-close="false"
    @opened="handleOpened"
    @close="handleClose"
    class="rounded-t-2xl overflow-hidden"
  >
    <!-- 全屏搜索层骨架 -->
    <div class="flex flex-col h-full bg-gray-50">
      
      <!-- 顶部搜索 Header -->
      <div class="flex items-center px-4 py-3 bg-white border-b border-gray-100 shrink-0">
        <div class="flex-1 bg-gray-100 rounded-full flex items-center px-3 py-2">
          <el-icon class="text-gray-400 mr-2"><Search /></el-icon>
          <!-- 前置锁定前缀 -->
          <span class="text-gray-500 font-medium whitespace-nowrap mr-1 shrink-0">
            {{ hallName ? `[${hallName}]` : '' }}
          </span>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="bg-transparent border-none outline-none flex-1 text-base text-gray-800 uppercase w-full min-w-0"
            placeholder="搜索展位(仅字母数字)"
            @keyup.enter="searchInputRef.blur()"
          />
        </div>
        <button 
          @click="handleClose"
          class="ml-2 px-3 py-2 text-blue-600 font-medium text-[16px] whitespace-nowrap active:bg-gray-100 rounded transition-colors"
        >
          取消
        </button>
      </div>

      <!-- 搜索结果长列表视图 -->
      <div class="flex-1 overflow-y-auto px-4 py-2">
        
        <!-- 有结果集 -->
        <template v-if="filteredBooths.length > 0">
          <div class="text-xs text-gray-400 mb-2 mt-2 font-medium">请点选确切展位（匹配 {{filteredBooths.length}} 个）</div>
          <ul class="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-50">
            <li 
              v-for="(item, index) in filteredBooths" 
              :key="index"
              @click="onSelectBooth(item)"
              class="px-4 py-3.5 active:bg-gray-50 flex items-center justify-between cursor-pointer"
            >
              <div class="flex items-center">
                <span class="text-gray-400 mr-2 text-sm">{{ hallName }}</span>
                <span class="text-gray-800 font-bold text-base">{{ item.boothCode }}</span>
              </div>
              <el-icon class="text-gray-300"><ArrowRight /></el-icon>
            </li>
          </ul>
        </template>

        <!-- 极严拦截态：无结果阻断 -->
        <div v-else class="flex flex-col items-center justify-center pt-24 px-6 text-center">
          <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
             <el-icon class="text-red-500 text-3xl"><Warning /></el-icon>
          </div>
          <h3 class="text-gray-800 font-bold text-lg mb-2">未匹配到标准展位</h3>
          <p class="text-gray-500 text-sm leading-relaxed mb-6">
            系统未检索到您输入的展位号。<br/>
            为保证履约率，本次配送仅支持送达官方标准登记展位。<br/>
            <span class="text-red-500 font-medium">请核对字词并重新输入（仅限字母与数字组合）。</span>
          </p>
        </div>

      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
:deep(.el-drawer) {
  border-radius: 16px 16px 0 0;
  outline: none;
}
:deep(.el-drawer__body) {
  padding: 0;
}
</style>
