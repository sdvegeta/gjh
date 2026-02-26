<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Location, Search, Plus, MapLocation, Message, Edit, EditPen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- Mock Data & Store ---
import { mockBoothDictMap, mockUserInfo } from './mock.js'
import { useAddressStore } from './composables/useAddress.js'
import BoothSearchModal from './components/BoothSearchModal.vue'
import ZoneSelectorDrawer from './components/ZoneSelectorDrawer.vue'

const { addresses, addAddress, updateAddress, removeAddress, setDefault } = useAddressStore()

// --- 路由与场景模拟 ---
const urlParams = new URLSearchParams(window.location.search)
const fromOrder = urlParams.get('from') === 'order'
const orderHallId = urlParams.get('hall') || 'hall_8_0' // 如果没配默认给个做演示

// --- 页面视图状态 (list | edit | add) ---
const currentView = ref('list')
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

const submitLoading = ref(false)
const editingId = ref(null)

const handleAddNew = () => {
  if (addresses.length >= 3) {
    ElMessage.warning('最多只能创建3个收餐地址，请先删除部分旧地址')
    return
  }
  resetForm()
  currentView.value = 'add'
  editingId.value = null
}

const handleEdit = (addr) => {
  resetForm()
  form.areaName = addr.areaName
  form.floorCode = addr.floorCode
  form.hallId = addr.hallId
  // Fallback: 如果历史数据没存 hallName，从 displayVenue 提取最后一段
  form.hallName = addr.hallName || (addr.displayVenue ? addr.displayVenue.split(' - ').pop() : '')
  form.booth_code = addr.booth_code || addr.displayBooth
  form.deliver_point_id = addr.deliver_point_id
  form.contact_name = addr.contact_name
  form.user_phone = addr.user_phone
  form.invoice_title = addr.invoice_title || ''
  form.tax_no = addr.tax_no || ''
  form.invoice_email = addr.invoice_email || ''
  
  editingId.value = addr.id
  currentView.value = 'edit'
}

const handleCancelAdd = () => {
  if (addresses.length === 0) return 
  currentView.value = 'list'
  editingId.value = null
}

// 选中地址时的交互
const handleSelectAddress = (addr) => {
  if (fromOrder) {
    // 模拟检验：校验展厅是否一致
    if (addr.hallId !== orderHallId) {
      ElMessageBox.confirm(
        '您选择的收餐地址与当前商品所在展厅不一致，是否清空购物车并跳转至新点位重新预订？',
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
        // 反馈2：去除冗余内置 emoji
        ElMessage.success('已清空购物车，正在为您跳转至新点位...')
        // 模拟真实项目中的 router.replace(...)
      }).catch(() => {})
      return
    }
  }
  setDefault(addr.id)
  ElMessage.success('已选择该收餐地址') // 反馈2去重
}

// --- 辅助工具：提取纯展厅号并与展位号进行格式化 (反馈3) ---
const formatBooth = (hallName, boothCode, displayVenue = '') => {
  let hall = hallName
  if (!hall && displayVenue) {
    // 从 "A区 - 1F - 8.0展厅" 中提取 "8.0展厅"
    const parts = displayVenue.split(' - ')
    hall = parts[parts.length - 1]
  }
  if (!hall || !boothCode) return boothCode || ''
  const cleanHall = hall.replace(/展厅/g, '').trim()
  return `${cleanHall}${boothCode}`
}

// --- 选址表单核心模型 ---
const formRef = ref(null)

const form = reactive({
  areaName: '',
  floorCode: '',
  hallId: '',
  hallName: '',
  
  booth_code: '',
  deliver_point_id: '',
  
  contact_name: mockUserInfo.defaultName,
  user_phone: mockUserInfo.phone, 
  
  invoice_title: '',
  tax_no: '',
  invoice_email: ''
})

const resetForm = () => {
  form.areaName = ''
  form.floorCode = ''
  form.hallId = ''
  form.hallName = ''
  form.booth_code = ''
  form.deliver_point_id = ''
  form.contact_name = mockUserInfo.defaultName
  form.invoice_title = ''
  form.tax_no = ''
  form.invoice_email = ''
  form.user_phone = mockUserInfo.phone
}

