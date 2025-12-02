# Dify Client - Tauri 客户端

一个基于 Tauri 2.9 + Vue 3 + Vite 6 构建的现代化 Dify 工作流客户端，提供完整的工作流管理、文件上传、节点监控等功能。

## 🌟 特性

- **🚀 现代化技术栈** - 基于 Tauri 2.9 + Vue 3 + Vite 6
- **🔗 Dify API 集成** - 完整支持 Dify 工作流 API
- **📁 文件上传支持** - 支持多种文件格式的工作流输入
- **📊 节点状态监控** - 实时查看每个节点的执行状态和输出
- **⚠️ 错误信息追踪** - 详细记录和显示执行过程中的错误
- **💼 商务风格界面** - 专业的设计风格，适合企业使用
- **⚙️ 灵活配置管理** - 支持 Dify 链接和 API 密钥配置
- **🏗️ 跨平台支持** - 支持 Windows、macOS、Linux

## 📦 技术栈

### 前端
- **Vue 3** - 组合式 API，响应式设计
- **TypeScript** - 类型安全的开发体验
- **Element Plus** - 高质量的 UI 组件库
- **Pinia** - 现代化的状态管理
- **Vue Router** - 单页应用路由管理
- **Axios** - HTTP 客户端
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Vite 6** - 快速的构建工具

### 后端
- **Tauri 2.9** - 桌面应用框架
- **Rust** - 系统级编程语言
- **系统 API** - 文件系统、网络、通知等

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **Rust** >= 1.77.0
- **Windows** 10+ (构建目标)

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd dify-client

# 安装前端依赖
npm install

# 安装 Rust 依赖（首次运行）
cd src-tauri
cargo build
cd ..
```

### 开发运行

```bash
# 开发模式运行（推荐）
npm run tauri:dev

# 或者分别运行前端和后端
npm run dev          # 前端开发服务器
npm run tauri:dev    # Tauri 开发模式
```

### 构建应用

```bash
# 构建调试版本
npm run tauri:build:debug

# 构建生产版本
npm run tauri:build
```

构建完成后，可执行文件位于：
- Windows: `src-tauri/target/release/bundle/msi/`
- macOS: `src-tauri/target/release/bundle/dmg/`
- Linux: `src-tauri/target/release/bundle/deb/`

## 📋 使用说明

### 1. 配置 Dify API

1. 启动应用后，点击"设置"
2. 输入 Dify 服务的 API 基础 URL
3. 输入从 Dify 平台获取的 API Key
4. 点击"测试连接"验证配置
5. 保存配置后即可使用

### 2. 运行工作流

1. 在首页点击"运行工作流"
2. 输入工作流 ID
3. 配置输入参数或上传文件
4. 点击"运行工作流"开始执行

### 3. 监控执行状态

- 实时查看工作流执行状态
- 查看每个节点的详细输出
- 追踪执行错误信息
- 下载执行结果

## 🛠️ 项目结构

```
dify-client/
├── public/                 # 静态资源
├── src/                   # 前端源代码
│   ├── components/        # Vue 组件
│   ├── views/            # 页面视图
│   ├── stores/           # Pinia 状态管理
│   ├── services/         # API 服务
│   ├── router/           # 路由配置
│   ├── style.css         # 全局样式
│   └── main.ts           # 应用入口
├── src-tauri/            # Tauri 后端代码
│   ├── src/             # Rust 源代码
│   ├── Cargo.toml       # Rust 依赖配置
│   └── tauri.conf.json  # Tauri 配置
├── package.json          # 项目配置
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # Tailwind CSS 配置
└── tsconfig.json         # TypeScript 配置
```

## 🔧 配置说明

### Tauri 配置

主要配置位于 `src-tauri/tauri.conf.json`：

- **应用信息** - 名称、版本、标识符
- **窗口设置** - 尺寸、标题、图标
- **权限配置** - API 调用、文件访问等
- **构建配置** - 平台特定设置

### 开发配置

- **Vite 配置** - 开发服务器、构建优化
- **TypeScript 配置** - 类型检查、编译选项
- **环境变量** - API 端点、调试设置

## 🐛 常见问题

### 构建问题

**Q: Windows 构建失败**
A: 确保已安装 Visual Studio Build Tools 和 Windows SDK

**Q: 依赖安装失败**
A: 检查 Node.js 版本 >= 18，确保网络连接正常

**Q: Rust 编译错误**
A: 更新 Rust 到最新版本：`rustup update`

### 运行时问题

**Q: API 连接失败**
A: 检查 Dify URL 和 API Key 是否正确，确认网络连接

**Q: 文件上传失败**
A: 确认文件大小和格式是否在 Dify 工作流限制范围内

**Q: 工作流执行超时**
A: 检查 Dify 服务的配置，适当调整超时时间

## 📄 许可证

本项目采用 MIT 许可证，详情请见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- 作者：MiniMax Agent
- 技术支持：请在项目仓库中提交 Issue

---

**享受使用 Dify 客户端的流畅体验！** 🎉