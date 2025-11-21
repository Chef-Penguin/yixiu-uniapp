<script setup>
import NavBar from '@/components/nav-bar/index.vue'
</script>

<template>
  <view class="layout-default">
    <NavBar />
    <view class="layout-content">
      <slot />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.layout-default {
  min-height: 100vh;
}

.layout-content {
  /* 为固定头部预留空间 */
  padding-top: calc(44px + env(safe-area-inset-top));
}
</style>
