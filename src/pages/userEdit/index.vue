<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getRoleLevelListApi, getUserInfo, sendPictureApi, sendUserInfoApi } from '@/api/user'
import PopupService from '@/utils/PopupService'
import RequestLoading from '@/utils/RequestLoading'

const router = useRouter()
const route = useRoute()
// const userStore = useUserStore()
const formData = ref({
  picture: '',
  name: '',
  sex: '',
  role: '',
  workAge: '',
  level: '',
  address: '',
  skills: [],
  picture_text: '',
  name_text: '',
  sex_text: '',
  role_text: '',
  workAge_text: '',
  level_text: '',
  address_text: '',
  skills_text: '',
})
const imgSrc = ref('')
const configList = ref({
  levelList: [],
  addressList: [],
  roleList: [],
})
async function onAvatarChange(e) {
  const f = e.target.files && e.target.files[0]
  if (!f)
    return
  if (!f.type || !f.type.startsWith('image/')) {
    console.warn('Only image files are allowed')
    return
  }
  // 先显示本地预览
  const reader = new FileReader()
  reader.onload = (event) => {
    imgSrc.value = event.target.result
  }
  reader.readAsDataURL(f)

  const formDataToUpload = new FormData()
  formDataToUpload.append('file', f)
  try {
    const { msg } = await RequestLoading(sendPictureApi, formDataToUpload)
    formData.value.picture = msg
    // 上传成功后更新为服务器地址
    imgSrc.value = `${import.meta.env.VITE_SERVER}/${msg}`
  }
  catch (error) {
    // 上传失败时保持本地预览
    console.error('头像上传失败:', error)
  }
}
function onHandleImg() {
  document.querySelector('input[type="file"]').click()
}
function onHandlePop(key) {
  const current = optionsContainer.value.find(i => i.props === key)
  PopupService.open({
    component:
      key === 'skills'
        ? 'AreasExpertise'
        : key === 'address'
          ? 'ChinaAreaSelect'
          : 'UserConfig',
    style: {
      height: '80%',
    },
    props: {
      columns: current?.columns || [],
      title: current.label,
      prop: key,
      model: formData.value,
      onChange: (val) => {
        if (key === 'address' && val && typeof val === 'object') {
          formData.value.address = val.codes
          formData.value.address_text = val.text
        }
        else if (key === 'skills' && val && typeof val === 'object') {
          const text = []
          formData.value[key] = val
          configList.value.addressList.forEach((item) => {
            if (val.includes(item.code)) {
              text.push(item.name)
            }
          })
          formData.value[`${key}_text`] = text.join(' / ')
        }
        else {
          formData.value[key] = val[0].value
          formData.value[`${key}_text`] = val[0].text
        }
        if (key === 'workAge_text') {
          formData.value.workAge = val[0].value // 将选择的 value（如 "15"）赋值给 workAge（后台需要）
          formData.value.workAge_text = val[0].text // 将选择的 text（如 "15年"）赋值给 workAge_text（页面显示）
        }
      },
    },
  })
}
function goBack() {
  history.back()
}
function onGoToField() {
  router.push({ path: '/field', query: { a: 1 } })
}
async function save() {
  // sendUserInfoApi
  const {
    picture,
    name_text,
    sex,
    role,
    workAge,
    level,
    address,
    skills,
    address_text,
  } = formData.value
  const params = {
    picture,
    name: name_text,
    sex,
    role,
    workAge,
    level,
    address: address_text.split(' ').join(','),
    skills: skills.join(','),
  }
  try {
    const res = await RequestLoading(sendUserInfoApi, params)
    // 保存成功后重新获取用户信息以更新store中的数据
    const { data: userInfo } = await RequestLoading(getUserInfo)
    userStore.login({
      name: userInfo.name,
      avatar: userInfo.picture,
      userId: userInfo.id,
      repairCount: userInfo.repairCount,
      day: userInfo.day,
      isPro: userInfo.isPro,
    })
    router.push('/')
  }
  catch (error) {}
}
const optionsContainer = computed(() => [
  { label: '头像', props: 'picture', handle: onHandleImg },
  { label: '昵称', props: 'name' },
  {
    label: '性别',
    props: 'sex',
    handle: onHandlePop,
    columns: [
      { text: '男', value: '1' },
      { text: '女', value: '2' },
    ],
  },
  {
    label: '角色',
    props: 'role',
    columns: configList.value.roleList,
    handle: onHandlePop,
  },
  {
    label: '擅长领域',
    props: 'skills',
    handle: onHandlePop,
    columns: configList.value.addressList,
  },
  {
    label: '工龄',
    props: 'workAge',
    handle: onHandlePop,
    columns: [
      { text: '1年', value: '1' },
      { text: '2年', value: '2' },
      { text: '3年', value: '3' },
      { text: '4年', value: '4' },
      { text: '5年', value: '5' },
      { text: '6年', value: '6' },
      { text: '7年', value: '7' },
      { text: '8年', value: '8' },
      { text: '9年', value: '9' },
      { text: '10年', value: '10' },
      { text: '11年', value: '11' },
      { text: '12年', value: '12' },
      { text: '13年', value: '13' },
      { text: '14年', value: '14' },
      { text: '15年', value: '15' },
    ],
  },
  {
    label: '级别',
    props: 'level',
    columns: configList.value.levelList,
    handle: onHandlePop,
  },
  { label: '城市', props: 'address', handle: onHandlePop },
])
async function getOptions() {
  const { data } = await getRoleLevelListApi()
  const keys = ['levelList', 'addressList', 'roleList']
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const element = data[key]
      configList.value[keys[Number(key) - 1]] = element.map(i => ({
        text: i.name,
        value: i.code,
        ...i,
      }))
    }
  }
}
async function initialization() {
  if (!route.query?.first) {
    console.log('不是新用户')
    try {
      const { data: user } = await getUserInfo()

      // 基础字段
      formData.value.picture = user.picture || ''
      formData.value.name = user.name || ''
      formData.value.sex = String(user.sex || '')
      formData.value.role = String(user.role || '')
      formData.value.workAge = String(user.workAge || '')
      formData.value.level = String(user.level || '')
      formData.value.address = user.address || ''
      formData.value.skills = user.skills ? user.skills.split(',') : []

      // -------- 回显 text 部分 --------
      // 头像
      imgSrc.value = user.picture
        ? `${import.meta.env.VITE_SERVER}/${user.picture}`
        : ''
      // 昵称
      formData.value.name_text = user.name || ''

      // 性别
      formData.value.sex_text
        = user.sex === 1 ? '男' : user.sex === 2 ? '女' : ''

      // 角色
      const roleItem = configList.value.roleList.find(
        i => String(i.value) === String(user.role),
      )
      formData.value.role_text = roleItem ? roleItem.text : ''

      // 工龄
      formData.value.workAge_text = user.workAge ? `${user.workAge}年` : ''
      // 级别
      const levelItem = configList.value.levelList.find(
        i => String(i.value) === String(user.level),
      )
      formData.value.level_text = levelItem ? levelItem.text : ''

      // 地址
      formData.value.address_text = user.address || ''

      // 擅长领域
      if (formData.value.skills.length) {
        const skillsName = []
        configList.value.addressList.forEach((item) => {
          if (formData.value.skills.includes(String(item.value))) {
            skillsName.push(item.text)
          }
        })
        formData.value.skills_text = skillsName.join(' / ')
      }
    }
    catch (error) {
      console.error('加载用户信息失败:', error)
    }
  }
}

