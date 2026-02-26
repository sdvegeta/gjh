<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Location, Search, Edit, EditPen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockBoothDictMap, mockUserInfo } from '../mock.js'
import BoothSearchModal from './BoothSearchModal.vue'
import ZoneSelectorDrawer from './ZoneSelectorDrawer.vue'

const props = defineProps({
  view: {
    type: String,
    default: 'add' // 'add' | 'edit'
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  addressCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['save', 'cancel', 'delete'])

const formRef = ref(null)
const submitLoading = ref(false)

// Logic: 核心表单模型，采用驼峰命名以符合现代前端规范
const form = reactive({
  areaName: '',
  floorCode: '',
  hallId: '',
  hallName: '',
  boothCode: '',
  deliverPointId: '',
  contactName: mockUserInfo.defaultName,
  userPhone: mockUserInfo.phone,
  invoiceTitle: '',
  taxNo: '',
  invoiceEmail: ''
})

// Logic: 初始化表单数据 (如果是编辑模式)
onMounted(() => {
  if (props.view === 'edit' && props.initialData) {
    const d = props.initialData
    form.areaName = d.areaName || ''
    form.floorCode = d.floorCode || ''
    form.hallId = d.hallId || ''
    form.hallName = d.hallName || (d.displayVenue ? d.displayVenue.split(' - ').pop() : '')
    form.boothCode = d.boothCode || d.displayBooth || ''
    form.deliverPointId = d.deliverPointId || ''
    form.contactName = d.contactName || ''
    form.userPhone = d.userPhone || mockUserInfo.phone
    form.invoiceTitle = d.invoiceTitle || ''
    form.taxNo = d.taxNo || ''
    form.invoiceEmail = d.invoiceEmail || ''
  }
})

// --- 展厅/展位选择交互 ---
const zoneSelectorVisible = ref(false)
const searchModalVisible = ref(false)
const currentHallBoothDict = ref([])

const openZoneSelector = () => {
  zoneSelectorVisible.value = true
}

const handleZoneSelected = (payload) => {
  if (form.hallId && form.hallId !== payload.hallId) {
    form.boothCode = ''
    form.deliverPointId = ''
  }
  form.areaName = payload.areaName
  form.floorCode = payload.floorCode
  form.hallId = payload.hallId
  form.hallName = payload.hallName
}

const openSearchModal = () => {
  if (!form.hallId) {
    ElMessage.warning('请先选择所在展厅')
    return
  }
  const dict = mockBoothDictMap[form.hallId]
  if (!dict || dict.length === 0) {
    // TODO: 获取展位字典 API 失败后的异常处理
    ElMessage.error(`服务器尚未下发展厅[${form.hallName}]的展位数据`)
    return
  }
  currentHallBoothDict.value = dict
  searchModalVisible.value = true
}

const handleBoothSelected = (payload) => {
  form.boothCode = payload.boothCode
  form.deliverPointId = payload.deliverPointId
}

// Logic: 辅助格式化
const formatBooth = (hallName, boothCode) => {
  if (!hallName || !boothCode) return boothCode || ''
  const cleanHall = hallName.replace(/展厅/g, '').trim()
  return `${cleanHall}${boothCode}`
}

// --- 表单校验 ---
const strictInvoiceValidator = (rule, value, callback) => {
  const t = form.invoiceTitle?.trim()
  const tax = form.taxNo?.trim()
  const mail = form.invoiceEmail?.trim()
  const hasAny = t || tax || mail
  const hasEmpty = !t || !tax || !mail
  
  if (hasAny && hasEmpty) {
    callback(new Error('INVALID_INVOICE'))
  } else {
    callback()
  }
}

const formRules = {
  hallId: [{ required: true, message: '请选择您的所在展厅', trigger: 'change' }],
  boothCode: [{ required: true, message: '请选择您的具体展位', trigger: 'change' }],
  contactName: [{ required: true, message: '请填写收餐人姓名', trigger: 'blur' }],
  userPhone: [{ required: true, message: '系统未获取到手机号', trigger: 'blur' }],
  invoiceTitle: [{ validator: strictInvoiceValidator, trigger: 'blur' }],
  taxNo: [{ validator: strictInvoiceValidator, trigger: 'blur' }],
  invoiceEmail: [{ validator: strictInvoiceValidator, trigger: 'blur' }]
}

// --- 行为操作 ---
const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      // 模拟保存延迟
      setTimeout(() => {
        const payload = { ...form }
        payload.displayVenue = `${form.areaName} - ${form.floorCode} - ${form.hallName}`
        payload.displayBooth = form.boothCode
        emit('save', payload)
        submitLoading.value = false
      }, 500)
    } else {
      // Logic: 针对性提示
      const t = form.invoiceTitle?.trim()
      const tax = form.taxNo?.trim()
      const mail = form.invoiceEmail?.trim()
      if ((t || tax || mail) && (!t || !tax || !mail)) {
        ElMessage.error('如需开票，请完整填写抬头、税号及邮箱')
      } else {
        ElMessage.error('表单未填写完整，请检查红框项')
      }
    }
  })
}

