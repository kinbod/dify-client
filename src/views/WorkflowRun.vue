<template>
  <div class="workflow-run-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="breadcrumb">
          <el-button type="text" @click="router.push('/')" class="back-button">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </el-button>
          <el-divider direction="vertical" />
          <span class="workflow-title">
            <el-icon><Connection /></el-icon>
            工作流执行 - {{ workflowId }}
          </span>
        </div>
        <div class="header-actions">
          <el-button @click="refreshStatus" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="content-wrapper">
        <!-- 输入参数区域 -->
        <el-card class="input-section">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><EditPen /></el-icon>
                输入参数
              </span>
              <el-button type="primary" @click="addInput">
                <el-icon><Plus /></el-icon>
                添加参数
              </el-button>
            </div>
          </template>
          
          <div class="input-form">
            <div class="input-items">
              <div v-for="(input, key) in inputs" :key="key" class="input-item">
                <div class="input-label">
                  <span class="label-text">{{ key }}</span>
                  <el-button type="text" @click="removeInput(key)" size="small">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-input
                  v-model="inputs[key]"
                  :placeholder="`输入 ${key} 的值`"
                  type="textarea"
                  :rows="3"
                />
              </div>
            </div>
            
            <!-- 文件上传区域 -->
            <div class="file-upload-section">
              <div class="upload-header">
                <span class="upload-title">文件上传</span>
                <el-button type="primary" @click="selectFile">
                  <el-icon><Upload /></el-icon>
                  选择文件
                </el-button>
                <input 
                  ref="fileInput" 
                  type="file" 
                  style="display: none" 
                  @change="handleFileSelect"
                  multiple
                />
              </div>
              
              <div class="uploaded-files" v-if="uploadedFiles.length > 0">
                <div v-for="file in uploadedFiles" :key="file.id" class="file-item">
                  <el-icon class="file-icon"><Document /></el-icon>
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">({{ formatFileSize(file.size) }})</span>
                  <el-button type="text" @click="removeFile(file.id)" size="small">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
            
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="large" 
                @click="runWorkflow" 
                :loading="running"
                :disabled="!canRun"
              >
                <el-icon><VideoPlay /></el-icon>
                运行工作流
              </el-button>
              <el-button @click="clearInputs">
                <el-icon><RefreshLeft /></el-icon>
                清空输入
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 执行状态区域 -->
        <el-card class="status-section" v-if="runStatus">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Monitor /></el-icon>
                执行状态
              </span>
              <el-tag :type="getStatusType(runStatus.status)">
                {{ getStatusText(runStatus.status) }}
              </el-tag>
            </div>
          </template>
          
          <div class="status-info">
            <div class="run-info">
              <div class="info-item">
                <span class="info-label">运行 ID:</span>
                <span class="info-value">{{ runStatus.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间:</span>
                <span class="info-value">{{ formatTime(runStatus.created_at) }}</span>
              </div>
              <div class="info-item" v-if="runStatus.finished_at">
                <span class="info-label">完成时间:</span>
                <span class="info-value">{{ formatTime(runStatus.finished_at) }}</span>
              </div>
              <div class="info-item" v-if="runStatus.total_tokens">
                <span class="info-label">Token 消耗:</span>
                <span class="info-value">{{ runStatus.total_tokens }}</span>
              </div>
            </div>
            
            <!-- 错误信息 -->
            <div v-if="runStatus.error" class="error-section">
              <el-alert
                title="执行错误"
                type="error"
                :description="runStatus.error"
                show-icon
                :closable="false"
              />
            </div>
          </div>
        </el-card>

        <!-- 节点状态监控 -->
        <el-card class="nodes-section" v-if="nodeResults.length > 0">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Grid /></el-icon>
                节点执行状态
              </span>
            </div>
          </template>
          
          <div class="nodes-list">
            <div 
              v-for="node in nodeResults" 
              :key="node.id" 
              class="node-item"
              :class="{ 'node-running': node.status === 'running', 'node-success': node.status === 'succeeded', 'node-failed': node.status === 'failed' }"
            >
              <div class="node-header">
                <div class="node-info">
                  <el-icon class="node-icon">
                    <Loading v-if="node.status === 'running'" />
                    <SuccessFilled v-else-if="node.status === 'succeeded'" />
                    <WarningFilled v-else />
                  </el-icon>
                  <span class="node-title">{{ node.title || node.id }}</span>
                  <el-tag size="small" :type="getStatusType(node.status)">
                    {{ getStatusText(node.status) }}
                  </el-tag>
                </div>
                <el-button type="text" @click="toggleNodeDetail(node.id)">
                  <el-icon><ArrowDown v-if="!expandedNodes.includes(node.id)" />
                    <ArrowUp v-else />
                  </el-icon>
                </el-button>
              </div>
              
              <div class="node-detail" v-if="expandedNodes.includes(node.id)">
                <div class="node-output" v-if="node.output">
                  <h4>输出结果:</h4>
                  <pre class="output-content">{{ JSON.stringify(node.output, null, 2) }}</pre>
                </div>
                <div class="node-error" v-if="node.error">
                  <h4>错误信息:</h4>
                  <pre class="error-content">{{ node.error }}</pre>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 输出结果区域 -->
        <el-card class="output-section" v-if="runStatus?.outputs">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><DataAnalysis /></el-icon>
                输出结果
              </span>
              <el-button @click="copyOutput" type="primary">
                <el-icon><DocumentCopy /></el-icon>
                复制结果
              </el-button>
            </div>
          </template>
          
          <div class="output-content">
            <pre>{{ JSON.stringify(runStatus.outputs, null, 2) }}</pre>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { difyApi, type WorkflowInputs, type FileUploadResponse } from '@/services/difyApi'
import { useDifyStore } from '@/stores/dify'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Connection,
  Refresh,
  EditPen,
  Plus,
  Delete,
  Upload,
  Document,
  VideoPlay,
  RefreshLeft,
  Monitor,
  Grid,
  Loading,
  SuccessFilled,
  WarningFilled,
  ArrowDown,
  ArrowUp,
  DataAnalysis,
  DocumentCopy
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const difyStore = useDifyStore()

// 响应式数据
const workflowId = ref(route.params.id as string)
const loading = ref(false)
const running = ref(false)

const inputs = reactive<WorkflowInputs>({})
const uploadedFiles = ref<FileUploadResponse[]>([])
const fileInput = ref<HTMLInputElement>()
const runStatus = ref<any>(null)
const nodeResults = ref<any[]>([])
const expandedNodes = ref<string[]>([])

// 计算属性
const canRun = computed(() => {
  return difyStore.isConfigured && (Object.keys(inputs).length > 0 || uploadedFiles.value.length > 0)
})

// 生命周期
onMounted(() => {
  if (!difyStore.isConfigured) {
    router.push('/')
    ElMessage.warning('请先配置 Dify API 连接信息')
    return
  }
})

// 添加输入参数
const addInput = () => {
  const key = prompt('请输入参数名:')
  if (key && !inputs[key]) {
    inputs[key] = ''
  }
}

// 移除输入参数
const removeInput = (key: string) => {
  delete inputs[key]
}

// 清空输入
const clearInputs = () => {
  Object.keys(inputs).forEach(key => delete inputs[key])
  uploadedFiles.value = []
  runStatus.value = null
  nodeResults.value = []
  expandedNodes.value = []
}

// 选择文件
const selectFile = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      const result = await difyApi.uploadFile(file)
      uploadedFiles.value.push(result.data)
      ElMessage.success(`文件 ${file.name} 上传成功`)
    } catch (error) {
      ElMessage.error(`文件 ${file.name} 上传失败`)
    }
  }
}