// --- 抽屉态：场馆选择 ---
const zoneSelectorVisible = ref(false)

const openZoneSelector = () => {
  zoneSelectorVisible.value = true
}

const handleZoneSelected = (payload) => {
  if (form.hallId && form.hallId !== payload.hallId) {
    form.booth_code = ''
    form.deliver_point_id = ''
  }
  form.areaName = payload.areaName
  form.floorCode = payload.floorCode
  form.hallId = payload.hallId
  form.hallName = payload.hallName
}

// --- 抽屉态：极严展位搜索 ---
const searchModalVisible = ref(false)
const currentHallBoothDict = ref([])

const openSearchModal = () => {
  if (!form.hallId) {
    ElMessage.warning('请先选择所在展厅')
    return
  }
  const dict = mockBoothDictMap[form.hallId]
  if (!dict || dict.length === 0) {
    ElMessage.error(`服务器尚未下发展厅[${form.hallName}]的展位数据`)
    return
  }
  currentHallBoothDict.value = dict
  searchModalVisible.value = true
}

const handleBoothSelected = (payload) => {
  form.booth_code = payload.booth
  form.deliver_point_id = payload.deliver_point_id
}

// 三联发票校验
const strictInvoiceValidator = (rule, value, callback) => {
  const t = form.invoice_title?.trim()
  const tax = form.tax_no?.trim()
  const mail = form.invoice_email?.trim()
  
  const hasAny = t || tax || mail
  const hasEmpty = !t || !tax || !mail
  
  if (hasAny && hasEmpty) {
    callback(new Error('提示：如需电子发票，请填写抬头、税号、邮箱；无需开票则全部留空'))
  } else {
    callback()
  }
}

const formRules = {
  hallId: [{ required: true, message: '请选择您的所在展厅', trigger: 'change' }],
  booth_code: [{ required: true, message: '请选择您的具体展位', trigger: 'change' }],
  contact_name: [{ required: true, message: '请填写收餐人姓名', trigger: 'blur' }],
  user_phone: [{ required: true, message: '系统未获取到手机号', trigger: 'blur' }],
  invoice_title: [{ validator: strictInvoiceValidator, trigger: 'blur' }],
  tax_no: [{ validator: strictInvoiceValidator, trigger: 'blur' }],
  invoice_email: [{ validator: strictInvoiceValidator, trigger: 'blur' }]
}

// --- 提交保存 ---
const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      
      setTimeout(() => {
        const addrPayload = JSON.parse(JSON.stringify(form))
        addrPayload.displayVenue = `${form.areaName} - ${form.floorCode} - ${form.hallName}`
        addrPayload.displayBooth = form.booth_code
        // 去除保存时的冗余字段，全部改为模板动态实时计算
        
        let success = false
        if (currentView.value === 'add') {
           success = addAddress(addrPayload)
        } else if (currentView.value === 'edit') {
           success = updateAddress(editingId.value, addrPayload)
        }
        
        submitLoading.value = false
        if (success) {
          ElMessage.success('收餐地址保存成功') // 反馈2去重
          currentView.value = 'list'
          editingId.value = null
        }
      }, 500)
    } else {
      ElMessage.error('表单未填写完整，请核对下方提示')
    }
  })
}

// 在修改状态下的删除操作
const deleteAddr = () => {
  ElMessageBox.confirm('确定要删除该收餐地址吗？', '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    removeAddress(editingId.value)
    ElMessage.success('已删除')
    if (addresses.length === 0) {
      currentView.value = 'add'
    } else {
      currentView.value = 'list'
    }
  }).catch(() => {})
}

</script>

