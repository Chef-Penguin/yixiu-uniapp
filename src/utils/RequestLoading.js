export default function (request, ...args) {
  return new Promise(async (resolve, reject) => {
    try {
      uni.showToast({
        title: '加载中...',
        icon: 'none',
      })
      const res = await request(...args)
      resolve(res)
      uni.hideToast()
    }
    catch (error) {
      reject(error)
      const closeToastTimer = setTimeout(() => {
        uni.hideToast()
        clearTimeout(closeToastTimer)
      }, 2000)
    }
  })
}
