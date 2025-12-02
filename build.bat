@echo off
chcp 65001 > nul
echo 🚀 开始构建 Dify Client...

REM 检查环境
echo 📋 检查环境...

REM 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js ^>= 18.0.0
    exit /b 1
)

REM 检查 Node.js 版本
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo Node.js: %NODE_VER%

REM 检查 Rust
where cargo >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Rust，请先安装 Rust
    exit /b 1
)

for /f "tokens=*" %%i in ('rustc --version') do set RUST_VER=%%i
echo Rust: %RUST_VER%

for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo NPM: %NPM_VER%

echo ✅ 环境检查通过

REM 安装依赖
echo 📦 安装依赖...

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 安装前端依赖...
    npm install
) else (
    echo 前端依赖已存在，跳过安装
)

REM 检查 Tauri CLI
where tauri >nul 2>&1
if %errorlevel% neq 0 (
    echo 安装 Tauri CLI...
    npm install -g @tauri-apps/cli
) else (
    echo Tauri CLI 已安装
)

REM 构建项目
echo 🏗️ 构建项目...

REM 构建前端
echo 构建前端...
npm run build

REM 构建 Tauri 应用
echo 构建 Tauri 应用...
npm run tauri:build

REM 检查构建结果
if exist "src-tauri\target\release\bundle" (
    echo ✅ 构建成功！
    echo 📁 构建文件位于: src-tauri\target\release\bundle
    
    echo 📋 构建产物:
    dir "src-tauri\target\release\bundle"
) else (
    echo ❌ 构建失败
    exit /b 1
)

echo 🎉 构建完成！
pause