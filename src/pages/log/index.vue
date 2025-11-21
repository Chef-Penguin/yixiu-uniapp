<script setup>
import { ref } from 'vue'
import { getCarCount, getQueryLog } from '@/api/log'
import { getUserInfo } from '@/api/user.js'
import { useUserStore } from '@/store/user'
import { currRoute } from '@/utils/index'
import RequestLoading from '@/utils/RequestLoading'

const routeInfo = currRoute()
const userStore = useUserStore()
const carCountText = ref('')
const logList = ref([])
const showCarCount = ref(false)
const search = ref('')
const menuStates = ref([]) // 数组索引对应 logList 的 index
const baseUrl = import.meta.env.VITE_SERVER
// 创建router实例
function toggleExpand(current) {
  current.isExpanded = !current.isExpanded
}
// 显示操作菜单
// 显示指定 index 的菜单
function showMenu(e, index) {
  // 先关闭其他所有菜单
  menuStates.value.forEach((state, i) => {
    state.isShow = i === index
  })
  // 计算当前菜单的位置
  nextTick(() => {
    adjustMenuPosition(e, index)
  })
}
async function queryCarCount() {
  try {
    const responseCar = await getCarCount()
    carCountText.value = responseCar.data
    showCarCount.value = true
  }
  catch (error) {
    console.error('接口请求失败：', error)
  }
}
// 隐藏指定 index 的菜单
function hideMenu(index) {
  if (menuStates.value[index]) {
    menuStates.value[index].isShow = false
  }
}

