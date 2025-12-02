#!/bin/bash

# Dify Client 构建脚本
# 适用于 Windows 环境

set -e

echo "🚀 开始构建 Dify Client..."

# 检查环境
echo "📋 检查环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ $NODE_VERSION -lt 18 ]; then
    echo "❌ 错误: Node.js 版本过低，需要 >= 18.0.0，当前版本: $(node --version)"
    exit 1
fi

# 检查 Rust
if ! command -v cargo &> /dev/null; then
    echo "❌ 错误: 未找到 Rust，请先安装 Rust"
    exit 1
fi

echo "✅ 环境检查通过"
echo "Node.js: $(node --version)"
echo "Rust: $(rustc --version)"
echo "NPM: $(npm --version)"

# 安装依赖
echo "📦 安装依赖..."

# 安装前端依赖
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
else
    echo "前端依赖已存在，跳过安装"
fi

# 检查 Tauri CLI
if ! command -v tauri &> /dev/null; then
    echo "安装 Tauri CLI..."
    npm install -g @tauri-apps/cli
fi

# 构建项目
echo "🏗️ 构建项目..."

# 构建前端
echo "构建前端..."
npm run build

# 构建 Tauri 应用
echo "构建 Tauri 应用..."
npm run tauri:build

# 检查构建结果
if [ -d "src-tauri/target/release/bundle" ]; then
    echo "✅ 构建成功！"
    echo "📁 构建文件位于: src-tauri/target/release/bundle"
    
    # 列出构建的文件
    echo "📋 构建产物:"
    ls -la src-tauri/target/release/bundle/
else
    echo "❌ 构建失败"
    exit 1
fi

echo "🎉 构建完成！"