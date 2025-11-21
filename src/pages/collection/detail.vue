<template>
  <div class="collection-detail-page">
    <van-nav-bar placeholder fixed>
      <template #title>
        <span>一修师傅</span>
      </template>
      <template #left>
        <van-icon size="30" name="arrow-left" @click="handleGoBack" />
      </template>
    </van-nav-bar>
    <div v-if="detailData" class="detail-container">
      <div v-if="detailData.title" class="detail-title">
        {{ detailData.title }}
      </div>
      <div class="detail-content" v-html="formatContent(detailData.content)" />
    </div>
    <van-loading v-else type="spinner" vertical>
      加载中...
    </van-loading>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCollectionDetailApi } from '@/api/collection'
import RequestLoading from '@/utils/RequestLoading'

const router = useRouter()
const route = useRoute()
const detailData = ref(null)

function handleGoBack() {
  router.back()
}

// 格式化内容，将换行符转换为HTML
function formatContent(content) {
  if (!content)
    return ''
  // 将 \r\n 和 \n 转换为 <br>
  return content
    .replace(/\r\n/g, '<br>')
    .replace(/\n/g, '<br>')
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
}

async function initialization() {
  const targetId = route.query.targetId
  if (!targetId) {
    console.error('缺少 targetId 参数')
    return
  }

  try {
    const { data } = await RequestLoading(getCollectionDetailApi, {
      targetId,
    })
    detailData.value = data || null
    detailData.value.title = '这是标题测试事实上'
  }
  catch (error) {
    console.error('接口请求失败：', error)
  }
}

onLoad(() => {
  initialization()
})
</script>

<style lang="scss" scoped>
.collection-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 10px;

  .detail-container {
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    margin-top: 10px;
    box-shadow: var(--box-shadow-custom, 0 2px 8px rgba(0, 0, 0, 0.1));

    .detail-title {
      font-size: 20px;
      font-weight: 700;
      color: #333;
      margin-bottom: 15px;
      line-height: 1.5;
    }

    .detail-content {
      font-size: 15px;
      color: #666;
      line-height: 1.8;
      word-break: break-all;

      :deep(p) {
        margin: 10px 0;
      }

      :deep(img) {
        max-width: 100%;
        height: auto;
        border-radius: 6px;
        margin: 10px 0;
      }
    }
  }
}
</style>
