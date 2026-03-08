# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 提供在本仓库中工作时的指导。

## 项目概述

这是一个基于 webpack 5 的前端静态网站项目，包含一个主页面和一个独立的贪吃蛇游戏。

## 构建命令

```bash
# 安装依赖
npm install

# 启动开发服务器（webpack-dev-server，支持热重载）
npm start

# 生产构建（输出到 dist/）
npm run build
```

## 架构说明

### Webpack 配置

- **webpack.common.js**: 共享配置，入口为 `./js/app.js`，输出到 `dist/`
- **webpack.config.dev.js**: 开发模式，配置 devServer（liveReload、热重载）、source maps
- **webpack.config.prod.js**: 生产模式，使用 HtmlWebpackPlugin 和 CopyPlugin 处理静态资源

### 项目结构

```
├── index.html          # 主页面（由 webpack 构建）
├── css/                # 全局样式
├── js/                 # JavaScript
│   ├── app.js          # webpack 入口文件
│   └── vendor/         # 第三方库
├── games/              # 独立游戏（不经过 webpack 处理）
│   └── snake/          # 自包含的贪吃蛇游戏
│       ├── index.html
│       ├── css/style.css
│       └── js/snake.js
├── img/                # 图片资源
└── dist/               # 构建输出（gitignored）
```

### 重要说明

- **游戏是独立的**: `games/` 目录包含自包含的 HTML 游戏，**不经过 webpack 处理**。可以直接在浏览器中打开或作为静态文件托管。
- 贪吃蛇游戏原先在根目录的 `snake.html`，现已移动到 `games/snake/index.html`。
- 静态资源（css、img、js/vendor）在生产构建时通过 CopyPlugin 复制到 `dist/`。