// 移除文件
const removeFile = (fileId: string) => {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== fileId)
}

// 运行工作流
const runWorkflow = async () => {
  if (!canRun.value) {
    ElMessage.warning('请至少添加一个输入参数或上传一个文件')
    return
  }

  running.value = true
  
  try {
    // 准备输入参数
    const workflowInputs: WorkflowInputs = { ...inputs }
    
    // 添加文件ID到输入参数
    if (uploadedFiles.value.length > 0) {
      workflowInputs.files = uploadedFiles.value.map(f => f.id)
    }

    // 调用工作流 API
    const response = await difyApi.runWorkflow(workflowId.value, workflowInputs)
    runStatus.value = response.data
    
    ElMessage.success('工作流执行已开始')
    
    // 开始轮询执行状态
    pollExecutionStatus(response.data.id)
    
  } catch (error) {
    ElMessage.error('工作流执行失败')
  } finally {
    running.value = false
  }
}

// 轮询执行状态
const pollExecutionStatus = async (runId: string) => {
  const poll = async () => {
    try {
      const response = await difyApi.getWorkflowRun(runId)
      runStatus.value = response.data
      
      // 如果执行完成，停止轮询
      if (response.data.status === 'succeeded' || response.data.status === 'failed') {
        // 获取节点详细信息
        getNodeDetails(runId)
        return
      }
      
      // 继续轮询
      setTimeout(poll, 2000) // 2秒间隔
    } catch (error) {
      console.error('获取执行状态失败:', error)
      setTimeout(poll, 5000) // 错误时增加间隔
    }
  }
  
  poll()
}

