<script setup>
import { showFailToast } from 'vant'
import { nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAiSummary, getCreteChatLog, sendMsg } from '@/api/chat'
import Toolbar from '@/components/Toolbar/index.vue'
import { useCarStore } from '@/store/car'
import { useLogStore } from '@/store/log'
import { useUserStore } from '@/store/user'
import { getNow } from '@/utils/index'
import RequestLoading from '@/utils/RequestLoading'
import MessageBubble from './MessageBubble.vue'

// const logStore = useLogStore()
const showBottom = ref(false)
const router = useRouter()
const route = useRoute()
// const userStore = useUserStore()
const form = ref({
  richText: '',
  title: '',
})
// 聊天消息数据
const messages = ref([
  {
    id: 1,
    type: 'robot',
    content: '您好！我是一修师傅，有什么可以帮您的吗？',
    time: getNow(),
    timestamp: new Date().toISOString(),
    select_car_model: true,
  },
])

const chatDeepSeekDTO = ref([])
const searchData = ref({
  searchMsg: '',
})
const isLoading = ref(false)
const { codes } = useCarStore()
const messageContentRef = ref(null)
function setScrollTop() {
  nextTick(() => {
    const el = messageContentRef.value
    if (el)
      el.scrollTop = el.scrollHeight
  })
}
// 添加消息的方法
async function setMessages(msg, mode = 'default', ...args) {
  isLoading.value = true
  const userMessage = {
    id: messages.value.length + 1,
    type: 'user',
    content: msg,
    time: getNow(),
    timestamp: new Date().toISOString(),
  }
  const robotMessage = {
    id: messages.value.length + 2,
    type: 'robot',
    content: '',
    time: '',
  }
  messages.value.push(userMessage)
  messages.value.push(robotMessage)
  setScrollTop()
  await onRequestMessage(msg, mode, ...args)
}
async function onRequestMessage(msg, mode = 'default', ...args) {
  chatDeepSeekDTO.value.push({ role: 'user', content: msg })
  try {
    let params
    if (mode === 'fault') {
      params = {
        chatDeepSeekDTO: chatDeepSeekDTO.value,
        sourceId: args[0],
        source: 'COMMON_FAULTS',
      }
    }
    else if (mode === 'search') {
      params = { chatDeepSeekDTO: chatDeepSeekDTO.value, sourceId: '资料检索' }
    }
    else {
      params = {
        sourceId: codes.manual_id,
        chatDeepSeekDTO: chatDeepSeekDTO.value,
      }
    }
    const { data = {}, code, detail = '' } = await sendMsg(params)
    if (code !== 200)
      throw new Error(detail)
    const lastIdx = messages.value.length - 1
    messages.value[lastIdx] = { ...messages.value[lastIdx], ...data }
    chatDeepSeekDTO.value.push({ role: 'assistant', content: data.content })
    messages.value[lastIdx].time = getNow()
    messages.value[lastIdx].timestamp = new Date().toISOString()
    setScrollTop()
  }
  catch (error) {
    const lastIdx = messages.value.length - 1
    messages.value[lastIdx].content = error.message
    showFailToast(error.message)
  }
  finally {
    isLoading.value = false
  }
}
function onSendMessage() {
  if (!searchData.value.searchMsg.trim())
    return showFailToast('请输入消息内容')
  const submitMsg = searchData.value.searchMsg
  setMessages(submitMsg)
  searchData.value.searchMsg = ''
}
const submitData = ref(null)
function handleRichTextSubmit(value) {
  submitData.value = value
  titleShow.value = true
}
onMounted(async () => {
  const mode = route.query.mode || null
  if (mode) {
    const data = JSON.parse(route.query.data || 'null')
    switch (mode) {
      case 'default':
        await setMessages(
          `我想查看${data.brandName}${data.carName}${data.style}${data.type}`,
          mode,
        )
        break
      case 'fault':
        await setMessages(`我想了解${data.name}常见故障`, mode, data.logId)
        break
      case 'search':
        await setMessages(`我想了解${data.keyword}的${data.category}`, mode)
        break
      case 'vin':
        await setMessages(`我想修车，车架号为${data.vinCode}。`, mode)
        break
    }
  }
  // // 处理车型信息查询
  // const queryInfo = JSON.parse(route.query.info || "null")
  // if (queryInfo) {
  //   await setMessages(
  //     `我想查看${queryInfo.brandName}${queryInfo.carName}${queryInfo.style}${queryInfo.type}`,
  //     "default"
  //   )
  //   return
  // }

  // // 处理故障信息查询
  // const faultInfo = JSON.parse(route.query.fault || "null")
  // if (faultInfo && faultInfo.type === "fault") {
  //   const faultName = faultInfo.name || ""
  //   await setMessages(`我想了解${faultName}常见故障`, "fault", faultInfo.logId)
  //   return
  // }

  // // 处理资料检索（输入+分类）
  // const docInfo = JSON.parse(route.query.doc || "null")
  // if (docInfo && docInfo.type === "doc") {
  //   const keyword = docInfo.keyword || ""
  //   const category = docInfo.category || ""
  //   await setMessages(`我想了解${keyword}的${category}`, "doc")
  // }

  // //扫描车架号跳转
  // const vinInfo = JSON.parse(route.query.vin || "null")
  // if (vinInfo && vinInfo.type === "vin") {
  //   const vin = vinInfo.vin || ""
  //   await setMessages(`我想修车，车架号为${vin}。`, "vin")
  // }
})

