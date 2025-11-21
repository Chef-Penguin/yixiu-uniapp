import { defineStore } from "pinia"

export const useCarStore = defineStore(
  "car",
  () => {
    const codes = ref({
      cd_id: "",
      manual_id: "",
    })
    const setCodes = ({ cd_id, manual_id }) => {
      codes.value.cd_id = cd_id
      codes.value.manual_id = manual_id
    }

    return { codes, setCodes }
  },
  {
    persist: true, //持久化
  }
)
