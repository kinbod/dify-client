<template>
  <div class="settings-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="breadcrumb">
          <el-button type="text" @click="router.push('/')" class="back-button">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </el-button>
          <el-divider direction="vertical" />
          <span class="page-title">
            <el-icon><Setting /></el-icon>
            设置
          </span>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="content-wrapper">
        <!-- Dify 配置 -->
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Connection /></el-icon>
                Dify API 配置
              </span>
            </div>
          </template>
          
          <div class="config-content">
            <el-form :model="configForm" label-width="120px">
              <el-form-item label="API 基础 URL">
                <el-input 
                  v-model="configForm.baseUrl" 
                  placeholder="例如: https://your-dify-domain.com"
                  clearable
                />
                <div class="form-help">
                  您的 Dify 服务地址，通常是部署 Dify 的域名
                </div>
              </el-form-item>
              
              <el-form-item label="API 密钥">
                <el-input 
                  v-model="configForm.apiKey" 
                  placeholder="请输入 Dify API Key"
                  type="password"
                  show-password
                  clearable
                />
                <div class="form-help">
                  在 Dify 平台的应用设置中可以找到 API Key
                </div>
              </el-form-item>
              
              <el-form-item label="用户 ID">
                <el-input 
                  v-model="configForm.userId" 
                  placeholder="默认用户 ID"
                  clearable
                />
                <div class="form-help">
                  用于标识用户，建议使用唯一标识符
                </div>
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  @click="testConnection" 
                  :loading="testing" 
                  type="primary"
                  :disabled="!canTest"
                >
                  <el-icon><Link /></el-icon>
                  测试连接
                </el-button>
                <el-button @click="saveConfig" type="primary">
                  <el-icon><Check /></el-icon>
                  保存配置
                </el-button>
                <el-button @click="resetConfig" type="warning">
                  <el-icon><RefreshLeft /></el-icon>
                  重置配置
                </el-button>
              </el-form-item>
            </el-form>
            
            <!-- 连接状态 -->
            <div v-if="connectionStatus" class="connection-status">
              <el-alert
                :title="connectionStatus.title"
                :type="connectionStatus.type"
                :description="connectionStatus.description"
                show-icon
                :closable="false"
              />
            </div>
          </div>
        </el-card>

        <!-- 使用说明 -->
        <el-card class="help-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><QuestionFilled /></el-icon>
                使用说明
              </span>
            </div>
          </template>
          
          <div class="help-content">
            <div class="help-section">
              <h3>如何获取 Dify 配置信息？</h3>
              <ol>
                <li>访问您的 Dify 平台</li>
                <li>创建或选择一个工作流</li>
                <li>在工作流设置中获取 API Key</li>
                <li>复制工作流的 API 基础 URL</li>
              </ol>
            </div>
            
            <div class="help-section">
              <h3>客户端功能特性</h3>
              <ul>
                <li><strong>工作流执行</strong> - 通过可视化界面运行 Dify 工作流</li>
                <li><strong>文件上传</strong> - 支持多种文件格式，直接在工作流中使用</li>
                <li><strong>节点监控</strong> - 实时查看每个节点的执行状态和输出</li>
                <li><strong>错误追踪</strong> - 详细记录和显示执行过程中的错误信息</li>
                <li><strong>历史记录</strong> - 查看和管理历史执行记录</li>
              </ul>
            </div>
            
            <div class="help-section">
              <h3>常见问题</h3>
              <div class="qa-item">
                <strong>Q: 为什么连接测试失败？</strong>
                <p>A: 请检查网络连接、API URL 是否正确，以及 API Key 是否有效。</p>
              </div>
              <div class="qa-item">
                <strong>Q: 如何查看工作流执行日志？</strong>
                <p>A: 在工作流执行页面，可以查看每个节点的详细状态和输出信息。</p>
              </div>
              <div class="qa-item">
                <strong>Q: 支持哪些文件格式？</strong>
                <p>A: 支持大多数常见格式，包括文档、图片、音频、视频等，具体以您的 Dify 工作流配置为准。</p>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 应用信息 -->
        <el-card class="app-info-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><InfoFilled /></el-icon>
                应用信息
              </span>
            </div>
          </template>
          
          <div class="app-info">
            <div class="info-item">
              <span class="info-label">应用名称:</span>
              <span class="info-value">Dify 客户端</span>
            </div>
            <div class="info-item">
              <span class="info-label">版本号:</span>
              <span class="info-value">1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">技术栈:</span>
              <span class="info-value">Tauri 2.9 + Vue 3 + Vite 6</span>
            </div>
            <div class="info-item">
              <span class="info-label">开发者:</span>
              <span class="info-value">MiniMax Agent</span>
            </div>
            <div class="info-item">
              <span class="info-label">许可证:</span>
              <span class="info-value">MIT License</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDifyStore } from '@/stores/dify'
import { difyApi } from '@/services/difyApi'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Setting,
  Connection,
  Link,
  Check,
  RefreshLeft,
  QuestionFilled,
  InfoFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const difyStore = useDifyStore()

// 响应式数据
const testing = ref(false)
const connectionStatus = ref<any>(null)

const configForm = reactive({
  baseUrl: '',
  apiKey: '',
  userId: 'default-user'
})

// 计算属性
const canTest = computed(() => {
  return configForm.baseUrl && configForm.apiKey
})

// 生命周期
onMounted(() => {
  if (difyStore.isConfigured) {
    const config = difyStore.getConfig()
    Object.assign(configForm, config)
  }
})

// 测试连接
const testConnection = async () => {
  if (!canTest.value) {
    ElMessage.warning('请填写完整的配置信息')
    return
  }

  testing.value = true
  
  try {
    // 临时保存配置用于测试
    difyStore.setConfig(configForm)
    
    const isConnected = await difyApi.testConnection()
    
    if (isConnected) {
      connectionStatus.value = {
        title: '连接成功',
        type: 'success',
        description: 'Dify API 连接正常，可以开始使用客户端功能'
      }
      ElMessage.success('连接测试成功！')
    } else {
      connectionStatus.value = {
        title: '连接失败',
        type: 'error',
        description: '无法连接到 Dify API，请检查配置信息是否正确'
      }
      ElMessage.error('连接测试失败')
    }
  } catch (error) {
    connectionStatus.value = {
      title: '连接错误',
      type: 'error',
      description: '连接过程中发生错误，请检查网络和配置'
    }
    ElMessage.error('连接测试出错')
  } finally {
    testing.value = false
  }
}

// 保存配置
const saveConfig = () => {
  if (!configForm.baseUrl || !configForm.apiKey) {
    ElMessage.warning('请填写完整的配置信息')
    return
  }

  difyStore.setConfig(configForm)
  connectionStatus.value = null
  ElMessage.success('配置已保存')
}

// 重置配置
const resetConfig = () => {
  configForm.baseUrl = ''
  configForm.apiKey = ''
  configForm.userId = 'default-user'
  connectionStatus.value = null
  ElMessage.success('配置已重置')
}
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: white;
  border-bottom: 1px solid #e8eaed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  color: #666;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.main-content {
  padding: 20px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-help {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.connection-status {
  margin-top: 16px;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.help-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
}

.help-section ol,
.help-section ul {
  margin: 0;
  padding-left: 24px;
}

.help-section li {
  margin-bottom: 8px;
  line-height: 1.6;
  color: #555;
}

.qa-item {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.qa-item strong {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
}

.qa-item p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.app-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e8eaed;
}

.info-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .help-content {
    gap: 24px;
  }
  
  .app-info {
    grid-template-columns: 1fr;
  }
}</style>