/**
 * 将后端返回的 summaryContent 数据格式化为 HTML
 * @param {object} data - 后端返回的数据对象
 * @returns {string} - 格式化后的 HTML 字符串
 */
function formatSummaryToHtml(data) {
  if (!data)
    return ''

  let html = ''
  if (data.type) {
    html += `<p>类型: #${data.type}</p>`
  }
  if (data.field) {
    html += `<p>领域: #${data.field}</p>`
  }
  if (data.brand) {
    html += `<p>品牌: #${data.brand}</p>`
  }
  if (data.model) {
    html += `<p>车型: #${data.model}</p>`
  }

  if (data.modelYear) {
    html += `<p>年款: #${data.modelYear}</p>`
  }

  // 故障现象
  if (data.faultPhenomenon && data.faultPhenomenon.length > 0) {
    html += `<p><b>故障现象</b></p>`
    if (data.field) {
      html += `<p>#${data.field} <span>▼</span></p>`
    }
    data.faultPhenomenon.forEach((item) => {
      html += `<p>${item}</p>`
    })
  }

  // 故障分析
  if (data.faultAnalysis && data.faultAnalysis.length > 0) {
    html += `<p><b>故障分析</b></p>`
    html += '<ul>'
    data.faultAnalysis.forEach((item) => {
      html += `<li>${item}</li>`
    })
    html += '</ul>'
  }

  // 故障修复
  if (data.faultRepair && data.faultRepair.length > 0) {
    html += `<p><b>故障修复</b></p>`
    html += '<ul>'
    data.faultRepair.forEach((item) => {
      html += `<li>${item}</li>`
    })
    html += '</ul>'
  }

  return html
}

