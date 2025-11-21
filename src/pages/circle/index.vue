<script setup>
const search = ref("")
</script>

<template>
  <div class="tabbar-page">
    <CustomSearch v-model="search" />
    <div class="circle-container">
      <div class="circle-item">
        <img
          src="https://picsum.photos/id/64/40/40"
          alt="avatar"
          class="avatar"
        />
        <div class="circle-item-content"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.circle-container {
  padding: 12px;
}

.circle-item {
  display: flex;
  margin-top: 12px;
  gap: 16px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.circle-item-content {
  height: 160px;
  border-radius: 10px;
  width: 100%;
  background: #eaeaea;
}
</style>
