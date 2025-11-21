import { createApp } from 'vue'
import PopupWrapper from '@/components/PopupWrapper/index.vue'

const componentContainer = {}

// 根据平台选择加载方式
// #ifdef H5
// H5 使用懒加载
const modules = import.meta.glob('/src/components/*/*.vue', { eager: false })
// #endif

// #ifndef H5
// APP 和小程序使用立即加载（避免代码分割问题）
const modules = import.meta.glob('/src/components/*/*.vue', { eager: true })
for (const key in modules) {
  if (Object.prototype.hasOwnProperty.call(modules, key)) {
    const element = modules[key]
    if (element.default && element.default.name) {
      componentContainer[element.default.name] = element.default
    }
  }
}
// #endif

export default {
  // #ifdef H5
  async open(options) {
    if (!options.component) {
      throw new Error(`组件${options.component}不存在`)
    }

    if (typeof document === 'undefined') {
      console.error('PopupService: document 不可用，无法创建弹窗')
      return
    }

    const container = document.createElement('div')
    document.body.appendChild(container)

    // H5 环境：懒加载组件
    if (typeof options.component === 'string') {
      const componentPath = Object.keys(modules).find((path) => {
        const match = path.match(/\/([^\/]+)\.vue$/)
        return match && match[1] === options.component
      })

      if (componentPath) {
        const module = await modules[componentPath]()
        options.component = module.default
      }
      else {
        console.error(`组件 ${options.component} 不存在`)
        return
      }
    }

    const app = createApp(PopupWrapper, {
      options,
      onClosed: () => {
        app.unmount()
        container.remove()
        options.onClose?.()
      },
    })

    const instance = app.mount(container)
    instance.visible = true
    return {
      close: () => {
        instance.close()
      },
    }
  },
  // #endif

  // #ifndef H5
  open(options) {
    console.warn('PopupService: 当前平台不支持弹窗功能')
    // APP 和小程序环境：暂时不支持（因为使用了 document API）
    // 如果需要支持，应该使用 uni.showModal 等原生 API
    return {
      close: () => {},
    }
  },
  // #endif
}
