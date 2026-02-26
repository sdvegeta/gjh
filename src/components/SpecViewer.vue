<script setup>
import { ref, watch, nextTick } from 'vue'
import { Document } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import mermaid from 'mermaid'
import 'github-markdown-css/github-markdown.css'

// 导入编写的技术文档源码
import specRaw from '../docs/pages/address_spec.md?raw'

const drawerVisible = ref(false)
const htmlContent = ref('')
const zoomImageVisible = ref(false)
const zoomImageUrl = ref('')

// 初始化 MarkdownIt 解析
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// 初始化 Mermaid 主题
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose'
})

const openViewer = async () => {
  drawerVisible.value = true
  
  // 1. 渲染普通 Markdown
  htmlContent.value = md.render(specRaw)
}

/**
 * 提取所有 Mermaid 的代码块并解析为 SVG
 * 兼容 markdown-it 生成的 class名可能是 language-mermaid 或者是 pre 上的特性
 */
const renderMermaid = async () => {
  // 增加约 100ms 的延时缓冲，确保 el-drawer 内的 v-html 完全插入了 DOM
  setTimeout(async () => {
    // 兼容两类可能生成的结构: `<code class="language-mermaid">` 和 `<pre><code class="mermaid">`
    const codeBlocks = document.querySelectorAll('.markdown-body code.language-mermaid, .markdown-body code.mermaid, .markdown-body pre.language-mermaid code')
    
    if (codeBlocks.length === 0) {
      console.warn('SpecViewer: 没有检测到需要渲染的 mermaid 节点。')
      return
    }

    for (let i = 0; i < codeBlocks.length; i++) {
      const block = codeBlocks[i]
      if (block.dataset.processed) continue

      const graphDefinition = block.textContent
      // 如果代码外部没有包裹 pre，就直接用自身做替换挂载点
      const container = block.tagName.toLowerCase() === 'code' && block.parentElement && block.parentElement.tagName.toLowerCase() === 'pre' 
                        ? block.parentElement 
                        : block
      
      try {
        const id = `mermaid-svg-run-${Date.now()}-${i}`
        const { svg } = await mermaid.render(id, graphDefinition)
        
        const wrapper = document.createElement('div')
        wrapper.className = 'mermaid-wrapper custom-mermaid-click'
        wrapper.innerHTML = svg
        
        wrapper.onclick = () => {
          zoomImageUrl.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
          zoomImageVisible.value = true
        }

        container.replaceWith(wrapper)
        block.dataset.processed = true
      } catch (err) {
        console.error('SpecViewer: Mermaid 渲染失败:', err, '\n源码:', graphDefinition)
        // 渲染失败时强制标红显示错误，避免静默失败
        container.innerHTML = `<div style="color:red; padding:10px; border:1px solid red; font-size:12px;">Mermaid Syntax Error. Check console for details.</div><pre>${graphDefinition}</pre>`
      }
    }
  }, 100)
}
</script>

<template>
  <div>
    <!-- 右下角悬浮按钮 -->
    <div 
      class="fixed bottom-24 right-5 z-[9999] w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-50 transition-all border border-blue-100"
      @click="openViewer"
      title="查看本页技术规格"
    >
      <el-icon class="text-[24px]"><Document /></el-icon>
      <div class="absolute -bottom-5 w-20 text-center text-[10px] text-gray-500 bg-white/80 rounded block scale-90 origin-top">
        技术规格页
      </div>
    </div>

    <!-- 文档展示抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="技术规格说明 (Technical Spec)"
      direction="rtl"
      size="80%"
      @opened="renderMermaid"
      class="spec-drawer"
    >
      <div class="drawer-content px-2 pb-10">
        <!-- 注入解析好的 HTML 并应用 github-markdown 样式池 -->
        <div class="markdown-body" v-html="htmlContent"></div>
      </div>
    </el-drawer>

    <!-- 图表全屏放大 Dialog -->
    <el-dialog 
      v-model="zoomImageVisible" 
      width="90%" 
      class="bg-transparent shadow-none"
      draggable
      align-center
    >
      <div class="bg-white rounded-lg p-4 overflow-auto max-h-[85vh] flex justify-center">
        <img :src="zoomImageUrl" class="max-w-full" alt="SVG Zoom" />
      </div>
    </el-dialog>
  </div>
</template>

<style>
/* Drawer 内部覆盖样式 */
.spec-drawer .el-drawer__header {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  font-weight: bold;
  color: #333;
}
.spec-drawer .el-drawer__body {
  padding: 20px;
  background-color: #fafbfc;
}
.drawer-content {
  background: white;
  padding: 20px 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  min-height: 100%;
}

/* 覆盖 Markdown 里的默认 Mermaid 大小并增加点击反馈 */
.markdown-body .mermaid-wrapper {
  margin: 1.5rem 0;
  cursor: zoom-in;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e1e4e8;
  display: flex;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.markdown-body .mermaid-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.markdown-body .mermaid-wrapper svg {
  max-width: 100%;
  height: auto;
}
</style>
