# xuefei-claude

一个基于 webpack 的前端项目模板。

## 项目结构

```
xuefei-claude/
├── css/                # 样式文件
├── img/                # 图片资源
├── js/                 # JavaScript 文件
│   ├── app.js          # 主应用入口
│   └── vendor/         # 第三方库
├── index.html          # 主页面
├── package.json        # 项目配置
├── webpack.common.js   # webpack 通用配置
├── webpack.config.dev.js    # 开发环境配置
└── webpack.config.prod.js   # 生产环境配置
```

## 技术栈

- **构建工具**: webpack 5
- **开发服务器**: webpack-dev-server
- **HTML 处理**: html-webpack-plugin
- **资源复制**: copy-webpack-plugin

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm start
```

启动开发服务器，自动打开浏览器并支持热更新。

### 生产构建

```bash
npm run build
```

打包项目到 `dist` 目录。

## 脚本说明

| 命令 | 说明 |
|------|------|
| `npm start` | 启动开发服务器 |
| `npm run build` | 生产环境打包 |
| `npm test` | 运行测试（暂未配置） |

## 功能特性

- 现代化的 webpack 构建配置
- 开发环境热重载支持
- 生产环境代码优化
- HTML5 Boilerplate 基础模板
- 响应式 viewport 配置
- 完整的 favicon 和图标支持

## 许可证

[LICENSE](./LICENSE.txt)

---

由 Claude Code 辅助创建
