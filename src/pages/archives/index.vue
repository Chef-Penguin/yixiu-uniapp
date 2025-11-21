<script setup>
import { showFailToast } from 'vant'
import { onMounted, ref } from 'vue'

import { commonFaultsApi, recentlyUpdatedApi } from '@/api/archives'
import { SERVER } from '@/config/env'

defineOptions({
  name: 'Home',
})
definePage({
  // 使用 type: "home" 属性设置首页，其他页面不需要设置，默认为page
  type: 'home',
  style: {
    // 'custom' 表示开启自定义导航栏，默认 'default'
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
})
const search = ref('')
// 仅使用文字分类
const categories = ['维修手册', '电路图', '维修案例', '故障说明']
const activeTagIndex = ref(null)
const rootSrc = SERVER
// 数据
const faults = ref([])
const informations = ref([])
function onLoad() {
  recentlyUpdatedApi().then((res) => {
    informations.value = res.data || []
  })
  commonFaultsApi().then((res) => {
    faults.value = res.data || []
  })
}
onMounted(() => {
  onLoad()
})
function onHandleClick(info) {
  uni.navigateTo({
    url: `/pages/chat/index?mode=default&data=${JSON.stringify(info)}`,
  })
}

// 处理常见故障点击事件
function onHandleFaultClick(fault) {
  uni.navigateTo({
    url: `/pages/chat/index?mode=fault&data=${JSON.stringify({
      name: fault.troubleDesc || fault.name,
      logId: fault.logId,
    })}`,
  })
}

// 选择分类 Tag（四选一）
function onSelectTag(index) {
  activeTagIndex.value = index
}

// 点击搜索按钮
function handleSearch(keyword) {
  const kw = String(keyword ?? search.value ?? '').trim()
  if (!kw)
    return showFailToast('请输入搜索内容')
  if (activeTagIndex.value === null)
    return showFailToast('请选择一个分类')
  const category = categories[activeTagIndex.value]
  const doc = { keyword: kw, category }
  uni.navigateTo({
    url: `/pages/chat/index?mode=search&data=${JSON.stringify(doc)}`,
  })
}
</script>

<template>
  <view overflow-y-auto class="tabbar-page f9">
    <CustomSearch v-model="search" @search="handleSearch" />
    <view class="tag-container">
      <view
        v-for="(name, index) in categories"
        :key="name"
        class="tag-item"
        :class="{ active: index === activeTagIndex }"
        @click="onSelectTag(index)"
      >
        {{ name }}
      </view>
    </view>
    <view class="content-container">
      <view class="new_arrivals c_c">
        <view class="header">
          资料上新
        </view>
        <view class="arrivals_container container">
          <view
            v-for="(info, index) in informations"
            :key="index"
            class="arrivals_item"
            :style="{ backgroundImage: `url(${rootSrc}/${info.images})` }"
            @click="onHandleClick(info)"
          >
            <text class="arrivals_item_text">
              {{ info.brandName }}
            </text>
            <text class="arrivals_item_text">
              {{ info.carName }}
            </text>
            <text class="arrivals_item_text">
              {{ info.style }}
            </text>
            <text class="arrivals_item_text">
              {{ info.type }}
            </text>
          </view>
        </view>
        <view class="view_new_arivals">
          <text>查看近期上新</text>
        </view>
      </view>

      <view class="common_aults c_c">
        <view class="header">
          常见故障
        </view>
        <view class="aults_container container">
          <!-- 循环渲染每个故障项 -->
          <view
            v-for="(fault, index) in faults"
            :key="index"
            class="aults_item"
            @click="onHandleFaultClick(fault)"
          >
            <text class="fault-desc">
              {{ fault.troubleDesc }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.tag-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: space-between;
  margin-top: 6px;

  .tag-item {
    padding: 6px 0; // 更扁
    flex: 1;
    text-align: center;
    border-radius: 8px; // 更小圆角
    background: #f2f2f2; // 灰底
    color: #333;
    font-size: 12px; // 字体更小
    box-shadow: var(--box-shadow-custom);
    cursor: pointer;
    user-select: none;
    line-height: 1.2;
  }
  .tag-item.active {
    background: #e0e0e0; // 选中更深一点
    outline: 2px solid #ffa360;
    font-weight: 600;
  }
}

.content-container {
  .c_c {
    margin-top: 30px;
    .header {
      font-size: 18px;
      font-weight: 500;
    }
    .container {
      padding: 15px 10px;
      margin-top: 10px;
      width: 100%;
      box-shadow: var(--box-shadow-custom);
      border-radius: 10px;
    }
  }
  .new_arrivals {
    .arrivals_container {
      height: 200px;
      display: flex;
      gap: 10px;
      overflow-x: scroll;
      .arrivals_item {
        height: 100%;
        width: 120px;
        display: flex;
        flex-shrink: 0;
        background-size: cover; /* 背景图自适应铺满 */
        background-position: center; /* 居中显示背景图 */
        background-repeat: no-repeat; /* 防止背景图重复 */
        align-items: center;
        flex-direction: column;
        justify-content: center;
        img {
          width: 100%;
        }
        .arrivals_item_text {
          text-align: center;
          color: #fff;
          margin: 2px 0;
          padding: 2px 0;
          border-radius: 5px;
        }
      }
    }
    .view_new_arivals {
      margin-top: 10px;
      text-align: center;
      p {
        padding: 2px 80px;
        background: #ffa360;
        display: inline-block;
        color: #fff;
        border-radius: 20px;
      }
    }
  }
}

.common_aults {
  .aults_container {
    height: auto; // 取消固定高度，由内容撑开
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: 300px;
    .aults_item {
      display: flex; // 图片和文字横向排列
      align-items: flex-start; // 顶部对齐
      padding: 8px 4px;
      border-bottom: 1px solid #eee; // 每个故障项底部边框
      .fault-img {
        width: 80px; // 图片宽度
        height: auto; // 保持图片比例
        flex-shrink: 0; // 防止图片被压缩
      }
      .fault-desc {
        flex: 1; // 文字占剩余宽度
        margin: 0; // 清除默认边距
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }
}
</style>
