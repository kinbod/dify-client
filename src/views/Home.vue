<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">
            <el-icon class="title-icon">
              <Connection />
            </el-icon>
            Dify 客户端
          </h1>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showSettings = true">
            <el-icon>
              <Setting />
            </el-icon>
            设置
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- 欢迎卡片 -->
        <el-card class="welcome-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon>
                  <MagicStick />
                </el-icon>
                欢迎使用 Dify 工作流客户端
              </span>
            </div>
          </template>
          <div class="welcome-content">
            <div class="intro-text">
              <p class="main-description">
                连接您的 Dify 工作流，实时监控执行状态，支持文件上传和节点状态追踪
              </p>
              <div class="feature-list">
                <div class="feature-item">
                  <el-icon class="feature-icon">
                    <Upload />
                  </el-icon>
                  <span>文件上传支持</span>
                </div>
                <div class="feature-item">
                  <el-icon class="feature-icon">
                    <Monitor />
                  </el-icon>
                  <span>实时节点监控</span>
                </div>
                <div class="feature-item">
                  <el-icon class="feature-icon">
                    <WarningFilled />
                  </el-icon>
                  <span>错误信息追踪</span>
                </div>
                <div class="feature-item">
                  <el-icon class="feature-icon">
                    <Setting />
                  </el-icon>
                  <span>灵活配置管理</span>
                </div>
              </div>
            </div>
            <div class="config-status" v-if="!difyStore.isConfigured">
              <el-alert title="配置提醒" type="warning" description="请先配置 Dify API 连接信息才能使用客户端功能" :closable="false" />
              <el-button type="primary" @click="showSettings = true" class="config-button">
                <el-icon>
                  <Setting />
                </el-icon>
                立即配置
              </el-button>
            </div>
            <div class="config-status" v-else>
              <el-alert title="连接状态" type="success" description="Dify API 已成功配置，可以开始使用" :closable="false" />
            </div>
          </div>
        </el-card>

        <!-- 快速操作区域 -->
        <div class="quick-actions" v-if="difyStore.isConfigured">
          <el-card>
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <el-icon>
                    <Lightning />
                  </el-icon>
                  快速操作
                </span>
              </div>
            </template>
            <div class="actions-grid">
              <div class="action-item" @click="showWorkflowDialog = true">
                <el-icon class="action-icon"></el-icon>
                <span class="action-title">运行工作流</span>
                <span class="action-description">选择并执行 Dify 工作流</span>
              </div>
              <div class="action-item" @click="router.push('/settings')">
                <el-icon class="action-icon">
                  <Document />
                </el-icon>
                <span class="action-title">查看历史</span>
                <span class="action-description">浏览执行历史记录</span>
              </div>
              <div class="action-item">
                <el-icon class="action-icon">
                  <UploadFilled />
                </el-icon>
                <span class="action-title">文件管理</span>
                <span class="action-description">上传和管理文件</span>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </main>

    <!-- 设置对话框 -->
    <el-dialog v-model="showSettings" title="Dify 配置" width="600px">
      <el-form :model="configForm" :rules="rules" label-width="100px">
        <el-form-item label="API 基础 URL" prop="url">
          <el-input v-model="configForm.baseUrl" placeholder="例如: https://your-dify-domain.com" />
        </el-form-item>
        <el-form-item label="API 密钥">
          <el-input v-model="configForm.apiKey" placeholder="请输入 Dify API Key" type="password" />
        </el-form-item>
        <el-form-item label="用户 ID">
          <el-input v-model="configForm.userId" placeholder="默认用户 ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showSettings = false">取消</el-button>
          <el-button @click="testConnection" :loading="testing" type="primary">
            测试连接
          </el-button>
          <el-button @click="saveConfig" type="primary">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 工作流选择对话框 -->
    <el-dialog v-model="showWorkflowDialog" title="选择工作流" width="500px">
      <el-form>
        <el-form-item label="工作流 ID">
          <el-input v-model="workflowForm.workflowId" placeholder="请输入工作流 ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showWorkflowDialog = false">取消</el-button>
          <el-button @click="startWorkflow" type="primary">运行</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDifyStore } from '@/stores/dify'
import { difyApi } from '@/services/difyApi'
import { ElMessage } from 'element-plus'
import {
  Connection,
  Setting,
  MagicStick,
  Upload,
  Monitor,
  WarningFilled,
  Lightning,
  Document,
  UploadFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const difyStore = useDifyStore()

// 响应式数据
const showSettings = ref(false)
const showWorkflowDialog = ref(false)
const testing = ref(false)

const configForm = reactive({
  baseUrl: '',
  apiKey: '',
  userId: 'default-user'
})

const workflowForm = reactive({
  workflowId: ''
})

// 初始化配置表单
onMounted(() => {
  if (difyStore.isConfigured) {
    const config = difyStore.getConfig()
    Object.assign(configForm, config)
  }
})

// 测试连接
const testConnection = async () => {
  testing.value = true
  try {
    // 先保存配置用于测试
    difyStore.setConfig(configForm)
    if (configForm.apiKey == '' || configForm.baseUrl == '' || configForm.userId == '') {
      ElMessage.success('请先配置基础信息')
      return
    }
    const isConnected = await difyApi.testConnection()
    if (isConnected) {
      ElMessage.success('连接成功！')
    } else {
      ElMessage.error('连接失败，请检查配置信息')
    }
  } catch (error) {
    ElMessage.error('连接测试失败')
  } finally {
    testing.value = false
  }
}

// 保存配置
const saveConfig = () => {
  if (configForm.apiKey == '' || configForm.baseUrl == '' || configForm.userId == '') {
    ElMessage.success('请先配置基础信息')
    return
  }
  difyStore.setConfig(configForm)
  showSettings.value = false
  ElMessage.success('配置已保存')
}

// 开始工作流
const startWorkflow = () => {
  if (!workflowForm.workflowId) {
    ElMessage.warning('请输入工作流 ID')
    return
  }

  showWorkflowDialog.value = false
  router.push(`/workflow/${workflowForm.workflowId}`)
}



//url
const validateHTTPURLRULE=(rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入URL'));
  } else if (!validateHTTPURL(value)) {
    callback(new Error('请输入有效的HTTP/HTTPS URL'));
  } else {
    callback();
  }
}
const validateHTTPURL=(url) =>{
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%@_.~+&:]*)*' + // port and path
    '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!urlPattern.test(url);
}
//校验
const rules = reactive({
  url: [{ validator: validateHTTPURLRULE, trigger: 'blur' }]
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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

.app-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.title-icon {
  font-size: 28px;
  color: #667eea;
}

.main-content {
  padding: 40px 20px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.welcome-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.main-description {
  font-size: 16px;
  color: #555;
  margin-bottom: 20px;
  line-height: 1.6;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.feature-icon {
  font-size: 18px;
  color: #667eea;
}

.config-status {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-button {
  align-self: flex-start;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  text-align: center;
}

.action-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
}

.action-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.action-description {
  font-size: 14px;
  opacity: 0.9;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .main-content {
    padding: 20px 16px;
  }

  .feature-list {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>