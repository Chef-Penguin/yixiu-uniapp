<template>
  <div class="message-item">
    <!-- 机器人消息 -->
    <div v-if="message.type === 'robot'" class="message-robot">
      <img src="https://picsum.photos/id/64/40/40" alt="Robot" class="avatar">
      <div class="bubble bubble-robot">
        <span v-if="message.content"><span v-html="message.content" /></span>
        <CssLoader17 v-else />
        <span v-if="message.isTyping" class="typing-cursor">|</span>
      </div>
    </div>
    <!-- 用户消息 -->
    <div v-else class="message-user">
      <div class="bubble bubble-user">
        {{ message.content }}
      </div>
      <img :src="userStore.user.avatar" alt="User" class="avatar">
    </div>
    <div class="btn-container">
      <p
        v-if="message.selectCarModel"
        class="check-car btn-default"
        @click="onHandleClick('select')"
      >
        选中车型
      </p>
      <p
        v-if="message.viewManual"
        class="view-manual btn-default"
        @click="onHandleClick"
      >
        查看手册
      </p>
      <p
        v-if="message.viewCd"
        class="view-circuit btn-default"
        @click="onHandleClick"
      >
        查看电路图
      </p>
    </div>
    <!-- <div class="message-time">{{ message.time }}</div> -->
  </div>
</template>

<script setup>
import PopupService from '@/utils/PopupService'
import CssLoader17 from './CssLoader17.vue'

defineProps({
  message: {
    type: Object,
    required: true,
    properties: {
      id: { type: Number, required: true },
      type: {
        type: String,
        required: true,
        validator: v => ['robot', 'user'].includes(v),
      },
      content: { type: String, required: true },
      displayContent: { type: String },
      isTyping: { type: Boolean },
      time: { type: String, required: true },
    },
  },
})
// const userStore = useUserStore()
const server = import.meta.env.VITE_SERVER
async function onHandleClick(type) {
  // 点击查询有关关键字的目录结构
  const options = {
    component: type === 'select' ? 'SelectCarModel' : 'SearchContent',
    prop: {},
    style:
      type === 'select'
        ? { padding: '20px 0', height: '80%' }
        : { height: '80%' },
  }
  PopupService.open(options)
}
</script>

<style scoped lang="scss">
.message-time {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin: 5px 0;
  margin-bottom: 15px;
}

.message-robot,
.message-user {
  display: flex;
  align-items: flex-start;
}

.message-robot {
  justify-content: flex-start;
}

.message-user {
  justify-content: flex-end;
}

.btn-container {
  margin-top: 8px;
  padding-left: 60px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.btn-default {
  text-align: center;
  padding: 1px 50px;
  border: 2px solid #f46205;
  color: #f46205;
  display: inline-block;
  width: auto;
  box-sizing: content-box;
  border-radius: 10px;
}

.view-manual {
}

.view-circuit {
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 10px;
  border: 1px solid #a2a2a2;
}

.bubble {
  max-width: 70%;
  padding: 14px 20px;
  border-radius: 18px;
  word-wrap: break-word;
  line-height: 1.5;
  background: #fff;
  box-shadow: 0px 0px 16px 0px #a2a2a233;
}

.bubble-robot {
  // background-color: #f0f0f0;
  border-bottom-left-radius: 0px;
  border-top-right-radius: 0px;
}

.bubble-user {
  // background-color: #07c160;
  // color: white;
  border-bottom-right-radius: 0px;
  border-top-left-radius: 0px;
}

.view-document {
  text-align: center;

  &:active {
    color: blue;
  }
}

.typing-cursor {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  from,
  to {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}
</style>