onLoad(async () => {
  await getOptions() // 先加载字典
  await initialization() // 再回显数据
})
</script>

<template>
  <div class="tabbar-page user-edit-page">
    <header class="edit-header">
      <van-icon size="30" name="arrow-left" @click="goBack" />
      <!-- <button class="back" @click="goBack" aria-label="返回">
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="#333"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button> -->
      <div class="title">
        个人资料
      </div>
      <button class="save" @click="save">
        保存
      </button>
    </header>

    <main class="content">
      <div
        v-for="(item, index) in optionsContainer"
        :key="index"
        class="form_item"
      >
        <div class="form_label">
          {{ item.label }}
        </div>
        <div
          class="form_right"
          @click="item.handle ? item.handle(item.props) : null"
        >
          <div v-if="item.props === 'picture'">
            <input
              style="display: none"
              type="file"
              accept="image/*"
              @change="onAvatarChange"
            >
            <img
              v-if="imgSrc"
              :src="imgSrc"
              alt="avatar"
              style="width: 50px; height: 50px"
            >
            <div
              v-else
              style="width: 50px; height: 50px; background: #acacac"
            />
          </div>
          <template v-else>
            <input
              v-if="item.props === 'name'"
              v-model="formData[`${item.props}_text`]"
              type="text"
              :placeholder="
                formData[`${item.props}_text`] ? '' : `请输入${item.label}`
              "
              class="form_input"
              @click.stop
            >
            <div
              v-else
              class="form_value"
              :class="{ form_value_empty: !formData[`${item.props}_text`] }"
            >
              {{ formData[`${item.props}_text`] || `请选择${item.label}` }}
            </div>
          </template>
          <svg
            v-if="item.props !== 'name'"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="form_arrow"
          >
            <path
              d="M9 6L15 12L9 18"
              stroke="#999"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.tabbar-page {
  padding: 0;
}

.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #000;
}

.edit-header .title {
  font-weight: 600;
}

.back,
.save {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.content {
  /* padding: 16px; */
  display: flex;
  flex-direction: column;
}

.form_item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 58px;
  padding: 16px 30px;
  border-bottom: 1px solid #000;
}

.form_label {
  color: #999;
  font-size: 14px;
  flex-shrink: 0;
}

.form_item .form_right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
  padding-right: 0;
}

.form_item .form_right .form_input {
  flex: 0 0 auto;
  width: auto;
  text-align: right;
  border: none;
  outline: none;
  background: transparent;
  color: #333;
  font-size: 14px;
  max-width: 200px;
}

.form_item .form_right .form_input::placeholder {
  color: #999;
}

.form_item .form_right .form_value {
  text-align: right;
  color: #333;
  font-size: 14px;
  flex: 0 0 auto;
  max-width: 200px;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
}

.form_item .form_right .form_value.form_value_empty {
  color: #999;
}

.form_item .form_right .form_arrow {
  flex-shrink: 0;
}
</style>
