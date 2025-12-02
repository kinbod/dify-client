import axios, { AxiosInstance } from 'axios'
import { useDifyStore } from '@/stores/dify'

export interface WorkflowInputs {
  [key: string]: any
}

export interface WorkflowResponse {
  data: {
    id: string
    workflow_id: string
    status: string
    outputs: any
    error: string | null
    total_tokens: number
    created_at: string
    finished_at: string
  }
}

export interface WorkflowRunResponse {
  data: {
    id: string
    status: string
    workflow_id: string
    created_at: string
  }
}

export interface FileUploadResponse {
  data: {
    id: string
    name: string
    size: number
    extension: string
    created_at: string
  }
}

export interface NodeResult {
  id: string
  title: string
  type: string
  status: 'running' | 'succeeded' | 'failed'
  output?: any
  error?: string
}

class DifyApiService {
  private api: AxiosInstance
  
  constructor() {
    this.api = axios.create({
      timeout: 3600000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    // 请求拦截器
    this.api.interceptors.request.use((config) => {
      const difyStore = useDifyStore()
      if (difyStore.isReady()) {
        const { baseUrl, apiKey } = difyStore.getConfig()
        config.baseURL = baseUrl
        config.headers['Authorization'] = `Bearer ${apiKey}`
      }
      return config
    })
  }
  
  // 上传文件
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await this.api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return response.data
  }
  
  // 运行工作流
  async runWorkflow(workflowId: string, inputs: WorkflowInputs, user?: string): Promise<WorkflowRunResponse> {
    const difyStore = useDifyStore()
    const userId = user || difyStore.getConfig().userId
    
    const response = await this.api.post(`/workflows/run`, {
      inputs,
      response_mode: 'blocking',
      user: userId,
      workflow_id: workflowId
    })
    
    return response.data
  }
  
  // 获取工作流运行结果
  async getWorkflowRun(runId: string): Promise<WorkflowResponse> {
    const response = await this.api.get(`/workflow-runs/${runId}`)
    return response.data
  }
  
  // 获取工作流运行历史
  async getWorkflowRuns(workflowId: string, limit: number = 20): Promise<any> {
    const response = await this.api.get(`/workflow-runs`, {
      params: {
        workflow_id: workflowId,
        limit
      }
    })
    return response.data
  }
  
  // 获取工作流详情
  async getWorkflow(workflowId: string): Promise<any> {
    const response = await this.api.get(`/workflows/${workflowId}`)
    return response.data
  }
  
  // 获取工作流节点状态
  async getWorkflowRunDetail(runId: string): Promise<any> {
    const response = await this.api.get(`/workflow-runs/${runId}/detail`)
    return response.data
  }
  
  // 检查API连接
  async testConnection(): Promise<boolean> {
    try {
      const difyStore = useDifyStore()
      const { baseUrl } = difyStore.getConfig()
      
      const response = await this.api.get('/parameters', {
        baseURL: baseUrl
      })
      return response.status === 200
    } catch (error) {
      return false
    }
  }
}

export const difyApi = new DifyApiService()