<template>
  <!-- 包裹用户内容的容器 -->
  <div
    ref="containerRef"
    class="text-selection-container"
    @mouseup="handleMouseUp"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <slot></slot>
  </div>

  <!-- 自定义高亮层 -->
  <teleport to="body">
    <div
      v-if="highlights.length > 0"
      class="text-selection-highlights"
      :style="{ pointerEvents: 'none' }"
    >
      <div
        v-for="(highlight, index) in highlights"
        :key="index"
        class="highlight-rect"
        :style="{
          position: 'absolute',
          left: highlight.left + 'px',
          top: highlight.top + 'px',
          width: highlight.width + 'px',
          height: highlight.height + 'px',
          backgroundColor: 'rgba(65, 131, 196, 0.3)',
          pointerEvents: 'none',
        }"
      />
    </div>
  </teleport>

  <!-- 选区手柄 -->
  <teleport to="body">
    <!-- 左手柄 -->
    <div
      v-if="leftHandle.visible"
      class="selection-handle left-handle"
      :style="{
        left: leftHandle.x + 'px',
        top: leftHandle.y + 'px',
      }"
      @touchstart.prevent="(e) => handleHandleTouchStart('left', e)"
      @touchmove.prevent="handleHandleTouchMove"
      @touchend.prevent="handleHandleTouchEnd"
    >
      <div class="handle-circle"></div>
      <div class="handle-line"></div>
    </div>

    <!-- 右手柄 -->
    <div
      v-if="rightHandle.visible"
      class="selection-handle right-handle"
      :style="{
        left: rightHandle.x + 'px',
        top: rightHandle.y + 'px',
      }"
      @touchstart.prevent="(e) => handleHandleTouchStart('right', e)"
      @touchmove.prevent="handleHandleTouchMove"
      @touchend.prevent="handleHandleTouchEnd"
    >
      <div class="handle-circle"></div>
      <div class="handle-line"></div>
    </div>
  </teleport>

  <!-- 菜单渲染到body -->
  <teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="text-selection-menu"
      :style="menuStyle"
      @click.stop
      @touchstart.stop
      @mousedown.stop
    >
      <div class="menu-content">
        <div
          v-for="(item, index) in finalMenuItems"
          :key="index"
          class="menu-item"
          @click="handleMenuClick(item)"
          @touchend.prevent="handleMenuClick(item)"
        >
          <span v-if="item.icon" class="menu-icon">{{ item.icon }}</span>
          <span class="menu-label">{{ item.label }}</span>
        </div>
      </div>
      <div class="menu-arrow"></div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"

const props = defineProps({
  // 菜单项配置（额外的菜单项，复制功能始终存在）
  menuItems: {
    type: Array,
    default: () => [],
  },
  // 是否启用
  disabled: {
    type: Boolean,
    default: false,
  },
  // 最小选中字符数才显示菜单
  minLength: {
    type: Number,
    default: 1,
  },
  // 菜单偏移量
  offset: {
    type: Object,
    default: () => ({ x: 0, y: -10 }),
  },
})

const emit = defineEmits(["select", "menu-click"])

const visible = ref(false)
const menuRef = ref(null)
const containerRef = ref(null)
const selectedText = ref("")
const menuPosition = ref({ x: 0, y: 0 })
const highlights = ref([]) // 自定义高亮矩形

// 选区手柄相关状态
const leftHandle = ref({ x: 0, y: 0, visible: false })
const rightHandle = ref({ x: 0, y: 0, visible: false })
const isDraggingHandle = ref(null) // 'left' | 'right' | null

// 移动端长按选择相关状态
const touchStartPos = ref({ x: 0, y: 0 })
const touchStartTime = ref(0)
const isLongPress = ref(false)
const isSelecting = ref(false) // 是否正在选择
const longPressTimer = ref(null)
const selectionRange = ref(null) // 当前选区
const LONG_PRESS_DURATION = 300 // 长按时长（毫秒），缩短以更快响应
const MOVE_THRESHOLD = 10 // 移动阈值（像素）

// 确保复制功能始终存在（将传入的菜单项与复制功能合并）
const finalMenuItems = computed(() => {
  const copyItem = { label: "复制", icon: "", action: "copy" }
  // 检查传入的菜单项中是否已经有复制功能
  const hasCopy = props.menuItems.some((item) => item.action === "copy")
  // 如果没有复制功能，则添加到开头
  return hasCopy ? props.menuItems : [copyItem, ...props.menuItems]
})

const menuStyle = computed(() => ({
  left: `${menuPosition.value.x + props.offset.x}px`,
  top: `${menuPosition.value.y + props.offset.y}px`,
}))

