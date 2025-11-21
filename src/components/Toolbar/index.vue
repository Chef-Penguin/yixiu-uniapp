<template>
  <div class="post-editor">
    <!-- Quill 编辑器容器 -->
    <div ref="editorContainer" class="editor-box" />

    <!-- 图片预览 -->
    <div v-if="images.length" class="image-list">
      <div v-for="(img, i) in images" :key="i" class="img-item">
        <img :src="img.displayUrl">
        <span class="remove" @click="removeImage(i)">×</span>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="toolbar-btn" title="插入话题" @click="insertTopic">
          <span class="icon">#</span>
        </button>
        <button class="toolbar-btn" title="上传图片" @click="handleAddImage">
          <van-icon name="photo-o" size="20" />
        </button>
        <button
          class="toolbar-btn"
          :class="{ active: isBold }"
          title="加粗"
          @click="toggleBold"
        >
          <span class="icon" :class="{ active: isBold }"><b>B</b></span>
        </button>
        <button
          class="toolbar-btn"
          :class="{ active: isListActive }"
          title="无序列表"
          @click="toggleBullet"
        >
          <van-icon name="bars" size="20" />
        </button>
      </div>
      <div class="toolbar-right">
        <button class="publish-btn" @click="handleSend">
          <img src="@/static/images/publish.png">
        </button>
      </div>
    </div>

    <!-- 图片选择输入框（隐藏） -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      multiple
      class="file-input"
      @change="uploadImage"
    >
  </div>
</template>

<script setup>
import Quill from 'quill'
import { showToast } from 'vant'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { sendPictureApi } from '@/api/user'
import RequestLoading from '@/utils/RequestLoading'
import 'quill/dist/quill.snow.css'

const props = defineProps({ htmlValue: { type: String } })
// 定义 emit 事件
const emit = defineEmits(['publish'])
// const content = ref("")
// 存储图片对象数组，每个对象包含 displayUrl 和 serverPath
const images = ref([])
const editorContainer = ref(null)
const fileInputRef = ref(null)
const isBold = ref(false)
const isListActive = ref(false)
let quillInstance = null
watch(
  () => props.htmlValue,
  () => {
    if (props.htmlValue && quillInstance) {
      console.log(1)
      quillInstance.root.innerHTML = props.htmlValue
      // content.value = props.htmlValue
    }
  },
)
onLoad(() => {
  // 初始化 Quill 编辑器
  if (editorContainer.value) {
    quillInstance = new Quill(editorContainer.value, {
      theme: 'snow',
      modules: {
        toolbar: false, // 禁用默认工具栏
      },
      placeholder: '说点什么...',
    })

    // 监听内容变化
    // quillInstance.on("text-change", () => {
    //   content.value = quillInstance.root.innerHTML
    // })
  }
})

onBeforeUnmount(() => {
  if (quillInstance) {
    quillInstance = null
  }
})

// 防御用的 helper：确保实例存在
function getQ() {
  if (!quillInstance) {
    console.warn('Quill instance not ready yet.')
    return null
  }
  return quillInstance
}

// 切换加粗（操作前确保实例存在）
function toggleBold() {
  const q = getQ()
  if (!q)
    return
  isBold.value = !isBold.value
  // 获取当前选区格式
  const sel = q.getSelection()
  // 如果没有选区，切换当前光标处的 bold 状态
  const current = sel ? q.getFormat(sel) : {}
  q.format('bold', !current.bold)
}

// 插入话题（#话题#）
function insertTopic() {
  const q = getQ()
  if (!q)
    return
  const sel = q.getSelection(true)
  const index = sel && typeof sel.index === 'number' ? sel.index : q.getLength()

  // 创建带样式的话题文本
  q.insertText(index, '#话题# ', { color: '#ff8c00', bold: true })
  q.setSelection(index + '#话题# '.length, 0)
}

// 切换无序列表（bullet）针对当前段落
function toggleBullet() {
  const q = getQ()
  if (!q)
    return
  const sel = q.getSelection(true)
  if (!sel) {
    // 如果没有选区，就把最后一行变为列表
    q.formatLine(q.getLength() - 1, 1, 'list', 'bullet')
    isListActive.value = true
    return
  }
  // 如果当前已经是 bullet，则取消，否则设置为 bullet
  const formats = q.getFormat(sel)
  const isBullet = formats.list === 'bullet'
  q.format('list', isBullet ? false : 'bullet')
  isListActive.value = !isBullet
}

