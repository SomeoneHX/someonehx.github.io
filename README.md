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

### 折叠框容器

正文支持 `:::info` / `:::success` / `:::warning` / `:::error` 四类折叠框（容器指令），可用方括号加标题、用 `{open}` 属性默认展开：

```markdown
:::warning[注意]
这里写折叠框内容，支持任意 Markdown。
:::

:::success{open}
这个折叠框默认展开。
:::
```

折叠框开合带平滑动画（`src/utils/boxFx.js`）：展开是**抽屉高度滑出**、内容从模糊聚焦变清晰（340ms）；收回反向——内容先模糊、同时高度合拢（260ms）。中途再次点击会从当前形态反向继续，不跳变；系统开启"减弱动态效果"时直接切换、无动画。

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
| `/blog/` | BlogView | 文章列表（2 列网格 + 加载更多） |
| `/blog/:slug/` | ArticleView | 文章详情：FLIP 展开进入、目录、相关文章、上下篇、Giscus 评论区 |
| `/tags/` | TagsView | 标签云 |
| `/tags/:tag/` | BlogView | 按标签筛选文章 |
| `/about/` | AboutView | 关于页 |
| `/archives/` | ArchivesView | 归档 |
| `/guestbook/` | GuestbookView | 留言板（Giscus） |
| `*` | NotFoundView | 404 兜底页 |

## 页面过渡动画

路由切换、以及直达 URL / 刷新页面，都会播放统一的入场动画，全部由 WAAPI（`Element.animate`）驱动：

- **逐行落位**：旧页淡出 170ms 后，新页内容按「行」自上而下级联入场。每个块（标题/段落/卡片/标签胶囊/按钮/代码块）以「缩小 + 偏上 + 轻模糊 + 透明」为初态，向自身中心放大、聚焦归位。
- **同行齐动**：同一水平行的元素（网格一行卡片、同排标签）同时落位，行与行错峰。
- **自适应节拍**：按首屏行数动态分配时长——行少舒展、行多收紧（约 800ms 总预算），避免长文页面线性拖沓。
- **FLIP 进入文章**：从首页/列表点卡片进文章时，整篇文章从卡片位置原位展开——宽度等比缩放决定整体大小、高度以裁切窗口从卡片高平滑展开到首屏高（文字比例恒定、内容不压扁），圆角从卡片圆角同步平滑收直为直角；旧列表页以视觉快照垫底并整体轻微缩小、逐渐模糊退远，形成"文章顶开、列表退场"的纵深。
- **直达/刷新也播**：SSG 静态 HTML 先由 `.app__main` 首帧 gate（`opacity: 0`）隐藏，JS 挂载后经 transition `appear` 钩子播放相同入场，不会"闪现内容再重播"。
- **可访问性**：遵循 `prefers-reduced-motion`（开启即跳过动画、内容直接显示），无 JS 时由 `<noscript>` 强制显示。

动画调度集中在 `src/utils/pageTransition.js`：时长、行间隔、模糊半径、总预算等常量都定义在文件顶部，可按喜好调整（例如把模糊半径常量设为 `0` 即关闭模糊聚焦效果）。

### 慢动作（欣赏）模式

全站大动画（FLIP 展开、页面进出逐行落位、列表垫底退场等）均由 WAAPI 驱动。按住 **Shift** 再触发导航或点击卡片，动画会以 0.25×（4 倍慢）播放，便于逐帧欣赏过渡细节；松开立即恢复原速。右下角会出现「慢动作」小徽标提示状态。输入框内按住 Shift（输入大写 / 选字）不会误触发，窗口失焦自动复位。

实现零侵入：`src/utils/slowMotion.js` 劫持 `Element.prototype.animate` 统一登记动画，按 Shift 状态批量调整 `playbackRate`，现有动画代码无需感知；CSS 微效（hover 过渡）通过放大 `--transition-*` 时长令牌同步变慢。Shift+点击站内链接会改为站内慢速导航（避免浏览器默认新开窗口），Shift+点击文章卡片仍走完整 FLIP。速率在文件顶部 `DEFAULT_FACTOR` 常量调整（0.25 = 4 倍慢，0.5 = 2 倍慢）。

## 自定义指针（CursorFX）

在鼠标 / 触控板等精确指针设备上，接管系统光标为 iPadOS 风格指针（触摸屏与系统开启"减弱动态效果"时自动完全禁用，系统光标原样保留）：

