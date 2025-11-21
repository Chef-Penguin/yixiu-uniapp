<template>
  <div>
    <div ref="alipayFormContainer"></div>
    <van-loading v-if="loading" type="spinner" size="24px" vertical>支付中...</van-loading>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAlipay } from "@/api/user";
import { useRoute, useRouter } from "vue-router";
import { showToast } from 'vant';

const route = useRoute();
const router = useRouter();
const alipayFormContainer = ref(null);
const loading = ref(true);

// 判断是否在APP环境中
const isInApp = () => {
  return typeof plus !== 'undefined' || typeof uni !== 'undefined';
};

const onLoad = async () => {
  console.log("query", route.query.type);
  let orderAmount, typeData;

  if (route.query.type === "0") {
    orderAmount = 29.99;
    typeData = "0";
  } else {
    orderAmount = 299.99;
    typeData = "1";
  }

  try {
    const responseCar = await getAlipay({
      orderAmount: orderAmount,
      paymentStatus: "WAIT_BUYER_PAY",
      paymentType: "0",
      productInfo: "智能维修服务套餐",
      orderRemark: "",
      type: typeData,
    });

    console.log("后端返回数据：", responseCar);

    // 如果在APP环境中，使用uni-app的支付API
    if (isInApp()) {
      handleAppPayment(responseCar);
    } else {
      // H5环境，使用表单提交
      handleH5Payment(responseCar);
    }
  } catch (error) {
    loading.value = false;
    console.error("接口请求失败：", error);
    showToast('支付请求失败，请稍后重试');
  }
};

// APP环境支付处理
const handleAppPayment = (orderInfo) => {
  loading.value = false;

  // 使用uni-app的支付API
  uni.requestPayment({
    provider: 'alipay',
    orderInfo: orderInfo, // 后端返回的支付宝订单信息
    success: (res) => {
      console.log('支付成功:', res);
      showToast('支付成功');
      // 跳转到支付成功页面或返回
      setTimeout(() => {
        router.back();
      }, 1500);
    },
    fail: (err) => {
      console.error('支付失败:', err);
      if (err.errMsg.includes('cancel')) {
        showToast('支付已取消');
      } else {
        showToast('支付失败');
      }
      setTimeout(() => {
        router.back();
      }, 1500);
    }
  });
};

// H5环境支付处理
const handleH5Payment = (payFormHtml) => {
  if (alipayFormContainer.value && payFormHtml) {
    setTimeout(() => {
      alipayFormContainer.value.innerHTML = payFormHtml;
      const form = document.querySelector('form[name="punchout_form"]');
      if (form) {
        loading.value = false;
        form.submit();
      } else {
        loading.value = false;
        console.error("表单元素不存在，检查HTML结构");
        showToast('支付表单加载失败');
      }
    }, 0);
  } else {
    loading.value = false;
    console.error("容器未挂载或表单HTML为空");
    showToast('支付信息加载失败');
  }
};

onMounted(() => {
  onLoad();
});
</script>

<style scoped>
.van-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>