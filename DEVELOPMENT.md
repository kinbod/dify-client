# 开发指南

## 🔧 开发环境设置

### 1. 环境要求

#### Node.js
- 版本：>= 18.0.0
- 推荐使用最新的 LTS 版本
- 从 [nodejs.org](https://nodejs.org) 下载安装

#### Rust
- 版本：>= 1.77.0
- 从 [rustup.rs](https://rustup.rs) 安装
- 安装后重启终端使环境变量生效

#### Windows 构建工具
- Visual Studio Build Tools 2022
- Windows SDK 10 或 11
- CMake (可选，用于某些依赖)

### 2. 项目克隆和设置

```bash
# 克隆项目
git clone <repository-url>
cd dify-client

# 安装前端依赖
npm install

# 初始化 Tauri 项目
npm run tauri init

# 构建并安装 Tauri 依赖
cd src-tauri
cargo build
cd ..
```

### 3. 开发模式运行

```bash
# 同时启动前端和 Tauri 开发服务器
npm run tauri:dev

# 或者分别运行
npm run dev          # 启动前端开发服务器
npm run tauri:dev    # 启动 Tauri 应用
```

## 🏗️ 项目架构

### 前端架构 (Vue 3 + TypeScript)

```
src/
├── components/       # 可复用组件
├── views/           # 页面组件
│   ├── Home.vue     # 首页
│   ├── WorkflowRun.vue  # 工作流执行页面
│   └── Settings.vue     # 设置页面
├── stores/          # Pinia 状态管理
│   └── dify.ts      # Dify 配置状态
├── services/        # API 服务
│   └── difyApi.ts   # Dify API 调用
├── router/          # 路由配置
│   └── index.ts     # Vue Router 配置
├── style.css        # 全局样式
└── main.ts          # 应用入口
```

### 后端架构 (Tauri + Rust)

```
src-tauri/
├── src/
│   └── main.rs      # 主入口文件
├── Cargo.toml       # Rust 依赖配置
├── tauri.conf.json  # Tauri 应用配置
└── build.rs         # 构建脚本
```

## 🔌 Dify API 集成

### API 服务设计

Dify API 服务封装在 `src/services/difyApi.ts` 中，提供以下功能：

- **文件上传** - 支持多文件上传到 Dify
- **工作流执行** - 触发工作流运行
- **状态监控** - 实时获取执行状态
- **节点详情** - 获取每个节点的执行结果
- **历史记录** - 查看执行历史

### API 端点映射

| 功能 | Dify API 端点 | 说明 |
|------|---------------|------|
| 文件上传 | `POST /files/upload` | 上传文件并获取文件ID |
| 运行工作流 | `POST /workflows/run` | 触发工作流执行 |
| 获取运行状态 | `GET /workflow-runs/{id}` | 获取执行结果 |
| 获取节点详情 | `GET /workflow-runs/{id}/detail` | 获取节点执行详情 |
| 获取工作流列表 | `GET /workflows` | 获取可用工作流列表 |

### 错误处理

所有 API 调用都包含完整的错误处理：

```typescript
try {
  const result = await difyApi.runWorkflow(workflowId, inputs)
  // 处理成功结果
} catch (error) {
  // 显示用户友好的错误信息
  ElMessage.error(error.message)
}
```

## 🎨 UI/UX 设计

### 商务风格设计

- **配色方案** - 蓝紫色渐变 (`#667eea` → `#764ba2`)
- **布局风格** - 卡片式设计，清晰的层次结构
- **交互效果** - 微动画和悬停效果
- **响应式设计** - 适配不同屏幕尺寸

### 组件库集成

使用 Element Plus 作为主要 UI 组件库，提供：

- 统一的视觉风格
- 完善的组件生态
- 良好的可访问性支持
- 响应式布局

## 🧪 测试和调试

### 开发调试技巧

1. **查看网络请求**
   - 浏览器开发者工具的 Network 面板
   - Tauri 后端日志输出

2. **Vue DevTools**
   - 安装 Vue DevTools 浏览器扩展
   - 检查组件状态和事件

3. **Rust 调试**
   ```bash
   # 在调试模式下运行
   npm run tauri:dev -- --debug
   ```

### 常见问题排查

1. **API 连接失败**
   - 检查 Dify URL 是否正确
   - 验证 API Key 是否有效
   - 确认网络连接状态

2. **构建错误**
   - 清理缓存：`npm run clean`
   - 重新安装依赖：`rm -rf node_modules && npm install`
   - 更新依赖版本

3. **Rust 编译错误**
   - 更新 Rust 工具链：`rustup update`
   - 清理构建缓存：`cargo clean`
   - 检查系统依赖

## 📦 打包和分发

### 构建生产版本

```bash
# 构建所有平台
npm run tauri:build

# 构建特定平台
npm run tauri:build -- --target x86_64-pc-windows-msvc
```

### 安装包结构

构建完成后，将在以下位置找到安装包：

```
src-tauri/target/release/bundle/
├── msi/          # Windows MSI 安装包
├── nsis/         # Windows NSIS 安装包
└── appimage/     # Linux AppImage
```

### 版本管理

1. 更新 `package.json` 中的版本号
2. 更新 `src-tauri/tauri.conf.json` 中的版本
3. 提交变更并创建发布标签

## 🚀 性能优化

### 前端优化

- **代码分割** - 使用 Vue Router 懒加载
- **图片优化** - 使用现代图片格式
- **缓存策略** - 合理使用浏览器缓存

### Tauri 优化

- **内存管理** - 及时释放大对象
- **文件操作** - 使用异步操作
- **网络请求** - 实现请求重试机制

## 🔒 安全考虑

### API 密钥管理

- API 密钥存储在本地，不发送到远程服务器
- 使用 Tauri 的 `store` 插件持久化配置
- 支持配置的导入和导出功能

### 网络安全

- 所有 API 请求使用 HTTPS
- 实现请求超时和重试机制
- 验证服务器证书

## 📊 监控和日志

### 应用监控

- 捕获 JavaScript 错误
- 记录 API 调用日志
- 监控应用性能指标

### 用户反馈

- 错误信息自动收集
- 用户操作行为分析
- 性能瓶颈识别

## 🎯 未来改进计划

1. **功能增强**
   - 工作流编辑器集成
   - 批量工作流执行
   - 执行结果可视化

2. **用户体验**
   - 深色模式支持
   - 键盘快捷键
   - 自定义主题

3. **技术升级**
   - 升级到最新版本的 Vue 和 Tauri
   - 添加单元测试和 E2E 测试
   - 性能监控集成

---

## 📞 技术支持

如果遇到开发问题，请：

1. 查看项目的 README.md 文档
2. 搜索相关的 GitHub Issues
3. 在项目中提交新的 Issue
4. 联系项目维护者

**祝您开发愉快！** 🎉