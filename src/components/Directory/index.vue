<template>
  <div class="title">
    目录
  </div>
  <div class="tree-panel">
    <TreeNode
      v-for="(node, idx) in treeData"
      :key="node.id ?? idx"
      :node="node"
      :level="0"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script setup>
import { closeToast, showFailToast, showLoadingToast } from 'vant'
import { onMounted, provide, reactive, ref } from 'vue'
import { getDetailDirectory } from '@/api/chat'
import PopupService from '@/utils/PopupService'
import TreeNode from './TreeNode.vue'

defineOptions({
  name: 'Directory',
})

// 递归规范化：确保每个节点是对象，包含 id/value/plainText/children
function normalizeTree(data, parentIndex = '') {
  return (data || []).map((item, index) => {
    const idx = parentIndex ? `${parentIndex}-${index}` : `${index}`
    if (typeof item === 'string') {
      const value = item
      return {
        id: value,
        value,
        plainText: value.replace(/<[^>]+>/g, ''),
        children: [],
        index: idx,
      }
    }
    else {
      const value = item.value ?? ''
      return {
        id: item.id ?? value ?? idx,
        value,
        plainText: String(value).replace(/<[^>]+>/g, ''),
        children: item.children ? normalizeTree(item.children, idx) : [],
        index: idx,
      }
    }
  })
}

const treeData = ref([])

// 共享一个响应式 Set 来记录已展开节点 id（reactive 支持 Set）
const expandedSet = reactive(new Set())
provide('expandedSet', expandedSet)
provide('toggleExpanded', (id) => {
  if (!id)
    return
  if (expandedSet.has(id))
    expandedSet.delete(id)
  else expandedSet.add(id)
})

async function initialization() {
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    const res = await getDetailDirectory(9084)
    // 清空展开状态（切换数据时）
    expandedSet.clear()
    treeData.value = normalizeTree(res.data.children || [])
  }
  catch (err) {
    showFailToast(err?.message || '加载失败')
    console.error(err)
  }
  finally {
    closeToast()
  }
}

function handleNodeClick(node) {
  // 叶子节点打开内容弹窗
  if (node.children && node.children.length)
    return
  PopupService.open({
    component: 'DocumentContent',
    props: { id: node.id },
  })
}

onLoad(initialization)
</script>

<style scoped>
.title {
  font-size: 24px;
  text-align: center;
  color: #333;
}
.tree-panel {
  width: 100%;
  box-sizing: border-box;
  margin-top: 24px;
}
</style>
