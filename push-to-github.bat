@echo off
chcp 65001 >nul
echo ==========================================
echo  推送 xuefei-claude 项目到 GitHub
echo ==========================================
echo.

REM 设置 gh 命令路径
set "GH_CMD=C:\Program Files\GitHub CLI\gh.exe"

REM 检查 gh 是否可用
if not exist "%GH_CMD%" (
    echo 错误：找不到 gh.exe，请确认 GitHub CLI 已安装
    pause
    exit /b 1
)

echo [1/5] 检查 GitHub 登录状态...
"%GH_CMD%" auth status >nul 2>&1
if errorlevel 1 (
    echo 请先登录 GitHub：
    "%GH_CMD%" auth login
) else (
    echo 已登录 GitHub
)

echo.
echo [2/5] 配置 git 用户信息（如果尚未配置）...
git config --global user.email >nul 2>&1 || git config --global user.email "user@example.com"
git config --global user.name >nul 2>&1 || git config --global user.name "User"

echo.
echo [3/5] 添加所有文件到 git...
git add .

echo.
echo [4/5] 创建初始提交...
git commit -m "Initial commit" 2>nul || echo 已提交或无更改

echo.
echo [5/5] 创建 GitHub 仓库并推送...
"%GH_CMD%" repo create xuefei-claude --public --source=. --push --remote=origin 2>nul
if errorlevel 1 (
    echo 仓库可能已存在，尝试直接推送...
    git push -u origin main 2>nul || git push -u origin master
)

echo.
echo ==========================================
echo  完成！项目已推送到 GitHub
echo ==========================================
pause