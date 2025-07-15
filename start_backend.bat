@echo off
chcp 65001 > nul
echo =================================================
echo 🚀 记意 Parli 后端服务启动脚本
echo =================================================
echo.

echo 📂 切换到后端目录...
cd /d "%~dp0backend"

echo 🔍 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到Python环境，请先安装Python 3.7+
    echo 📥 下载地址：https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python环境检查通过

echo 📦 检查依赖包...
if not exist "requirements.txt" (
    echo ❌ 错误：找不到requirements.txt文件
    pause
    exit /b 1
)

echo 🔄 安装/更新依赖包...
pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ 依赖包安装失败，请检查网络连接
    pause
    exit /b 1
)

echo ✅ 依赖包安装完成

echo.
echo 🚀 启动后端服务...
echo 📋 服务地址：http://localhost:8080
echo 💡 提示：保持此窗口打开，关闭会停止服务
echo ⚠️  按 Ctrl+C 可以停止服务
echo.

python app.py

echo.
echo 👋 后端服务已停止
pause 