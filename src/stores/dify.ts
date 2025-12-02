import { defineStore } from 'pinia'
import { ref } from 'vue'

interface DifyConfig {
  baseUrl: string
  apiKey: string
  userId: string
}

export const useDifyStore = defineStore('dify', () => {
  const config = ref<DifyConfig>({
    baseUrl: '',
    apiKey: '',
    userId: 'default-user'
  })
  
  const isConfigured = ref(false)
  
  const setConfig = (newConfig: Partial<DifyConfig>) => {
    config.value = { ...config.value, ...newConfig }
    isConfigured.value = !!(config.value.baseUrl && config.value.apiKey)
  }
  
  const getConfig = () => config.value
  const isReady = () => isConfigured.value
  
  return {
    config,
    isConfigured,
    setConfig,
    getConfig,
    isReady
  }
})