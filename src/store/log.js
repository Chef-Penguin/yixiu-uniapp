import { defineStore } from "pinia"

export const useLogStore = defineStore(
  "log",
  () => {
    const logData = ref({
      logId: "",
      carBrand: "",
      carSeries: "",
      vehicleModelYear: "",
    })
    const setLogs = (payload = {}) => {
      const { logId, carBrand, carSeries, vehicleModelYear } = payload
      if (logId !== undefined) logData.value.logId = logId
      if (carBrand !== undefined) logData.value.carBrand = carBrand
      if (carSeries !== undefined) logData.value.carSeries = carSeries
      if (vehicleModelYear !== undefined)
        logData.value.vehicleModelYear = vehicleModelYear
    }

    return { logData, setLogs }
  },
  {
    persist: true, //持久化
  }
)
