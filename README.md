# Someone.HX — 个人主页 & 博客

基于 **Vue 3 + Vite + vite-ssg** 构建的静态个人主页与博客系统。纯前端生成，无后端依赖，部署于 GitHub Pages。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建工具 | Vite 6 |
| 静态生成 | vite-ssg 28 |
| 路由 | vue-router 4 |
| 内容处理 | gray-matter (frontmatter) + markdown-it (Markdown → HTML) |
| 图标 | @iconify/vue (Material Design Icons) |
| 样式 | 纯手写 CSS — BEM 命名 + CSS 自定义属性 |
| 部署 | GitHub Actions → GitHub Pages |

## 快速开始

```bash
git clone https://github.com/SomeoneHX/someonehx.github.io.git
cd someonehx.github.io
npm install
npm run dev      # 启动开发服务器（Vite HMR）
npm run build    # 构建：编译文章 → 预渲染全部路由 → 输出 dist/
npm run preview  # 预览构建产物
```

## 添加文章

所有文章放在 `content/articles/` 目录下，以 Markdown 文件形式存储。每个文件需包含 YAML frontmatter：

```markdown
---
title: 文章标题
date: 2026-06-21
tags: [标签1, 标签2]
category: 分类名
series: 系列名称
seriesOrder: 1
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
| `category` | 否 | 分类 |
| `series` | 否 | 所属系列 |
| `seriesOrder` | 否 | 在系列中的顺序 |
| `description` | 否 | 卡片显示的摘要，不填则截取正文 |
| `published` | 否 | `false` 时为草稿，不会出现在站点上 |
| `slug` | 否 | 自定义 URL，默认使用文件名 |

写好后运行 `npm run build` 即可自动编译并纳入站点。

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
| `/categories/:category/` | BlogView | 按分类筛选 |
| `/series/:series/` | BlogView | 按系列筛选 |

## 项目架构

```
someonehx.github.io/
├── index.html                  # HTML 入口
├── vite.config.js              # Vite + vite-ssg 配置
├── package.json                # 依赖与脚本
├── scripts/
│   └── build-content.mjs       # 构建脚本：Markdown → content.json
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
│   │   ├── HomeView.vue        # 主页
│   │   ├── BlogView.vue        # 博客列表（带筛选）
│   │   └── ArticleView.vue     # 文章详情
│   ├── components/
│   │   ├── NavBar.vue          # 顶部导航栏
│   │   ├── HeroBanner.vue      # Bing 每日一图（100vh）
│   │   ├── DrawerSection.vue   # 滚动触发的抽屉布局
│   │   ├── ProfileSection.vue  # 个人资料与外链
│   │   ├── ArticleCard.vue     # 文章卡片（FLIP 动画）
│   │   ├── DynamicContent.vue  # 安全渲染 HTML
│   │   └── FooterBar.vue       # 页脚
│   ├── styles/
│   │   ├── reset.css           # CSS reset
│   │   ├── variables.css       # 设计令牌（CSS 变量）
│   │   ├── global.css          # 全局布局样式
│   │   └── card.css            # 卡片组件样式
│   └── utils/
│       └── cardStore.js        # FLIP 动画状态管理
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
        │ markdown-it 将 Markdown 渲染为 HTML
        │ 过滤未发布的文章，按日期降序排序
        │ 建立标签 / 分类 / 系列索引
        ▼
src/generated/content.json
        │
        ▼ (vite-ssg build)
        │ Vue 组件编译，content.json 作为数据源
        │ 预渲染所有路由为静态 HTML
        ▼
dist/     ← 部署到 GitHub Pages
```

## 部署

本项目设计为部署到 GitHub Pages。在 `.github/workflows/` 中配置 GitHub Actions 即可实现推送即部署。项目根域名 `someonehx.github.io` 自动对应 GitHub Pages 用户站点。

## 许可

AGPL-3.0 License
