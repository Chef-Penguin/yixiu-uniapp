<template>
  <van-popup
    v-model:show="visible"
    :position="options.position ?? 'bottom'"
    :overlay="options.overlay ?? true"
    :close-on-click-overlay="options.closeOnOverlay ?? true"
    :style="style"
    @closed="handleClosed"
    @opened="handleOpened"
  >
    <component
      :is="options.component"
      v-bind="options.props"
      @close-popup="close"
    />
  </van-popup>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'PopupWrapper',
})
// import { Popup as VanPopup } from "vant"

const props = defineProps({
  options: { type: Object, required: true },
  onClosed: { type: Function, required: true },
})
const styleOptions = {
  height: '80%',
  width: '100%',
  borderRadius: '18px 18px 0 0',
  padding: '20px',
}
const style = computed(() => {
  if (props.options.style) {
    return Object.assign({}, styleOptions, props.options.style)
  }
  return styleOptions
})
const visible = ref(false)

function close() {
  visible.value = false
}
function handleOpened() {
  props.options.onOpened?.()
}
function handleClosed() {
  props?.onClosed?.()
}

defineExpose({ close, visible })
</script>
