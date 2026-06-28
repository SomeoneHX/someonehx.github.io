# 个人主页博客 — 实施计划

## 技术栈

- **框架**: Vue 3 + Vite
- **路由**: vue-router
- **静态生成**: vite-plugin-ssg
- **样式**: 纯手写 CSS（BEM 命名）
- **内容处理**: gray-matter + markdown-it
- **部署**: GitHub Actions → GitHub Pages
- **颜色方案**: 黑白灰度

## 项目结构

```
someonehx.github.io/
├── index.html
├── package.json
├── vite.config.js
├── scripts/
│   └── build-content.mjs          # 构建脚本：Markdown → JSON
├── content/
│   └── articles/
│       ├── hello-world.md
│       └── ...                   # 所有文章 .md 文件
├── src/
│   ├── main.js                    # 入口
│   ├── App.vue                    # 根组件
│   ├── router/
│   │   └── index.js               # 路由表
│   ├── generated/                 # gitignore，构建产出
│   │   └── content.json
│   ├── views/
│   │   ├── HomeView.vue           # 主页
│   │   ├── BlogView.vue           # 文章列表（2列网格）
│   │   └── ArticleView.vue        # 单篇文章正文
│   ├── components/
│   │   ├── NavBar.vue
│   │   ├── HeroBanner.vue         # Bing 每日一图（100vh）
│   │   ├── DrawerSection.vue      # 滚动触发的抽屉
│   │   ├── ProfileSection.vue     # 名称 + 外链
│   │   ├── ArticleCard.vue        # 文章卡片
│   │   └── DynamicContent.vue     # 渲染正文 HTML
│   └── styles/
│       ├── reset.css
│       ├── variables.css          # CSS 变量
│       ├── global.css
│       └── card.css               # 卡片组件样式
├── public/
│   └── favicon.ico
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions
└── AGENTS.md
```

## 文章 Frontmatter

```markdown
---
title: 文章标题
date: 2026-06-21
tags: [标签1, 标签2]
category: 分类
series: 系列名称
seriesOrder: 1
description: 卡片上显示的简短摘要
published: true
slug: custom-slug   # 可选，默认用文件名
---
```

## 路由

| 路径 | 视图 | 说明 |
|------|------|------|
| `/` | HomeView | 主页 |
| `/blog/` | BlogView | 全部文章 |
| `/blog/:slug/` | ArticleView | 文章详情 |
| `/tags/:tag/` | BlogView | 按标签筛选 |
| `/categories/:category/` | BlogView | 按分类筛选 |
| `/series/:series/` | BlogView | 按系列筛选 |

## 主页滚动布局

```
┌──────────────────────┐
│       NavBar          │ ← fixed 顶部
├──────────────────────┤
│                      │
│   HeroBanner         │ ← 100vh Bing 每日一图
│                      │
├──────────────────────┤ ← 抽屉上沿（sticky）
│   DrawerSection      │ ← 滚动时覆盖雨天区域
│   ────────────────   │
│   ProfileSection     │ ← 名称 + 外链
│   ────────────────   │
│   最新文章 (2列网格)   │
│   ────────────────   │
│   查看更多 →          │
│   ────────────────   │
│   其他站点            │
│                      │
└──────────────────────┘
```

## 构建流程

1. `scripts/build-content.mjs` 扫描 `content/articles/*.md`
2. gray-matter 解析 frontmatter
3. markdown-it 转 HTML
4. 过滤未发布的文章，按日期降序
5. 建立标签/分类/系列索引
6. 输出 `src/generated/content.json`
7. Vite 构建时导入 JSON，vite-plugin-ssg 预渲染所有路由

## 实施步骤

| # | 内容 |
|---|------|
| 1 | 初始化 Vite + Vue 项目，安装依赖 |
| 2 | 写 `scripts/build-content.mjs` + 示例文章 |
| 3 | CSS 基础（reset、变量、全局样式） |
| 4 | 路由、NavBar、App.vue 布局 |
| 5 | 主页：HeroBanner → DrawerSection 滚动 → ProfileSection |
| 6 | ArticleCard、BlogView（含筛选）、ArticleView |
| 7 | vite-plugin-ssg 配置 + GitHub Actions 部署 |
