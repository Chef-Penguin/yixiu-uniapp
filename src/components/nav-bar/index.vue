<script setup>
import { computed, ref } from 'vue'
import More from './More.vue'

defineOptions({ name: 'NavBar' })

const showMore = ref(false)

function onMore() {
  showMore.value = true
}

function onBack() {
  uni.navigateBack()
}

function goHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}

// 获取当前页面路径来判断是否显示返回按钮
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const showBackButton = computed(() => pages.length > 1)
</script>

<template>
  <view class="nav-bar">
    <view class="nav-bar-content">
      <view class="nav-left">
        <view v-if="showBackButton" class="nav-icon" @tap="onBack">
          <text class="icon-back">‹</text>
        </view>
        <view v-else class="nav-icon" @tap="onMore">
          <text class="icon-menu">☰</text>
        </view>
      </view>

      <view class="nav-title" @tap="goHome">
        <text>一修师傅</text>
      </view>

      <view class="nav-right">
        <!-- 右侧预留位置 -->
      </view>
    </view>

    <!-- 更多菜单弹窗 -->
    <!-- #ifdef H5 -->
    <More v-model:show-more="showMore" />
    <!-- #endif -->
  </view>
</template>

<style lang="scss" scoped>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.nav-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top);
}

.nav-left,
.nav-right {
  width: 60px;
  display: flex;
  align-items: center;
}

.nav-right {
  justify-content: flex-end;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.icon-back {
  font-size: 48px;
  line-height: 36px;
  color: #333;
  font-weight: 300;
}

.icon-menu {
  font-size: 20px;
  color: #333;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #333;
}
</style>