// 获取触摸点处的文本节点
const getTextNodeAtPoint = (x, y) => {
  const range = document.caretRangeFromPoint(x, y)
  if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
    return range.startContainer
  }
  return null
}

// 查找单词边界
const findWordBoundary = (textNode, offset) => {
  const text = textNode.textContent
  let start = offset
  let end = offset

  // 向前查找单词开始
  while (start > 0 && !/\s/.test(text[start - 1])) {
    start--
  }

  // 向后查找单词结束
  while (end < text.length && !/\s/.test(text[end])) {
    end++
  }

  return { start, end }
}

// 选择单词（作为起点）
const selectWordAtPoint = (x, y) => {
  const range = document.caretRangeFromPoint(x, y)
  if (!range) return null

  const textNode = range.startContainer
  if (textNode.nodeType !== Node.TEXT_NODE) return null

  const offset = range.startOffset
  const { start, end } = findWordBoundary(textNode, offset)

  const newRange = document.createRange()
  newRange.setStart(textNode, start)
  newRange.setEnd(textNode, end)

  return newRange
}

// 扩展选区到指定点
const extendSelectionToPoint = (range, x, y) => {
  if (!range) return null

  const endRange = document.caretRangeFromPoint(x, y)
  if (!endRange) return range

  const newRange = document.createRange()

  // 比较起点和终点位置
  const comparison = range.compareBoundaryPoints(
    Range.START_TO_START,
    endRange
  )

  if (comparison < 0) {
    // 向后选择
    newRange.setStart(range.startContainer, range.startOffset)
    newRange.setEnd(endRange.endContainer, endRange.endOffset)
  } else {
    // 向前选择
    newRange.setStart(endRange.startContainer, endRange.startOffset)
    newRange.setEnd(range.endContainer, range.endOffset)
  }

  return newRange
}

// 创建高亮矩形
const createHighlights = (range) => {
  if (!range) return []

  const rects = range.getClientRects()
  const highlightRects = []

  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i]
    highlightRects.push({
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
    })
  }

  return highlightRects
}

// 更新手柄位置
const updateHandles = (range) => {
  if (!range) {
    leftHandle.value.visible = false
    rightHandle.value.visible = false
    return
  }

  const rects = range.getClientRects()
  if (rects.length === 0) {
    leftHandle.value.visible = false
    rightHandle.value.visible = false
    return
  }

  // 左手柄：第一个矩形的左上角
  const firstRect = rects[0]
  leftHandle.value = {
    x: firstRect.left + window.scrollX,
    y: firstRect.top + window.scrollY,
    visible: true,
  }

  // 右手柄：最后一个矩形的右下角
  const lastRect = rects[rects.length - 1]
  rightHandle.value = {
    x: lastRect.right + window.scrollX,
    y: lastRect.bottom + window.scrollY,
    visible: true,
  }
}

// PC端：鼠标抬起处理
const handleMouseUp = () => {
  if (props.disabled) return

  setTimeout(() => {
    const selection = window.getSelection()
    const text = selection.toString().trim()

    if (!text || text.length < props.minLength) {
      hideMenu()
      return
    }

    // 检查是否在容器内
    if (!isSelectionInContainer(selection)) {
      hideMenu()
      return
    }

    selectedText.value = text
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    // 计算菜单位置
    menuPosition.value = {
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY,
    }

    visible.value = true
    emit("select", { text, range, rect })
  }, 10)
}

// 移动端：触摸开始
const handleTouchStart = (e) => {
  if (props.disabled) return

  const touch = e.touches[0]
  touchStartPos.value = { x: touch.clientX, y: touch.clientY }
  touchStartTime.value = Date.now()
  isLongPress.value = false
  isSelecting.value = false

  // 隐藏之前的菜单
  visible.value = false

  // 清除之前的定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
  }

  // 设置长按检测定时器
  longPressTimer.value = setTimeout(() => {
    isLongPress.value = true
    startSelection(touch.clientX, touch.clientY)
  }, LONG_PRESS_DURATION)
}

// 移动端：触摸移动
const handleTouchMove = (e) => {
  const touch = e.touches[0]
  const deltaX = Math.abs(touch.clientX - touchStartPos.value.x)
  const deltaY = Math.abs(touch.clientY - touchStartPos.value.y)

  // 如果正在选择，更新选区
  if (isSelecting.value && selectionRange.value) {
    e.preventDefault() // 防止页面滚动
    updateSelection(touch.clientX, touch.clientY)
  } else if (!isLongPress.value) {
    // 如果移动超过阈值，取消长按
    if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value)
        longPressTimer.value = null
      }
    }
  }
}

