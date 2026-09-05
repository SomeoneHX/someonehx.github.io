# Someone.HX — 个人主页 & 博客

基于 **Vue 3 + Vite + vite-ssg** 构建的静态个人主页与博客系统。纯前端生成，无后端依赖，部署于 GitHub Pages。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建工具 | Vite 6 |
| 静态生成 | vite-ssg 28 |
| 路由 | vue-router 4 |
| 内容处理 | gray-matter (frontmatter) + 前端 Markdown 渲染 |
| 图标 | @iconify/vue (Material Design Icons) |
| 样式 | 纯手写 CSS — BEM 命名 + CSS 自定义属性 |
| 部署 | GitHub Actions → GitHub Pages |

## 快速开始

```bash
git clone https://github.com/SomeoneHX/someonehx.github.io.git
cd someonehx.github.io
npm install
npm run dev      # 启动开发服务器（修改文章会自动重建并刷新页面）
npm run build    # 构建内容数据、预渲染全部路由，并输出 dist/
npm run preview  # 预览构建产物
```

## 添加文章

所有文章放在 `content/articles/` 目录下，以 Markdown 文件形式存储。每个文件需包含 YAML frontmatter：

```markdown
---
title: 文章标题
date: 2026-06-21
tags: [标签1, 标签2]
description: 卡片上显示的简短摘要
published: true
slug: custom-slug
---

## 正文内容

支持标准 Markdown 语法以及内联 HTML。
```

### Frontmatter 字段说明

| 字段 | 必需 | 说明 |
|------|------|------|
| `title` | 是 | 文章标题 |
| `date` | 是 | 发布日期，ISO 格式 `YYYY-MM-DD` |
| `tags` | 否 | 标签数组 |
| `description` | 否 | 文章卡片显示的摘要 |
| `published` | 否 | `false` 时为草稿，不会出现在站点上 |
| `pinned` | 否 | `true` 时文章在「文章」列表中置顶（标签筛选与归档不受影响） |
| `slug` | 否 | 自定义 URL，默认使用文件名 |

开发时运行 `npm run dev`：保存、新增或删除文章后，内容数据会自动更新并刷新页面。部署前运行 `npm run build` 即可生成站点。

### Markdown 渲染

构建脚本只解析 frontmatter、生成搜索文本与标签索引，并将文章正文的原始 Markdown 写入 `src/generated/content.json`。文章页与 Markdown 编辑器均在浏览器端使用同一套渲染器处理 Markdown，因此目录、数学公式、GFM、代码高亮和扩展指令都会在前端生成。

## 自定义站点

### 样式主题

编辑 `src/styles/variables.css`，所有设计令牌（颜色、间距、排版、阴影等）均定义为 CSS 自定义属性：

```css
--color-accent: #d97706;   /* 强调色 */
--color-bg-warm: #fefcf5;  /* 背景色 */
--nav-height: 56px;        /* 导航栏高度 */
```

### 个人信息

编辑 `src/components/ProfileSection.vue` 修改显示的名称、GitHub 链接、洛谷链接等。

### 导航栏

编辑 `src/components/NavBar.vue` 修改导航项。

### 页脚

编辑 `src/components/FooterBar.vue` 修改版权信息和链接。

## 路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | HomeView | 主页：Bing 每日一图 + 个人资料 + 最新文章 |
| `/blog/` | BlogView | 文章列表（2 列网格） |
| `/blog/:slug/` | ArticleView | 文章详情页（带 FLIP 动画） |
| `/tags/:tag/` | BlogView | 按标签筛选 |

## 项目架构

```
someonehx.github.io/
├── index.html                  # HTML 入口
├── vite.config.js              # Vite + vite-ssg 配置
├── package.json                # 依赖与脚本
├── scripts/
│   └── build-content.mjs       # 构建文章元数据、搜索文本和 Markdown 原文
├── content/
│   └── articles/               # 所有文章（.md 文件）
├── src/
│   ├── main.js                 # 入口：ViteSSG 创建应用
│   ├── App.vue                 # 根组件
│   ├── router/
│   │   └── index.js            # 路由定义
│   ├── generated/              # gitignore，构建产物
│   │   └── content.json        # 编译后的文章数据
│   ├── views/
│   ├── data/
│   │   └── profile.js          # 个人外链数据
│   ├── views/
│   │   ├── HomeView.vue        # 主页
│   │   ├── BlogView.vue        # 博客列表（带筛选）
│   │   ├── ArticleView.vue     # 文章详情
│   ├── components/
│   │   ├── NavBar.vue          # 顶部导航栏
│   │   ├── HeroBanner.vue      # Bing 每日一图（100vh）
│   │   ├── DrawerSection.vue   # 滚动触发的抽屉布局
│   │   ├── ProfileSection.vue  # 个人资料与外链
│   │   ├── ArticleCard.vue     # 文章卡片（FLIP 动画）
│   │   ├── DynamicContent.vue  # 前端渲染 Markdown
│   │   └── FooterBar.vue       # 页脚
│   ├── styles/
│   │   ├── reset.css           # CSS reset
│   │   ├── variables.css       # 设计令牌（CSS 变量）
│   │   ├── global.css          # 全局布局样式
│   │   └── card.css            # 卡片组件样式
│   └── utils/
│       └── cardStore.js        # 文章 FLIP 动画状态管理
├── public/                     # 静态资源（favicon 等）
└── .github/
    └── workflows/              # GitHub Actions 部署配置
```

## 构建管线

```
content/articles/*.md
        │
        ▼ (scripts/build-content.mjs)
        │ gray-matter 解析 frontmatter
        │ 将 Markdown 原文写入 content.json
        │ 过滤未发布的文章，按日期降序排序
        │ 建立标签索引
        ▼
src/generated/content.json
        │
        ▼ (vite-ssg build)
        │ Vue 组件编译，content.json 作为数据源
        │ 预渲染所有路由为静态 HTML
        ▼
dist/     ← 部署到 GitHub Pages
```

浏览器访问文章页后，会读取内容数据中的 Markdown，并在前端渲染文章 HTML 与目录。

## 部署

本项目设计为部署到 GitHub Pages。在 `.github/workflows/` 中配置 GitHub Actions 即可实现推送即部署。项目根域名 `someonehx.github.io` 自动对应 GitHub Pages 用户站点。

## 许可

AGPL-3.0 License
