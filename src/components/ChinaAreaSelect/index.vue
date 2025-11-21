<template>
  <div class="china-area-select">
    <van-area title="选择省市" :area-list="areaList" :columns-num="2" @confirm="onConfirm" @cancel="onCancel" />
  </div>
</template>

<script setup>
import { areaList as vantAreaList } from "@vant/area-data"

const props = defineProps({
  model: { type: Object, default: () => ({}) },
  prop: { type: String, default: "" },
  onChange: { type: Function },
})
const emits = defineEmits(["close-popup"])

const areaList = vantAreaList

const onConfirm = ({ selectedOptions, selectedValues }) => {
  const names = (selectedOptions || []).map((o) => o?.text).filter(Boolean)
  const codes = selectedValues || []
  const text = names.join(" ")
  if (typeof props.onChange === "function") {
    props.onChange({ text, codes, names })
  }
  emits("close-popup")
}
const onCancel = () => emits("close-popup")

defineOptions({ name: "ChinaAreaSelect" })
</script>

<style scoped>
.china-area-select {
  width: 100%;
}
</style>


