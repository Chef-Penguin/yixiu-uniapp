<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCollectionListApi } from '@/api/collection'
import { getNow } from '@/utils/index'
import RequestLoading from '@/utils/RequestLoading'

const router = useRouter()
const collections = ref([])
const search = ref('')
const sourceType = ['手册', '电路图', '其他']
const isLoading = ref(false)

async function initialization() {
  const { data } = await RequestLoading(getCollectionListApi, {
    name: search.value,
  })
  collections.value = data || []
  isLoading.value = false
}

// 跳转到详情页
function goToDetail(item) {
  if (item.targetId) {
    router.push({
      name: 'collectionDetail',
      query: {
        targetId: item.targetId,
      },
    })
  }
}

// 提取图片链接
function getImage(info) {
  if (!info)
    return null
  const regex = /<img[^>]+src=['"]([^'"]+)['"]+/i
  const match = info.match(regex)
  return match ? match[1] : null
}

// 格式化日期
function formatDate(timeStr) {
  if (!timeStr)
    return ''
  // 假设格式为 "2025-11-18 09:49:21"
  const datePart = timeStr.split(' ')[0]
  if (!datePart)
    return ''
  const [y, m, d] = datePart.split('-')
  return `${y}年${m}月${d}日`
}

onLoad(() => {
  initialization()
})
</script>

<template>
  <view class="tabbar-page">
    <CustomSearch v-model="search" @search="initialization" />
    <view class="collection-container">
      <van-pull-refresh
        v-model="isLoading"
        success-text="刷新成功"
        class="collection-container"
        @refresh="initialization"
      >
        <view v-for="item in collections" :key="item.id" class="collection-item" @click="goToDetail(item)">
          <view class="left-section">
            <view class="item-title">
              {{ item.name }}
            </view>
            <view class="item-summary">
              {{ item.summary }}
            </view>
            <view class="item-footer">
              <view class="source">
                {{ `来源名称 ${item.sourceName}` }}
              </view>
              <view class="time">
                {{ formatDate(item.createdTime) }}
              </view>
            </view>
          </view>
          <view v-if="getImage(item.imageInfo)" class="right-section">
            <img :src="getImage(item.imageInfo)" alt="">
          </view>
        </view>
      </van-pull-refresh>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.collection-container {
  padding-bottom: 20px;
  .collection-item {
    width: 100%;
    background: #fff;
    box-shadow: var(--box-shadow-custom);
    border-radius: 10px;
    margin-top: 15px;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.2s;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .left-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden; // 防止内容撑开

      .item-title {
        font-size: 16px;
        font-weight: 700;
        color: #333;
        margin-bottom: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .item-summary {
        font-size: 13px;
        color: #666;
        line-height: 1.5;
        margin-bottom: 8px;
        // 多行省略
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
      }

      .item-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: #999;

        .source {
          flex-shrink: 0;
        }

        .time {
          margin-left: auto;
          text-align: right;
        }
      }
    }

    .right-section {
      width: 110px;
      height: 80px;
      margin-left: 10px;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 6px;
      }
    }
  }
}
</style>