// 移动端：触摸结束
const handleTouchEnd = () => {
  // 清除长按定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }

  // 如果正在选择，显示菜单
  if (isSelecting.value && selectionRange.value) {
    const text = selectionRange.value.toString().trim()
    if (text && text.length >= props.minLength) {
      selectedText.value = text
      const rect = selectionRange.value.getBoundingClientRect()

      // 计算菜单位置
      menuPosition.value = {
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY,
      }

      visible.value = true
      emit("select", { text, range: selectionRange.value, rect })
    } else {
      // 选中文本太短，清除选择
      hideMenu()
    }
  }

  isLongPress.value = false
  isSelecting.value = false
}

// 开始选择
const startSelection = (x, y) => {
  // 检查点击位置是否在容器内
  if (!containerRef.value) return

  const element = document.elementFromPoint(x, y)
  if (!containerRef.value.contains(element)) return

  // 选择触摸点的单词作为起点
  const range = selectWordAtPoint(x, y)
  if (!range) return

  selectionRange.value = range
  isSelecting.value = true

  // 创建初始高亮
  highlights.value = createHighlights(range)
  // 更新手柄位置
  updateHandles(range)
}

// 更新选择范围
const updateSelection = (x, y) => {
  if (!selectionRange.value) return

  // 扩展选区到当前触摸点
  const extendedRange = extendSelectionToPoint(selectionRange.value, x, y)
  if (!extendedRange) return

  // 检查是否跨越容器边界
  if (!containerRef.value) return
  const startInContainer = containerRef.value.contains(
    extendedRange.startContainer
  )
  const endInContainer = containerRef.value.contains(extendedRange.endContainer)

  if (!startInContainer || !endInContainer) return

  // 更新选区
  selectionRange.value = extendedRange

  // 更新高亮
  highlights.value = createHighlights(extendedRange)
  // 更新手柄位置
  updateHandles(extendedRange)
}

// 手柄触摸开始
const handleHandleTouchStart = (handleType, e) => {
  e.stopPropagation()
  e.preventDefault()
  isDraggingHandle.value = handleType
  visible.value = false // 拖动手柄时隐藏菜单
}

// 手柄触摸移动
const handleHandleTouchMove = (e) => {
  if (!isDraggingHandle.value || !selectionRange.value) return

  e.preventDefault()
  const touch = e.touches[0]
  const x = touch.clientX
  const y = touch.clientY

  // 根据拖动的手柄更新选区
  const newRange = document.createRange()
  const pointRange = document.caretRangeFromPoint(x, y)
  if (!pointRange) return

  try {
    if (isDraggingHandle.value === 'left') {
      // 拖动左手柄，更新起点
      newRange.setStart(pointRange.startContainer, pointRange.startOffset)
      newRange.setEnd(selectionRange.value.endContainer, selectionRange.value.endOffset)
    } else {
      // 拖动右手柄，更新终点
      newRange.setStart(selectionRange.value.startContainer, selectionRange.value.startOffset)
      newRange.setEnd(pointRange.endContainer, pointRange.endOffset)
    }

    // 检查新选区是否在容器内
    if (!containerRef.value) return
    if (!containerRef.value.contains(newRange.startContainer) ||
        !containerRef.value.contains(newRange.endContainer)) return

    // 更新选区
    selectionRange.value = newRange
    highlights.value = createHighlights(newRange)
    updateHandles(newRange)
  } catch (error) {
    console.warn('Handle drag error:', error)
  }
}

// 手柄触摸结束
const handleHandleTouchEnd = () => {
  if (!isDraggingHandle.value) return

  isDraggingHandle.value = null

  // 显示菜单
  if (selectionRange.value) {
    const text = selectionRange.value.toString().trim()
    if (text && text.length >= props.minLength) {
      selectedText.value = text
      const rect = selectionRange.value.getBoundingClientRect()

      menuPosition.value = {
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY,
      }

      visible.value = true
      emit("select", { text, range: selectionRange.value, rect })
    } else {
      hideMenu()
    }
  }
}

// 检查选中的文字是否在容器内
const isSelectionInContainer = (selection) => {
  if (!containerRef.value || !selection.rangeCount) return false

  const range = selection.getRangeAt(0)
  const container = containerRef.value

  // 检查选区的起始和结束节点是否在容器内
  return (
    container.contains(range.startContainer) &&
    container.contains(range.endContainer)
  )
}

// 隐藏菜单
const hideMenu = () => {
  visible.value = false
  selectedText.value = ""
  highlights.value = [] // 清除高亮
  leftHandle.value.visible = false
  rightHandle.value.visible = false
  selectionRange.value = null
}

