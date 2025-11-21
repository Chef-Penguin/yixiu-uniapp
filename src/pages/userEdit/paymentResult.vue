<template>
  <div class="payment-result">
    <van-loading v-if="loading" type="spinner" size="24px" vertical>
      处理支付结果中...
    </van-loading>
    <div v-else class="result-content">
      <van-icon v-if="success" name="success" color="#07c160" size="60" />
      <van-icon v-else name="cross" color="#ee0a24" size="60" />
      <div class="result-text">{{ resultText }}</div>
      <van-button type="primary" @click="goBack" block>
        返回
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const success = ref(false);
const resultText = ref('');

onMounted(() => {
  // 从URL参数中获取支付结果
  const { status, out_trade_no, trade_no } = route.query;

  loading.value = false;

  if (status === 'success' || status === '9000') {
    success.value = true;
    resultText.value = '支付成功';
    showToast('支付成功');

    // 可以在这里调用后端接口验证支付结果
    // verifyPayment(out_trade_no, trade_no);
  } else if (status === 'cancel' || status === '6001') {
    success.value = false;
    resultText.value = '支付已取消';
  } else {
    success.value = false;
    resultText.value = '支付失败';
  }
});

const goBack = () => {
  router.push('/');
};
</script>

<style lang="scss" scoped>
.payment-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;

  .result-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
    max-width: 400px;

    .result-text {
      font-size: 18px;
      font-weight: 500;
      color: #333;
      text-align: center;
    }

    .van-button {
      margin-top: 20px;
      border-radius: 20px;
    }
  }
}
</style>