// 触发图片上传
function handleAddImage() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

// 上传图片到服务器（保存服务器路径，不插入编辑器）
async function uploadImage(e) {
  const files = e.target.files
  if (!files || files.length === 0)
    return

  // 检查图片数量限制
  const maxAdd = 9 - images.value.length
  if (maxAdd <= 0) {
    showToast('最多只能上传9张图片')
    e.target.value = ''
    return
  }

  const filesToProcess = Math.min(files.length, maxAdd)

  // 上传所有图片并收集服务器地址
  for (let i = 0; i < filesToProcess; i++) {
    const file = files[i]
    if (file && file.type?.startsWith('image/')) {
      const formDataToUpload = new FormData()
      formDataToUpload.append('file', file)
      try {
        const { msg } = await RequestLoading(sendPictureApi, formDataToUpload)
        // 保存displayUrl（用于显示）和serverPath（用于提交）
        images.value.push({
          displayUrl: `${import.meta.env.VITE_SERVER}/${msg}`,
          serverPath: msg,
        })
      }
      catch (error) {
        console.error(`上传第${i + 1}张图片失败:`, error)
        showToast(`上传第${i + 1}张图片失败`)
      }
    }
  }

  // 清空文件选择，允许重复选择同一文件
  e.target.value = ''
}

function removeImage(i) {
  images.value.splice(i, 1)
}

// 发送内容（仿照 RichTextEditor 的数据结构）
function handleSend() {
  const q = getQ()
  if (!q)
    return

  const htmlContent = q.root.innerHTML
  // 提取服务器路径数组
  const serverPaths = images.value.map(img => img.serverPath)

  // 验证是否有内容
  if (!htmlContent.trim() && serverPaths.length === 0) {
    showToast('请输入内容或上传图片')
    return
  }

  // 组装数据，仿照 RichTextEditor 的结构
  const submitData = {
    html: htmlContent,
    images: serverPaths, // 这里是服务器路径数组，不是 base64
  }

  // 发送给父组件
  emit('publish', submitData)

  // 清空内容
  q.setText('')
  images.value = []
  isBold.value = false
  isListActive.value = false
}
</script>

<style scoped>
.post-editor {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.editor-box {
  min-height: 150px;
  padding: 15px;
  font-size: 16px;
  line-height: 1.6;
  outline: none;
}

.image-list {
  display: flex;
  gap: 10px;
  padding: 0 15px 15px;
  flex-wrap: wrap;
  overflow-x: auto;
}

.img-item {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.img-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff3b30;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  line-height: 1;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-top: 1px solid #e5e7e5;
  border-bottom: 1px solid #e5e7e5;
  background: #fff;
  position: fixed;
  bottom: 0px;
  width: 100%;
  padding-right: 20px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 0;
}

.toolbar-btn:active {
  background: #f0f0f0;
}

.toolbar-btn .icon {
  font-size: 20px;
  font-weight: bold;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn .icon.active {
  color: #ff8c00;
}

/* van-icon 激活状态 - 橘黄色 */
.toolbar-btn.active :deep(.van-icon) {
  color: #ff8c00;
}

.toolbar-right {
  display: flex;
  align-items: center;
}
.publish-btn {
  width: 35px;
  cursor: pointer;
}

.file-input {
  display: none;
}

/* 移除 Quill 默认样式影响 */
.editor-box :deep(.ql-editor) {
  padding: 0;
}

.editor-box :deep(.ql-container) {
  font-size: 16px;
}

/* 话题文字样式 - 橘黄色，匹配 #xxx# 格式 */
.editor-box :deep(.ql-editor) p,
.editor-box :deep(.ql-editor) {
  /* 使用 CSS 无法直接匹配文本内容，需要 JS 处理 */
}
:deep(.ql-container.ql-snow) {
  border: none;
}
:deep(.ql-editor) {
  min-height: 200px;
  max-height: 600px;
  overflow-y: scroll;
}
</style>