// 处理菜单项点击
const handleMenuClick = async (item) => {
  // 根据不同动作执行默认行为
  let success = false
  switch (item.action) {
    case "copy":
      success = await copyToClipboard(selectedText.value)
      break
    case "search":
      searchText(selectedText.value)
      success = true
      break
    default:
      // 自定义动作由父组件处理
      success = true
      break
  }

  // 触发事件，传递操作结果
  emit("menu-click", {
    action: item.action,
    text: selectedText.value,
    item,
    success,
  })

  hideMenu()
}

// 复制到剪贴板（增强版，返回成功状态）
const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      textarea.style.top = "0"
      textarea.style.left = "0"
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      const success = document.execCommand("copy")
      document.body.removeChild(textarea)
      return success
    }
  } catch (err) {
    console.error("复制失败:", err)
    return false
  }
}

// 搜索文字（可以替换为实际的搜索逻辑）
const searchText = (text) => {
  console.log("搜索:", text)
  // 可以在这里跳转到搜索页面或打开搜索弹窗
}

// 点击其他地方隐藏菜单
const handleClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    hideMenu()
  }
}

// 禁用浏览器默认右键菜单和长按菜单（仅在容器内）
const handleContextMenu = (e) => {
  if (!containerRef.value) return

  // 只在容器内禁用右键菜单和移动端长按菜单
  if (containerRef.value.contains(e.target)) {
    e.preventDefault() // 阻止默认菜单显示
  }
}

onMounted(() => {
  // 禁用浏览器默认右键菜单和移动端长按菜单
  if (containerRef.value) {
    containerRef.value.addEventListener("contextmenu", handleContextMenu)
  }

  // 点击其他地方隐藏菜单（全局监听）
  document.addEventListener("click", handleClickOutside)
  document.addEventListener("touchstart", handleClickOutside, { passive: true })
})

onBeforeUnmount(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener("contextmenu", handleContextMenu)
  }
  document.removeEventListener("click", handleClickOutside)
  document.removeEventListener("touchstart", handleClickOutside)

  // 清理定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
  }
})

// 暴露方法给父组件
defineExpose({
  hideMenu,
  selectedText: () => selectedText.value,
})
</script>

<style lang="scss" scoped>
// 容器样式（不影响布局）
.text-selection-container {
  display: contents; // 使容器透明，不影响布局

  // PC端允许文本选择，移动端禁用原生选择
  :deep(*) {
    // PC端：允许文本选择
    @media (hover: hover) and (pointer: fine) {
      user-select: text !important;
      -webkit-user-select: text !important;
    }

    // 移动端：完全禁用文本选择，使用自定义长按
    @media (hover: none) and (pointer: coarse) {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      -webkit-touch-callout: none !important;
      -webkit-tap-highlight-color: transparent;
    }
  }
}

// 自定义高亮层样式
.text-selection-highlights {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;

  .highlight-rect {
    transition: all 0.1s ease;
  }
}

// 选区手柄样式
.selection-handle {
  position: absolute;
  z-index: 9999;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;

  // 扩大触摸区域
  padding: 10px;
  margin: -10px;

  .handle-line {
    position: absolute;
    width: 2px;
    height: 20px;
    background: #4183c4;
  }

  .handle-circle {
    position: absolute;
    width: 12px;
    height: 12px;
    background: #4183c4;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &.left-handle {
    transform: translate(-6px, -20px);

    .handle-line {
      left: 5px;
      top: 0;
    }

    .handle-circle {
      left: 0;
      top: 20px;
    }
  }

  &.right-handle {
    transform: translate(-6px, 0);

    .handle-line {
      left: 5px;
      top: -20px;
    }

    .handle-circle {
      left: 0;
      top: -32px;
    }
  }

  // 拖动时的反馈
  &:active {
    .handle-circle {
      transform: scale(1.3);
      box-shadow: 0 2px 12px rgba(65, 131, 196, 0.5);
    }
  }
}

.text-selection-menu {
  position: absolute;
  z-index: 9999;
  transform: translate(-50%, -100%);
  animation: fadeInUp 0.2s ease-out;

  .menu-content {
    display: flex;
    align-items: center;
    gap: 2px;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    padding: 0px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    color: #fff;
    font-size: 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    user-select: none;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    &:active {
      transform: scale(0.95);
    }

    .menu-icon {
      font-size: 16px;
    }

    .menu-label {
      font-weight: 500;
    }
  }

  .menu-arrow {
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(0, 0, 0, 0.85);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate(-50%, calc(-100% + 10px));
  }
  to {
    opacity: 1;
    transform: translate(-50%, -100%);
  }
}

// 浅色主题
.text-selection-menu.light {
  .menu-content {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .menu-item {
    color: #333;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  .menu-arrow {
    border-top-color: rgba(255, 255, 255, 0.95);
  }
}
</style>