// 获取节点详细信息
const getNodeDetails = async (runId: string) => {
  try {
    const response = await difyApi.getWorkflowRunDetail(runId)
    // 根据 API 响应结构调整节点数据
    nodeResults.value = response.data.node_results || []
  } catch (error) {
    console.error('获取节点详情失败:', error)
  }
}

// 刷新状态
const refreshStatus = () => {
  if (runStatus.value) {
    getNodeDetails(runStatus.value.id)
  }
}

// 切换节点详情显示
const toggleNodeDetail = (nodeId: string) => {
  const index = expandedNodes.value.indexOf(nodeId)
  if (index > -1) {
    expandedNodes.value.splice(index, 1)
  } else {
    expandedNodes.value.push(nodeId)
  }
}

// 工具函数
const formatTime = (timeString: string) => {
  return new Date(timeString).toLocaleString('zh-CN')
}

const formatFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'running': return 'primary'
    case 'succeeded': return 'success'
    case 'failed': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'running': return '运行中'
    case 'succeeded': return '成功'
    case 'failed': return '失败'
    default: return '未知'
  }
}

const copyOutput = async () => {
  if (runStatus.value?.outputs) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(runStatus.value.outputs, null, 2))
      ElMessage.success('结果已复制到剪贴板')
    } catch (error) {
      ElMessage.error('复制失败')
    }
  }
}
</script>

<style scoped>
.workflow-run-container {
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

.workflow-title {
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
  gap: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.input-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label-text {
  font-weight: 500;
  color: #2c3e50;
}

.file-upload-section {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
}

.upload-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.upload-title {
  font-weight: 500;
  color: #2c3e50;
}

.uploaded-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e8eaed;
}

.file-icon {
  color: #667eea;
  font-size: 16px;
}

.file-name {
  font-weight: 500;
  color: #2c3e50;
  flex: 1;
}

.file-size {
  color: #666;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.run-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #2c3e50;
  font-family: monospace;
}

.error-section {
  margin-top: 16px;
}

.nodes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.node-item {
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 16px;
  background: white;
  transition: all 0.3s ease;
}

.node-item.node-running {
  border-color: #409eff;
  background: #f0f9ff;
}

.node-item.node-success {
  border-color: #67c23a;
  background: #f0f9ff;
}

.node-item.node-failed {
  border-color: #f56c6c;
  background: #fef0f0;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.node-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.node-icon {
  font-size: 20px;
}

.node-title {
  font-weight: 500;
  color: #2c3e50;
}

.node-detail {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e8eaed;
}

.node-output h4,
.node-error h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.output-content,
.error-content {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  font-family: monospace;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.output-content {
  color: #2c3e50;
}

.error-content {
  color: #f56c6c;
}

.output-section .output-content {
  max-height: 400px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.output-section pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .run-info {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}</style>