// 调整指定 index 的菜单位置
function adjustMenuPosition(e, index) {
  // 通过 index 定位当前菜单（关键：每个菜单有唯一标识）
  const menuEl = document.querySelector(`.operation-menu-${index}`)
  if (!menuEl)
    return

  // 原有位置计算逻辑不变
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const menuWidth = menuEl.offsetWidth || 200
  const menuHeight = menuEl.offsetHeight || 160
  let { clientX: left, clientY: top } = e

  if (left + menuWidth > screenWidth) {
    left = Math.max(0, screenWidth - menuWidth - 10)
  }
  if (top + menuHeight > screenHeight) {
    top = Math.max(0, screenHeight - menuHeight - 10)
  }

  // 更新当前 index 的菜单位置
  menuStates.value[index].position = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

// 切换指定 index 的菜单显示状态
function toggleMenu(e, index) {
  const currentState = menuStates.value[index]
  if (currentState) {
    if (currentState.isShow) {
      hideMenu(index)
    }
    else {
      showMenu(e, index)
    }
  }
}

// 模拟“查看关联对话”点击事件
function viewRelated(data, index) {
  console.log(data, index, '查看关联对话')
  uni.navigateTo({
    url: `/pages/conversationHistory/index?data=${JSON.stringify(data)}`,
  })
  hideMenu()
}
// 模拟“编辑”点击事件
function editLog(data) {
  console.log(data, '编辑日志')
  uni.navigateTo({
    url: `/pages/editLog/index?data=${JSON.stringify(data)}`,
  })
  hideMenu()
}
// 模拟“分享”点击事件（预留）
function shareLog() {
  console.log('分享日志（预留）')
  hideMenu()
}
function handleClickOutside(e) {
  menuStates.value.forEach((state, index) => {
    if (state.isShow) {
      const menuEl = document.querySelector(`.operation-menu-${index}`)
      const btnEl = document.querySelector(
        `.log-container:nth-child(${index + 1}) .menu-btn`,
      )

      const isClickInMenu = menuEl?.contains(e.target)
      const isClickInBtn = btnEl?.contains(e.target)

      if (!isClickInMenu && !isClickInBtn) {
        hideMenu(index)
      }
    }
  })
}
// 监听全局点击事件
onLoad(() => {
  document.addEventListener('click', handleClickOutside)
  initialization()
})

onActivated(() => {
  initialization()
  const routeInfo = currRoute()
  if (routeInfo.query.fromCreateLog) {
    queryCarCount()
    getUserInfo().then((response) => {
      userStore.setRepairCount(response.data.repairCount)
      routeInfo.query.fromCreateLog = false
    })
  }
})
// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 新增：格式化时间为“YYYY年MM月DD日”
function formatDate(isoString) {
  if (!isoString)
    return ''
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // 月份从0开始，需+1
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}
// 在获取日志列表后初始化每个项的菜单状态
async function searchClick(search) {
  try {
    const response = await RequestLoading(getQueryLog, { title: search })
    logList.value = response.data || []
    // 初始化每个日志项的菜单状态（默认隐藏）
    menuStates.value = logList.value.map(() => ({
      isShow: false,
      position: { top: '0px', left: '0px' },
    }))
  }
  catch (error) {
    console.error('接口请求失败：', error)
    logList.value = []
    menuStates.value = []
  }
}
async function initialization() {
  try {
    const response = await RequestLoading(getQueryLog, { title: '' })
    logList.value
      = response.data.map(item => ({ ...item, isExpanded: false })) || []
    // 初始化每个日志项的菜单状态（默认隐藏）
    menuStates.value = logList.value.map(() => ({
      isShow: false,
      position: { top: '0px', left: '0px' },
    }))
  }
  catch (error) {
    console.error('接口请求失败：', error)
    logList.value = []
    menuStates.value = []
  }
}
</script>

<template>
  <view class="tabbar-page">
    <CustomSearch v-model="search" @search="searchClick(search)" />
    <!-- 关键：用v-for遍历logList，定义log变量 -->
    <view
      v-for="(log, index) in logList"
      :key="log.id || index"
      class="log-container"
    >
      <!-- <van-floating-bubble v-model:offset="offset" icon="edit" axis="xy" /> -->
      <view class="log-header">
        <span class="log-title">修车日志</span>
        <!-- 现在log已定义，可安全访问log.createTime -->
        <span class="log-date">{{ formatDate(log.createTime) }}</span>
        <view class="menu-btn" @click.stop="toggleMenu($event, index)">
          <van-icon name="ellipsis" />
        </view>
      </view>
      <view class="log-text">
        <!-- 回显log.title、log.summaryContent -->
        <text>{{ log.title || "" }}</text>
        <text v-html="log.summaryContent" />
        <view class="expand-btn" @click="toggleExpand(log)">
          {{ log.isExpanded ? "收起" : "展开" }}
        </view>
      </view>

      <view v-if="log.images && log.images !== ''" class="image-placeholders">
        <view
          v-for="image in log.images.split(',').filter((item) => item)"
          :key="image"
          class="placeholder"
        >
          <image :src="`${baseUrl}/${image}`" alt="" srcset="" />
        </view>
      </view>

      <!-- 操作菜单弹窗（保持不变） -->
      <view
        v-if="menuStates[index]?.isShow"
        class="operation-menu"
        :class="`operation-menu-${index}`"
        :style="{
          top: menuStates[index].position.top,
          left: menuStates[index].position.left,
        }"
        @click.stop
      >
        <!-- 传递当前 log 的 id 和 index -->
        <view class="menu-item" @click="viewRelated(log.id, index)">
          查看关联对话
        </view>
        <view class="menu-item" @click="editLog(log.id, index)">
          编辑
        </view>
        <view class="menu-item" @click="shareLog(log.id, index)">
          分享[预留功能]
        </view>
        <view class="menu-item" @click="inteRview(log.id, index)">
          提审[预留功能]
        </view>
      </view>
    </view>

    <!-- 可选：当没有日志时显示空提示 -->
    <view v-if="logList.length === 0" class="empty-tip">
      暂无修车日志
    </view>

    <van-popup v-model:show="showCarCount" round :style="{ padding: '54px' }">
      <view style="color: #f46205; text-align: center">
        <text>{{ userStore.user.name }}</text>
        <text>这是一修师傅陪你修复的第</text>
        <text>{{ carCountText }}</text>
        <text>台车</text>
      </view>
    </van-popup>
  </view>
</template>

<style scoped lang="scss">
.empty-tip {
  text-align: center;
  font-size: 14px;
  color: #999;
  margin-top: 150px;
}
.float-bubble {
  width: var(--van-floating-bubble-size);
  height: var(--van-floating-bubble-size);
  border: 2px solid #000;
  color: #000;
  border-radius: 50%;
  position: fixed;
  bottom: 30%;
  right: 20px;
  display: flex;
  align-content: center;
  justify-content: center;
}

.log-container {
  padding: 10px;
  position: relative; // 为操作菜单绝对定位做准备
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.log-title {
  font-size: 14px;
  color: #999;
}

.log-date {
  font-size: 14px;
  color: #999;
}

.log-text p {
  margin: 5px 0;
  line-height: 1.5;
}

.expand-btn {
  background-color: transparent;
  border: none;
  color: #f37021;
  cursor: pointer;
  padding: 5px 0;
  font-size: 14px;
  margin-top: 5px;
}

.expand-btn:hover {
  text-decoration: underline;
}

.image-placeholders {
  display: flex;
  margin-top: 10px;
  gap: 10px;
}

.placeholder {
  width: 80px;
  height: 80px;
  border: 1px solid #ccc;
  image {
    width: 100%;
    height: 100%;
  }
}

.menu-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.operation-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
  padding: 5px 0;
  width: 124px;
}

.menu-item {
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #f5f5f5;
  }
}
</style>
