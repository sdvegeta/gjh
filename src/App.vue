<script setup>
/**
 * 广交会收餐地址 PWA - 顶层页面控制器
 * Logic: 本组件仅负责视图状态切换 (view switcher) 和全局业务拦截
 */
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAddressStore } from './composables/useAddress.js'

// 引入解耦后的子组件
import AddressList from './components/AddressList.vue'
import AddressForm from './components/AddressForm.vue'

// --- 全局状态管理 ---
const { addresses, addAddress, updateAddress, removeAddress, setDefault } = useAddressStore()

// --- 路由与场景模拟 (演示用) ---
// Logic: 模拟从不同的业务入口进入地址页
const urlParams = new URLSearchParams(window.location.search)
const fromOrder = urlParams.get('from') === 'order'
const orderHallId = urlParams.get('hall') || 'hall_8_0'

// --- 页面视图切换逻辑 (list | edit | add) ---
const currentView = ref('list')
const editingAddress = ref(null)

const initView = () => {
  if (addresses.length === 0) {
    currentView.value = 'add'
  } else {
    currentView.value = 'list'
  }
}

onMounted(() => {
  initView()
})

// --- 通用交互处理 ---
const handleAddNew = () => {
  if (addresses.length >= 3) {
    ElMessage.warning('最多只能创建3个收餐地址')
    return
  }
  editingAddress.value = null
  currentView.value = 'add'
}

const handleEditEntry = (addr) => {
  editingAddress.value = { ...addr }
  currentView.value = 'edit'
}

const handleCancel = () => {
  if (addresses.length === 0) return 
  currentView.value = 'list'
}

/**
 * 选中并设为当前地址
 */
const handleSelectAddress = (addr) => {
  if (fromOrder && addr.hallId !== orderHallId) {
    // 跨展厅业务拦截逻辑
    ElMessageBox.confirm(
      '您选择的地址与商品所在展厅不一致，是否需要跳转至新点位重新预订？',
      '收餐点位不一致',
      {
        confirmButtonText: '确定重订',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
        customClass: 'custom-msg-box'
      }
    ).then(() => {
      setDefault(addr.id)
      ElMessage.success('已切换至新点位，正在为您跳转服务商...')
      // TODO: 前端接手后，此处需调用路由跳转 router.replace 或 window.location.href
    }).catch(() => {})
    return
  }
  
  setDefault(addr.id)
  ElMessage.success('已设为默认收餐地址')
}

/**
 * 处理表单保存
 * // TODO: 真实研发阶段可在此处包装 API 调用
 */
const onFormSave = (payload) => {
  let success = false
  if (currentView.value === 'add') {
    success = addAddress(payload)
  } else {
    success = updateAddress(editingAddress.value.id, payload)
  }

  if (success) {
    ElMessage.success('收餐地址保存成功')
    currentView.value = 'list'
  }
}

const onFormDelete = () => {
  removeAddress(editingAddress.value.id)
  ElMessage.success('地址已成功移除')
  initView()
}
</script>

<template>
  <div class="min-h-screen bg-[#F7F8FA] pb-24 relative font-sans">
    
    <!-- 头部导航栏 - 永远吸顶 -->
    <div class="bg-white sticky top-0 z-20 px-4 h-12 flex items-center justify-center border-b border-gray-100 shadow-sm">
      <h1 class="font-bold text-gray-800 text-[17px]">
        {{ currentView === 'add' ? '新增收餐地址' : currentView === 'edit' ? '修改收餐地址' : '选择收餐地址' }}
      </h1>
      <!-- 返回按钮仅在有数据且不在列表页时显示 -->
      <div 
        v-if="currentView !== 'list' && addresses.length > 0" 
        @click="handleCancel"
        class="absolute left-4 text-blue-500 text-[15px] active:opacity-60 cursor-pointer"
      >
        取消
      </div>
    </div>

    <!-- 视图路由分发 -->
    <main>
      <!-- 地址列表视图 -->
      <AddressList 
        v-if="currentView === 'list'"
        :addresses="addresses"
        :from-order="fromOrder"
        :order-hall-id="orderHallId"
        @select="handleSelectAddress"
        @edit="handleEditEntry"
        @add-new="handleAddNew"
      />

      <!-- 表单视图 (新增/编辑) -->
      <AddressForm 
        v-else
        :view="currentView"
        :initial-data="editingAddress"
        :address-count="addresses.length"
        @save="onFormSave"
        @cancel="handleCancel"
        @delete="onFormDelete"
      />
    </main>

  </div>
</template>

<style>
/* 全局移动端表单适配样式 */
.custom-h5-form .el-form-item__error {
  position: relative;
  padding-top: 4px;
  padding-left: 2px;
}
.custom-msg-box {
  max-width: 85vw !important;
  border-radius: 16px;
}
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