- **空闲态**：大号空心圆环（26px，主题主色 + 反差色描边）跟手移动，任意深浅背景上都可辨认；点击时收缩为小实心点，松开恢复。
- **吸附变形**：命中按钮 / 标签 / 链接等控件时平滑变形为吸附框——自带边框或背景的按钮、胶囊**贴合其原始轮廓**；无轮廓的裸文本链接则**外扩 4px 并补 6px 圆角**（与站内 `--radius-sm` 按钮圆角一致），形成包裹感。大内容卡（文章卡片、相关文章等）刻意排除，不吸附。
- **灵动位移**：无自带轮廓的文本目标在吸附落定后，吸附框会随光标在目标内的位置**小幅弹性位移**（幅度 ≤3px、0.3 阻尼平滑插值，幅度小于外扩量保证文字不露框）——光标滑到哪一侧框往哪侧轻移，追着光标更灵动；自带边框/背景的按钮保持钉死贴合。
- **吸附辉光**：吸附框内有一道**白色透镜高光**实时跟随鼠标位置（裁剪在框内），光斑直径按控件面积自适应。
- **边界让位**：文本框 / 下拉 / 富文本恢复系统 I 形光标，全屏图片查看器保留 `zoom-out`；评论区等 iframe 是跨文档"事件黑洞"，由「直绑 `mouseenter` + `mouseover` 委托 + 静默看门狗」三层兜底在指针进入瞬间隐藏圆点、露出系统指针。
- **场景联动**：滚动 / 缩放 / 路由切换时即时解除吸附回圆点跟手，移开控件则平滑缩回，不残留变形框。

组件在 `src/components/CursorFX.vue`：圆环尺寸、辉光强度与阻尼、外扩量与圆角、吸附目标白名单（`INTERACTIVE_SEL`）、让位区域名单等常量都集中在脚本顶部。想整体关闭，删除 `App.vue` 中的 `<CursorFX />` 一行即可。

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
│   ├── App.vue                 # 根组件（路由过渡协调 + CursorFX / 慢动作注册）
│   ├── router/
│   │   └── index.js            # 路由定义
│   ├── generated/              # gitignore，构建产物
│   │   └── content.json        # 编译后的文章数据
│   ├── composables/
│   │   └── useSeoHead.js       # 逐页 SEO head（标题/描述/OG/JSON-LD）
│   ├── data/
│   │   └── profile.js          # 个人资料与外链数据
│   ├── views/
│   │   ├── HomeView.vue        # 主页
│   │   ├── BlogView.vue        # 博客列表（含标签筛选 + 加载更多）
│   │   ├── ArticleView.vue     # 文章详情
│   │   ├── TagsView.vue        # 标签云
│   │   ├── AboutView.vue       # 关于
│   │   ├── ArchivesView.vue    # 归档
│   │   ├── GuestbookView.vue   # 留言板
│   │   └── NotFoundView.vue    # 404
│   ├── components/
│   │   ├── NavBar.vue          # 顶部导航栏（含搜索、主题切换）
│   │   ├── CursorFX.vue        # iPadOS 风格自定义指针（圆环/吸附/辉光）
│   │   ├── HeroBanner.vue      # Bing 每日一图（100vh）
│   │   ├── DrawerSection.vue   # 滚动触发的抽屉布局
│   │   ├── ProfileSection.vue  # 个人资料与外链
│   │   ├── ArticleCard.vue     # 文章卡片（FLIP 动画起点）
│   │   ├── DynamicContent.vue  # 前端渲染 Markdown
│   │   ├── ArticleToc.vue      # 文章目录
│   │   ├── GiscusView.vue      # Giscus 评论区
│   │   ├── SearchModal.vue     # 全文搜索弹层
│   │   ├── ImageViewer.vue     # 图片灯箱
│   │   └── FooterBar.vue       # 页脚
│   ├── styles/
│   │   ├── reset.css           # CSS reset
│   │   ├── variables.css       # 设计令牌（CSS 变量）
│   │   ├── global.css          # 全局布局 + 首帧动画 gate
│   │   └── card.css            # 卡片组件样式
    │   └── utils/
    │       ├── pageTransition.js   # 页面入场动画（逐行落位 + 模糊聚焦）
    │       ├── cardStore.js        # 文章 FLIP 动画状态（卡片 rect 暂存）
    │       ├── flipGhost.js        # FLIP 垫底快照（旧列表克隆垫底 + 缩小模糊退场）
    │       ├── slowMotion.js       # 慢动作（欣赏）模式：按住 Shift 全站动画降速
    │       └── boxFx.js            # 折叠框开合动画（抽屉滑出 + 模糊聚焦/失焦）
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
