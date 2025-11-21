<template>
  <div class="dialog-history-container">
    <div class="historyTitle">
      <div class="imgfan" @click="handleGoBack">
        <img src="@/static/images/fanhui.png" alt="返回">
      </div>
      <h3 class="title">
        对话历史
      </h3>
    </div>

    <ul class="dialog-list">
      <li v-for="(item, index) in dialogItems" :key="index" class="dialog-item">
        <label :for="`dialog-${index}`" class="radio-label" />
        <div class="dialog-content">
          {{ item.content }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { showToast, Toast } from 'vant'

import { createApp, ref } from 'vue'

import { useRoute, useRouter } from 'vue-router'
import { getRelatedLog } from '@/api/log'
import { useUserStore } from '@/store/user'
import RequestLoading from '@/utils/RequestLoading'

const app = createApp()
app.use(Toast)

// const userStore = useUserStore()
const router = useRouter()
// 定义对话历史数据
const dialogItems = ref([
  {
    content:
      '这里是用户与AI关联的那一段对话的记录纯图文，只需要上下滚动浏览，无需其他交互',
  },
  {
    content: '',
  },
  {
    content: '为了xxx，请锁定您正在维修的车型',
  },
])

// 定义返回处理函数
function handleGoBack() {
  // 这里可以添加返回逻辑，例如路由跳转
  router.back()
  console.log('返回上一页')
}
const route = useRoute()
let parsedData = null
onMounted(() => {
  const { data } = route.query
  if (data) {
    parsedData = JSON.parse(data)
    console.log('接收的数据:', parsedData)
  }
  onLoad()
})
async function onLoad() {
  try {
    const response = await RequestLoading(getRelatedLog, {
      logId: parsedData,
      userId: userStore.user.userId,
    })
    console.log('完整响应数据：', response)
    dialogItems.value = response.data
    if (dialogItems.value.length === 0) {
      showToast('暂无数据')
    }
  }
  catch (error) {
    console.error('接口请求失败：', error)
  }
}
</script>

<style scoped>
.dialog-history-container {
  width: 300px;
  margin: 20px auto;
  padding: 10px;
}

.title {
  text-align: center;
  margin-bottom: 15px;
  font-weight: 700;
}

.dialog-list {
  list-style: none;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
}

.dialog-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.radio-label {
  display: inline-block;
  width: 35px;
  height: 35px;
  border: 1px solid #999;
  border-radius: 50%;
  margin-right: 10px;
  margin-top: 5px;
}

.dialog-content {
  flex: 1;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.imgfan {
  width: 16px;
  height: 16px;
  cursor: pointer; /* 添加鼠标指针样式，提示可点击 */
  float: left;
}

/* 为图片添加样式，确保正确显示 */
.imgfan img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