<template>
  <div class="min-h-screen bg-[#F7F8FA] pb-24 relative">
    
    <!-- Header 永远吸顶 -->
    <div class="bg-white sticky top-0 z-20 px-4 h-12 flex items-center justify-center border-b border-gray-100 shadow-sm relative">
      <h1 class="font-bold text-gray-800 text-[17px]">
        {{ currentView === 'add' ? '新增收餐地址' : currentView === 'edit' ? '修改收餐地址' : '选择收餐地址' }}
      </h1>
      <div 
        v-if="currentView !== 'list' && addresses.length > 0" 
        @click="handleCancelAdd"
        class="absolute left-4 text-blue-500 text-[15px] active:opacity-60 cursor-pointer"
      >
        取消
      </div>
    </div>

    <!-- ==================== 地址列表聚合视图 ==================== -->
    <div v-if="currentView === 'list'" class="p-3 animate-fade-in">
      
      <!-- 顶部测试模拟提醒 -->
      <div v-if="fromOrder" class="mb-3 px-3 py-2 bg-blue-50 text-blue-600/80 rounded block text-[13px] border border-blue-100">
        <span class="font-bold">演示模式</span>: 当前模拟从 [{{ orderHallId }}] 商品提单页跳转而来
      </div>

      <!-- 列表区 -->
      <div class="space-y-3 mb-6">
        <div 
          v-for="addr in addresses" 
          :key="addr.id"
          @click="handleSelectAddress(addr)"
          class="bg-white rounded-[14px] p-3 shadow-sm border-[1.5px] transition-colors relative cursor-pointer active:bg-blue-50/30"
          :class="addr.isDefault ? 'border-blue-500' : 'border-transparent'"
        >
          <!-- 左上角水滴 Tag -->
          <div v-if="addr.isDefault" class="absolute right-0 top-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-bl-[14px] rounded-tr-[12px] font-bold">
            当前使用
          </div>
          
          <div class="flex items-start">
             <div class="bg-blue-100 text-blue-600 rounded p-1.5 mr-3 shrink-0 mt-1">
                <el-icon><MapLocation /></el-icon>
             </div>
             <div class="flex-1 pr-8">
                <div class="text-[13px] text-gray-500 mb-1 leading-none">{{ addr.displayVenue }}</div>
                <!-- 反馈3：动态在模板级进行前缀拼接换算，并增加 displayVenue 的 Fallback 兼容性 -->
                <div class="font-extrabold text-gray-900 text-[18px] mb-2 leading-none">展位：{{ formatBooth(addr.hallName, addr.booth_code || addr.displayBooth, addr.displayVenue) }}</div>
                <div class="text-[14px] text-gray-700 font-medium">
                  {{ addr.contact_name }} &nbsp; <span class="text-gray-400 font-normal">{{ addr.user_phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }}</span>
                </div>
                 <!-- 发票信息简览 -->
                <div v-if="addr.invoice_title" class="mt-2 bg-yellow-50/50 rounded flex items-center p-1.5 text-[12px] text-gray-500 w-fit max-w-full">
                  <span class="bg-gray-200 text-gray-600 px-1 py-0.5 rounded mr-1 leading-none shrink-0">票</span>
                  <span class="truncate block">{{ addr.invoice_title }}</span>
                </div>
             </div>
             <!-- 编辑图标 -->
             <div 
               @click.stop="handleEdit(addr)" 
               class="absolute right-3 bottom-3 text-gray-400 p-2 cursor-pointer active:bg-gray-100 rounded-full transition-colors flex items-center justify-center shrink-0"
             >
               <el-icon class="text-lg"><EditPen /></el-icon>
             </div>
          </div>
        </div>
      </div>

      <!-- 底部添加按钮区 (反馈1: 满配时变灰禁止) -->
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

    <!-- ==================== 新增/编辑 表单视图 ==================== -->
    <div v-else class="p-3 animate-fade-in custom-h5-form">
      
      <!-- 当从没有地址进来时，显示一行提示语 -->
      <div v-if="addresses.length === 0" class="mb-3 px-3 py-2 bg-blue-50 text-blue-600/80 rounded block text-[13px] border border-blue-100 font-medium">
        请先填写收餐展厅展位、联系人及开票信息。
      </div>

      <el-form 
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="left"
        hide-required-asterisk
        class="compact-form"
      >
        <!-- 一、 所在展馆选择 -->
        <div class="bg-white rounded-[14px] shadow-sm p-3 px-4 mb-3">
          <h3 class="text-[15px] font-extrabold text-gray-800 mb-2 flex items-center -ml-1">
            <!-- 反馈4：统一去除非必要的动态前缀，强制为中性标题 -->
            <el-icon class="mr-1 text-blue-500 text-[18px]"><Location /></el-icon> 收餐地址
          </h3>
          
          <el-form-item prop="hallId" class="inline-flex-item border-b border-gray-50 pb-1">
            <template #label><span class="w-[70px] font-bold text-gray-700 shrink-0">所在展厅</span></template>
            <div 
              @click="openZoneSelector"
              class="w-full h-[40px] flex items-center justify-end cursor-pointer select-none active:opacity-60 pl-2 text-right overflow-hidden"
            >
              <template v-if="!form.hallId">
                <span class="text-gray-400 text-[14px]">点击选择</span>
              </template>
              <template v-else>
                <span class="text-gray-800 font-bold text-[14px] truncate flex-1 text-right mr-1">
                  {{ form.areaName }}-{{ form.floorCode }}-{{ form.hallName }}
                </span>
                <el-icon class="text-blue-500 ml-1 text-[16px] shrink-0"><EditPen /></el-icon>
              </template>
            </div>
          </el-form-item>

          <el-form-item prop="booth_code" class="inline-flex-item !mb-0 pt-1">
            <template #label><span class="w-[70px] font-bold text-gray-700 shrink-0">展位号</span></template>
            <div 
              @click="openSearchModal"
              class="w-full h-[40px] flex items-center justify-end cursor-pointer select-none active:opacity-60 pl-2 text-right overflow-hidden"
              :class="!form.hallId ? 'opacity-50' : ''"
            >
              <template v-if="!form.hallId">
                <span class="text-gray-400 text-[14px]">请先选择展厅</span>
              </template>
              <template v-else>
                <!-- 反馈3同步应用：动态呈现拼接后的效果 -->
                <span v-if="form.booth_code" class="text-gray-900 font-extrabold text-[15px] truncate flex-1 text-right mr-1">
                  {{ formatBooth(form.hallName, form.booth_code) }}
                </span>
                <span v-else class="text-gray-400 text-[14px] flex-1 text-right mr-1">
                   搜索选择
                </span>
                <el-icon class="text-blue-500 ml-1 text-[16px] shrink-0"><Search /></el-icon>
              </template>
            </div>
          </el-form-item>
        </div>

        <!-- 二、 基本联系信息 -->
        <div class="bg-white rounded-[14px] shadow-sm p-3 px-4 mb-3">
          <el-form-item prop="contact_name" class="inline-flex-item !items-center border-b border-gray-50 pb-1">
            <template #label><span class="w-[60px] font-bold text-gray-700 shrink-0 mt-0.5">姓名</span></template>
            <el-input 
              v-model="form.contact_name" 
              placeholder="请填写收餐联系人姓名" 
              class="no-border-input flex-1"
            />
          </el-form-item>
          
          <!-- 反馈6：手机与输入框同排 -->
          <el-form-item prop="user_phone" class="inline-flex-item !items-center !mb-0 pt-1">
             <template #label><span class="w-[60px] font-bold text-gray-700 shrink-0 mt-0.5">手机号</span></template>
             <el-input 
               v-model="form.user_phone" 
               type="tel"
               maxlength="11" 
               class="no-border-input flex-1 readonly-like-input text-right"
             />
          </el-form-item>
          <div class="text-[11px] text-gray-400 mt-1 pl-[72px] leading-tight break-all whitespace-normal">手机号将作为配送联系及订单查询重要凭证，请确保填写正确。</div>
        </div>

        <!-- 三、 发票专区 -->
        <div class="bg-white rounded-[14px] shadow-sm p-3 px-4 mb-3">
          <div class="flex items-center mb-3 border-b border-gray-50 pb-2 flex-wrap">
            <el-icon class="text-orange-400 text-[17px] mr-1"><Edit /></el-icon>
            <h3 class="text-[14px] font-extrabold text-gray-800 tracking-tight">开票信息 <span class="text-[12px] text-gray-400 font-normal ml-0.5 whitespace-nowrap">(需开发票请完整填写)</span></h3>
          </div>
          
          <el-form-item prop="invoice_title" class="inline-flex-item !items-center border-b border-gray-50 pb-1">
             <template #label><span class="w-[60px] font-bold text-gray-700 shrink-0 mt-0.5">抬头</span></template>
            <el-input v-model="form.invoice_title" placeholder="如：广州某某进出口有限公司" class="no-border-input flex-1" />
          </el-form-item>
          
          <el-form-item prop="tax_no" class="inline-flex-item !items-center border-b border-gray-50 pb-1 pt-1">
             <template #label><span class="w-[60px] font-bold text-gray-700 shrink-0 mt-0.5">税号</span></template>
            <el-input v-model="form.tax_no" placeholder="信用代码或识别号" class="no-border-input flex-1" />
          </el-form-item>
          
          <el-form-item prop="invoice_email" class="inline-flex-item !items-center !mb-1 pt-1">
             <template #label><span class="w-[60px] font-bold text-gray-700 shrink-0 mt-0.5">邮箱</span></template>
            <el-input v-model="form.invoice_email" type="email" placeholder="接收电子发票及小票摘要" class="no-border-input flex-1" />
          </el-form-item>
          
          <div class="mt-1 pb-1 flex items-start text-orange-500/80 text-[11px] leading-tight opacity-90 break-all whitespace-normal">
             <span>* 如需电子发票，请填写抬头、税号、邮箱；无需开票则全部留空。</span>
          </div>
        </div>

        <!-- 固定底部操作盘 -->
        <div class="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-100 px-4 py-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-10 flex gap-3">
          <el-button 
            v-if="currentView === 'edit'"
            plain
            type="danger"
            class="h-[46px] text-[15px] font-bold rounded-xl" 
            @click="deleteAddr"
          >
            删除
          </el-button>
          <el-button 
            type="primary" 
            class="h-[46px] text-[16px] font-bold rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors flex-1" 
            :loading="submitLoading"
            @click="handleSave"
          >
            保存收餐地址
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- Drawer 挂载点 -->
    <ZoneSelectorDrawer 
      v-model:visible="zoneSelectorVisible" 
      @select-hall="handleZoneSelected"
    />
    
    <BoothSearchModal 
      v-model:visible="searchModalVisible"
      :hall-name="form.hallName"
      :booth-dict="currentHallBoothDict"
      @select-booth="handleBoothSelected"
    />
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

/* --- 重构同行布局专用样式 --- */
:deep(.inline-flex-item) {
   display: flex;
   align-items: flex-start;
   margin-bottom: 0px !important;
}
:deep(.inline-flex-item .el-form-item__label) {
   padding-bottom: 0;
   line-height: normal;
   align-self: center;
}
:deep(.inline-flex-item .el-form-item__content) {
   flex: 1;
   min-width: 0; 
}

/* 私有定制输入框（去边框融进白背景，靠右或自适应） */
:deep(.no-border-input .el-input__wrapper) {
  box-shadow: none !important;
  padding: 0 4px;
  background: transparent;
}
:deep(.no-border-input .el-input__inner) {
  text-align: right; /* 根据移动端直觉，同行排版输入通常右对齐 */
  font-size: 14px;
  color: #1F2937;
  font-weight: 500;
}
:deep(.no-border-input .el-input__inner::placeholder) {
  color: #9CA3AF;
  font-weight: 400;
}

:deep(.readonly-like-input .el-input__inner) {
  color: #6B7280;
  font-weight: 600;
  letter-spacing: 1px;
}

/* MessageBox 断点修正 */
:global(.custom-msg-box) {
  max-width: 85vw !important;
  border-radius: 16px;
}
</style>