const handleDelete = () => {
  ElMessageBox.confirm('确定要删除该收餐地址吗？', '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('delete')
  }).catch(() => {})
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="p-3 animate-fade-in custom-h5-form">
    <!-- 空状态提示 -->
    <div v-if="addressCount === 0" class="mb-3 px-3 py-2 bg-blue-50 text-blue-600/80 rounded block text-[13px] border border-blue-100 font-medium">
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

        <el-form-item prop="boothCode" class="inline-flex-item !mb-0 pt-1">
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
              <span v-if="form.boothCode" class="text-gray-900 font-extrabold text-[15px] truncate flex-1 text-right mr-1">
                {{ formatBooth(form.hallName, form.boothCode) }}
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
        <el-form-item prop="contactName" class="inline-flex-item !items-center border-b border-gray-50 pb-1">
          <template #label><span class="w-[60px] font-bold text-gray-700 shrink-0 mt-0.5">姓名</span></template>
          <el-input 
            v-model="form.contactName" 
            placeholder="请填写收餐联系人姓名" 
            class="no-border-input flex-1"
          />
        </el-form-item>
        
        <el-form-item prop="userPhone" class="inline-flex-item !items-center !mb-0 pt-1">
           <template #label><span class="w-[60px] font-bold text-gray-700 shrink-0 mt-0.5">手机号</span></template>
           <el-input 
             v-model="form.userPhone" 
             type="tel"
             maxlength="11" 
             class="no-border-input flex-1 readonly-like-input text-right"
           />
        </el-form-item>
        <div class="text-[11px] text-gray-400 mt-1 pl-[72px] leading-tight break-all whitespace-normal">
          手机号将作为配送联系及订单查询重要凭证。
        </div>
      </div>

      <!-- 三、 发票专区 -->
      <div class="bg-white rounded-[14px] shadow-sm p-3 px-4 mb-3">
        <div class="flex items-center mb-3 border-b border-gray-50 pb-2 flex-wrap">
          <el-icon class="text-orange-400 text-[17px] mr-1"><Edit /></el-icon>
          <h3 class="text-[14px] font-extrabold text-gray-800 tracking-tight">开票信息 <span class="text-[12px] text-gray-400 font-normal ml-0.5 whitespace-nowrap">(需开发票请完整填写)</span></h3>
        </div>
        
        <el-form-item prop="invoiceTitle" class="inline-flex-item !items-center border-b border-gray-50 pb-1">
           <template #label><span class="w-[60px] font-bold text-gray-700 shrink-0 mt-0.5">抬头</span></template>
          <el-input v-model="form.invoiceTitle" placeholder="如：广州某某进出口有限公司" class="no-border-input flex-1" />
        </el-form-item>
        
        <el-form-item prop="taxNo" class="inline-flex-item !items-center border-b border-gray-50 pb-1 pt-1">
           <template #label><span class="w-[60px] font-bold text-gray-700 shrink-0 mt-0.5">税号</span></template>
          <el-input v-model="form.taxNo" placeholder="信用代码或识别号" class="no-border-input flex-1" />
        </el-form-item>
        
        <el-form-item prop="invoiceEmail" class="inline-flex-item !items-center !mb-1 pt-1">
           <template #label><span class="w-[60px] font-bold text-gray-700 shrink-0 mt-0.5">邮箱</span></template>
          <el-input v-model="form.invoiceEmail" type="email" placeholder="接收电子发票及小票摘要" class="no-border-input flex-1" />
        </el-form-item>
        
        <div class="mt-1 pb-1 flex items-start text-orange-500/80 text-[11px] leading-tight opacity-90 break-all whitespace-normal">
           <span>* 如需电子发票，请填写抬头、税号、邮箱；无需开票则全部留空。</span>
        </div>
      </div>

      <!-- 固定底部操作盘 -->
      <div class="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-100 px-4 py-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-10 flex gap-3">
        <el-button 
          v-if="view === 'edit'"
          plain
          type="danger"
          class="h-[46px] text-[15px] font-bold rounded-xl" 
          @click="handleDelete"
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

    <!-- 子弹窗与抽屉 -->
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
:deep(.no-border-input .el-input__wrapper) {
  box-shadow: none !important;
  padding: 0 4px;
  background: transparent;
}
:deep(.no-border-input .el-input__inner) {
  text-align: right;
  font-size: 14px;
  color: #1F2937;
  font-weight: 500;
}
:deep(.readonly-like-input .el-input__inner) {
  color: #6B7280;
  font-weight: 600;
  letter-spacing: 1px;
}
:deep(.compact-form .el-form-item.is-error .el-form-item__error) {
  display: none !important;
}
</style>
