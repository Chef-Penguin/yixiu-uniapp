<template>
  <div class="edit-log-page">
    <van-icon size="30" name="arrow-left" @click="handleGoBack" />
    <van-field v-model="form.title" placeholder="" />
    <Toolbar
      v-model:html-value="form.richText"
      @publish="handleRichTextSubmit"
    />
    <!-- <van-checkbox v-model="form.syncToCircle">
      同步到修车圈[预留功能]
    </van-checkbox> -->
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCarCount, getLog, getUpdateChatLog } from '@/api/log'
import Toolbar from '@/components/Toolbar/index.vue'
import { useUserStore } from '@/store/user'
import RequestLoading from '@/utils/RequestLoading'

// const userStore = useUserStore()

const router = useRouter()
const form = ref({
  title: '',
  richText: '',
  images: [],
  syncToCircle: false,
})

function handleGoBack() {
  router.push({ name: 'log' })
}

// 上传图片

async function logAddImage() {
  console.log('上传')
}

async function handleFileSelect(e) {
  console.log(e)
}
let imageArr = []
function handleImageUploaded(msg) {
  console.log('从子组件接收的图片地址:', msg)
  imageArr.push(msg)
}

async function handleRichTextSubmit(content) {
  try {
    const response = await RequestLoading(getUpdateChatLog, {
      id: parsedData,
      userId: userStore.user.userId,
      title: form.value.title,
      summaryContent: content.html,
      images: Array.isArray(content.images) ? content.images.join(',') : '',
    })
    if (response.code === 200) {
      if (parsedData) {
        handleGoBack()
      }
    }
  }
  catch (error) {
    console.error('接口请求失败：', error)
  }
}

const route = useRoute()
let parsedData = null
onLoad(() => {
  const { data } = route.query
  if (data) {
    parsedData = JSON.parse(data)
    console.log('接收的数据:', parsedData)
  }
  initialization()
})
async function initialization() {
  try {
    const response = await getLog(parsedData)
    console.log('完整响应数据：', response)
    await nextTick()
    form.value.richText = response.data.summaryContent
    form.value.title = response.data.title
    const imgs
      = typeof response.data.images === 'string'
        ? response.data.images
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : []
    form.value.images = imgs
    console.log('赋值后的数据：', form.value.richText)
  }
  catch (error) {
    console.error('接口请求失败：', error)
  }
}
</script>

<style scoped>
.edit-log-page {
  padding: 10px;
}
.image-upload-area {
  display: flex;
  flex-wrap: wrap;
  margin: 10px 0;
}
.image-item {
  position: relative;
  width: 80px;
  height: 80px;
  margin-right: 10px;
  margin-bottom: 10px;
}
.uploaded-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.delete-img {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}
.imgfan {
  width: 16px;
  height: 16px;
}
:deep(.van-cell) {
  background: #fff;
}
</style>