async function onHandleEnd() {
  const params = {
    userId: userStore.user.userId,
    brand: logStore.logData.carBrand,
    modelYear: logStore.logData.vehicleModelYear,
    model: logStore.logData.vehicleModelYear,
    questionAnswerLst: chatDeepSeekDTO.value,
  }

  const response = await RequestLoading(getAiSummary, params)
  if (response.code === 200) {
    const summaryContent = response.data
    form.value.richText = formatSummaryToHtml(summaryContent)
    showBottom.value = true
  }
  else {
    showFailToast(response.detail)
  }
}
const titleShow = ref(false)
async function onConfirmNamingLog() {
  if (form.value.title.trim() === '') {
    showFailToast('请输入日志名称')
    return
  }
  const res = messages.value.map((item) => {
    return {
      content: item.content,
      createTime: item.timestamp,
      type: item.type == 'robot' ? 1 : 0,
    }
  })

  // 从富文本内容中提取标题和总结内容
  const htmlContent = submitData.value.html || ''
  const plainText = htmlContent.replace(/<[^>]*>/g, '').trim()

  // 使用纯文本内容的前50个字符作为标题，如果没有内容则使用默认标题
  const title = plainText.substring(0, 50) || 'AI助手对话记录'

  // 使用纯文本内容作为总结内容
  const summaryContent = plainText || 'AI助手对话总结'

  // 处理图片URL，多个图片用逗号隔开
  const images
    = submitData.value.images && submitData.value.images.length > 0
      ? submitData.value.images.join(',')
      : ''

  const params = {
    userId: userStore.user.userId,
    title: form.value.title,
    summaryContent,
    images,
    contentList: res, // 这里用当前消息的 contentList
  }
  // 追加车型信息（如果已选择）
  const { carBrand, carSeries, vehicleModelYear } = logStore.logData || {}
  if (carBrand)
    params.carBrand = carBrand
  if (carSeries)
    params.carSeries = carSeries
  if (vehicleModelYear)
    params.vehicleModelYear = vehicleModelYear
  try {
    const response = await getCreteChatLog(params)
  }
  catch (error) {
    messages.value[messages.value.length - 1].content = error.message
    showFailToast(error.message)
  }
  finally {
    isLoading.value = false
  }
  titleShow.value = false
  router.push({
    path: '/log',
    query: {
      fromCreateLog: true,
    },
  })
}
</script>

<template>
  <div overflow-y-auto p-2 class="chat h100%" @keydown.enter="onSendMessage">
    <div ref="messageContentRef" class="message-content">
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />
    </div>
    <div class="btn-container">
      <div class="btn-end" @click="onHandleEnd">
        结束
      </div>
    </div>
    <div class="input-field">
      <van-button type="default" plain>
        <van-icon name="voice" size="20" />
      </van-button>
      <input
        v-model="searchData.searchMsg"
        type="text"
        placeholder="请输入消息..."
        class="border border-black rounded-full bg-[#EAEAEA] px-4 outline-none"
      >
      <van-button
        class="send"
        type="primary"
        :loading="isLoading"
        :disabled="isLoading"
        @click="onSendMessage"
      >
        ⬆
      </van-button>
    </div>

    <van-popup v-model:show="showBottom" position="bottom">
      <Toolbar v-model:html="form.richText" @publish="handleRichTextSubmit" />
    </van-popup>

    <van-dialog
      v-model:show="titleShow"
      :show-confirm-button="false"
      close-on-click-overlay
    >
      <div class="bookmark-dialog">
        <div class="bookmark-title">
          日志命名
        </div>
        <input v-model="form.title" type="text" class="bookmark-input">
        <van-button
          class="bookmark-btn"
          type="primary"
          @click="onConfirmNamingLog"
        >
          确认
        </van-button>
      </div>
    </van-dialog>
  </div>
</template>

<style scoped lang="scss">
.van-button--normal.send {
  border-radius: 50%;
  background: #fff;
  border: 2px solid #000;
  width: 40px;
  height: 40px;
  font-size: 26px;
}

.chat {
  position: relative;
  --input-field-height: 60px;
  --header-height: 50px;
  --btn-height: 50px;

  .message-content {
    height: calc(100% - var(--input-field-height) - var(--btn-height));
    overflow-y: auto;
    padding: 10px 0;
  }

  .btn-container {
    position: fixed;
    bottom: calc(var(--input-field-height) + 10px);
    width: calc(100% - var(--spacing) * 2 * 2);
    display: inline-block;
    text-align: right;
    padding: 0 10px;
    box-sizing: border-box;

    div {
      display: inline-block;
    }

    .btn-end {
      padding: 0px 24px;
      background: #d9d9d9;
    }
  }

  .input-field {
    position: fixed;
    bottom: 0;
    width: calc(100% - var(--spacing) * 2 * 2);
    padding: 8px 8px;
    display: flex;
    gap: 10px;
    border-top: 1px solid #eee;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    height: var(--input-field-height);

    input {
      flex: 0 0 76%;
      height: 100%;
    }

    .flow-button {
      position: relative;
    }
  }
}
</style>
