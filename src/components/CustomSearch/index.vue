<template>
  <div class="search-container">
    <input type="text" v-model="searchValue" placeholder="" @input="emit('input-search', $event.target.value)"
      class="search-input" />
    <van-button class="search-btn" type="primary" size="small" @click="onHandleSearch">
      <van-icon name="search" size="26" color="#fff" />
    </van-button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
})
const emit = defineEmits(["update:modelValue", "search", 'input-search'])
const searchValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit("update:modelValue", val)
  },
})
const onHandleSearch = () => {
  emit("search", searchValue.value)
}
</script>

<style scoped>
.search-container {
  display: flex;
  width: 100%;
  border: 2px solid #FF915B;
  border-radius: 20px;
  overflow: hidden;
  height: var(--van-search-height);
  align-items: center;
}

.search-input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: none;
  outline: none;
  font-size: 14px;
}

.search-btn {
  border-radius: 20px;
  height: 40px;
  min-width: 60px;
  padding: 0;
  border: 2px solid #fff;
  background: #000;
}
</style>
