---
title: 不用服务器的 OJ：把评测机搬进你的浏览器
date: 2026-08-22
cover: https://cdn.luogu.com.cn/upload/image_hosting/rmnc8bvz.png
links:
  - label: 前往BOJ
    url: https://someonehx.github.io/browser-oj/
  - label: Github仓库
    url: https://github.com/SomeoneHX/browser-oj
description: 把你的浏览器变为评测机！
tags: [OJ, 项目, 浏览器]
published: true
---

:::warning[本文使用 DeepSeek 进行润色]
不保证贡献大于AI
:::

> 受[《0 成本 OJ 系统》](https://www.luogu.com.cn/article/uu19r3ao)启发，我一直在思考：为什么 OJ 一定要在服务器上评测？更进一步，为什么 OJ 就一定要有服务器？  
> 偶然刷评论区时，看到“浏览器的复杂度堪比操作系统”这句话，一个想法瞬间击中了我——为什么不直接使用用户的浏览器进行评测呢？  
> 于是，我让 AI 快速生成了这个项目的原型，并在后续进行了持续优化。

**项目地址**：<https://github.com/SomeoneHX/browser-oj>  
**在线 Demo**：<https://someonehx.github.io/browser-oj/>  
**技术栈**：Vue 3 + TypeScript + SPA，纯前端，MIT 协议。

核心特性：

- 🖥️ 无后端、无服务器，打开网页即可使用
- ⚡ 浏览器内运行 C/C++、Python、JavaScript，甚至文言文
- 📊 本地保存提交记录，支持导入导出与 GitHub Gist 云同步
- 💬 基于 Giscus 的讨论区与反馈区
- 📝 内置文章广场与题解系统
- 🚀 GitHub Pages 一键部署，永远不用担心评测机被“打爆”

---

## 界面速览

整体界面参考洛谷布局，响应式设计，移动端也可用。

### 首页

首页展示公告、今日日历、题目跳转和随机跳题，还有近 14 天每日 AC 数量的折线统计图。

:::info[截图]
![](https://cdn.luogu.com.cn/upload/image_hosting/rmnc8bvz.png)
:::

### 题目列表

题目列表支持按题号、名称、难度和标签实时筛选，点击即可进入题目详情。

:::info[截图]
![](https://cdn.luogu.com.cn/upload/image_hosting/ibl0e3p1.png)
:::

### 题目详情

展示题目描述、时间限制、标签等元信息，并提供提交代码、查看题解、提交记录和讨论区的入口。

:::info[截图]
![](https://cdn.luogu.com.cn/upload/image_hosting/6a6d44cg.png)
:::

### 评测记录

所有提交记录保存在本地，支持按题号筛选、查看评测详情和删除记录。评测详情页会展示每个测试点的输入、期望输出、实际输出、状态和耗时。

:::info[截图]
![](https://cdn.luogu.com.cn/upload/image_hosting/m7o4asvd.png)
:::

### 讨论区

这时候聪明的你可能要问了：不是说纯前端、没有服务器吗？讨论区从何而来？答案就是著名的网站评论系统工具 **Giscus**。

:::info[什么是 Giscus ？]
Giscus 是一个基于 GitHub Discussions 的网站评论系统工具，可嵌入网页让访客用 GitHub 账号留言，评论数据直接存储在仓库的 Discussions 中。
:::

因此，我们不需要服务端就能实现讨论区和评论系统。大部分博客，甚至 OI-wiki 也在使用 Giscus。

:::info[截图]
![](https://cdn.luogu.com.cn/upload/image_hosting/h13mx2c5.png)
:::

### 文章广场

文章直接写在仓库的 `articles/` 目录中，构建时打包进前端。支持分类、标签、关联题目等元数据，题解可以按题号筛选。

:::info[截图]
![](https://cdn.luogu.com.cn/upload/image_hosting/teocyrjl.png)
:::

### “在线” IDE

提供独立的在线集成开发环境，支持切换语言、编写代码、设置自定义输入并运行。代码、语言和输入会自动保存，下次打开自动恢复。

:::info[截图]
![](https://cdn.luogu.com.cn/upload/image_hosting/rlxib02x.png)
:::

---

## 如何实现浏览器内评测

你可能会问：没有服务器和评测机，浏览器怎么运行 C++ 呢？答案是利用 WebAssembly（WASM）和 JavaScript 解释器。

### 各语言运行方案一览

| 语言 | 技术方案 | 特点 |
| --- | --- | --- |
| C / C++ | JSCPP | 体积小、启动快，但仅支持基础语法，`vector`/`string` 等 STL 不可用 |
| C++ | Emception（LLVM/Clang 编译为 WASM） | 真正编译并运行 C++，但体积大、加载慢，部分代码可能触发上游 lld 问题 |
| Python | Pyodide（CPython 编译为 WASM） | 功能全面，接近原生 Python，首次加载稍慢 |
| Python | Brython（Python 解释为 JavaScript） | 加载快，每个测试点独立 Worker，可可靠终止死循环 |
| JavaScript | 浏览器原生 Worker | 支持标准输入读取的受限 `fs` 接口，没有完整 Node.js 运行时 |
| 文言文 | `@wenyan/core` | 纯娱乐，`書之` 可输出，不支持标准输入 |

### C++：从 JSCPP 到 Emception

经过一番查找，我还真找到了一个浏览器里运行 C++ 的项目，叫做 [JSCPP](https://github.com/felixhao28/JSCPP)。它实现了 C++ 的基本功能转 JavaScript 在浏览器中运行。用是能用了，但再研究一下就会发现——怎么连 `vector` 和 `string` 都用不了啊？！不过这也可以理解，作者表示这只是为课程教学设计的，只做基础功能也情有可原。尽管如此，这个解释器体积小、启动快，所以我将其作为基础环境来使用。

后来，我想起了之前听说过的一个神奇东西——**WASM**。

:::info[什么是 WASM？]
WebAssembly（WASM）是一种可移植、体积小、加载快的二进制指令格式，能让 C/C++、Rust 等语言编译后的代码在浏览器等环境中以接近原生速度运行。
:::

于是我尝试问 AI：有没有能在浏览器内编译 C++ 并运行的项目？还真找到了，叫做 [Emception](https://www.jsdelivr.com/package/npm/@gameguild/emception-browser)。这个项目将 LLVM 工具链中的 Clang 和 LLVM 本身编译成了 WASM，这样我们就能在浏览器里真正编译 C++ 程序并运行了！测试如图：

![](https://cdn.luogu.com.cn/upload/image_hosting/cfz8uq65.png)

但这个方案也有代价：速度极慢，编译出来的 WASM 偶尔会有缺陷导致无法运行，而且还要先下载几十 MB 的环境~~而且下载速度也非常慢~~，编译时甚至会让浏览器甚至电脑卡顿。不过这也是迫不得已唯一的办法了。

### Python：双引擎驱动

Python 在浏览器中的支持就成熟多了。本 OJ 引入了两个方案：

- **Brython**：基于 JavaScript 实现的 Python 解释器，加载快，每个测试点启动独立 Worker，可隔离全局状态并可靠终止死循环。
- **Pyodide**：基于 WASM 的 CPython 发行版，功能全面，标准库齐全，在独立 Worker 中运行。首次加载大约慢两秒。

两者都支持标准输入，`input()` 可以正常使用。

### 文言文：纯粹的娱乐

如果你早些年使用过洛谷，可能记得洛谷曾经支持文言文语言。本 OJ 也加入了文言文，基于 [Wenyan-Lang](https://github.com/wenyan-lang/wenyan) 的 JavaScript 实现。`書之` 的内容会被捕获为标准输出，但由于没有实现输入库，所以并不支持读取标准输入，仅供娱乐。

![](https://cdn.luogu.com.cn/upload/image_hosting/il1tqhpa.png)

### JavaScript：原生支持

JavaScript 是浏览器原生语言，天然兼容。本 OJ 在 Worker 中执行用户代码，支持一些常见的输入读取方式：完整标准输入字符串 `input`、`readline()`/`readLine()`、`process.stdin.read()`、`fs.readFileSync(0, 'utf8')` 等。

### 评测流程

一次评测大致分为以下步骤：

1. 根据选择的语言加载对应运行环境；
2. 将代码和测试点输入传入 Web Worker；
3. 在 Worker 中执行用户代码，每个测试点按题目的 `timeLimit` 计时；
4. 捕获标准输出，与期望输出比对（输出会做归一化处理）；
5. 记录每个测试点的状态、耗时和错误信息；
6. 将评测结果保存到浏览器 `localStorage`。

如果某个测试点运行错误或超时，不会中断评测，后续测试点仍会继续执行。最终根据所有测试点结果判定 AC、WA、TLE 或运行错误。

### 浏览器评测的局限

坦率地说，浏览器评测并不能替代传统 OJ：

- 无法严格限制 CPU 和内存资源，只能用 Worker 隔离和超时终止；
- 时间测量受浏览器 JIT、垃圾回收等影响，只能作为参考；
- C++ 标准库支持有限，部分程序无法编译或运行；
- 首次加载 Pyodide 或 LLVM WASM 环境需要下载几十 MB 资源；
- 完全离线状态下不可用（除非已缓存运行时资源）。

但这些限制在“教育用途、轻量练习、算法入门”等场景下是可以接受的。

---

## 其他功能

### 数据导入导出与云同步

所有提交记录、用户资料、主题设置、IDE 草稿都保存在浏览器 `localStorage`。为了备份和迁移，支持：

- **导出 JSON 文件**：文件名 `browser-oj-data-YYYY-MM-DD.json`
- **导入 JSON 文件**：会覆盖当前数据，且有格式校验（只接受项目生成的版本化 JSON，大小不超过 10 MB）
- **云同步**：使用 GitHub Gist 存储数据。

没有后端，云同步该如何实现？这时候我想到了 GitHub Gist。

:::info[什么是 GitHub Gist ？]
GitHub Gist 是 GitHub 提供的轻量级代码片段托管服务，用于快速创建、分享和嵌入小型代码或文本片段。
:::

既然能存储文本，那不刚好适合存储数据吗？而且 GitHub 支持用户自己创建 Token，只要创建一个拥有 Gist 读写权限的 Token，即可实现云同步。Token 只保存在当前浏览器的 `localStorage` 中，不会写入备份文件或 Gist 内容。

在 `/cloud` 页面可以查看 GitHub API 的剩余配额、手动恢复云端数据或关闭同步。

![](https://cdn.luogu.com.cn/upload/image_hosting/zjsm6xjo.png)

### 评测记录分享

如果评测记录只能本地查看，就太没用了。本 OJ 实现了基于 URL 的评测记录分享：将提交代码、评测状态、测试点结果和程序输出全部编码进 URL。虽然链接很长，但总比不能分享好。分享的链接是只读的，不会修改本地数据。

[查看一个示例分享](https://someonehx.github.io/browser-oj/record/msq2r3m79non?share=%7B%22id%22%3A%22msq2r3m79non%22%2C%22timestamp%22%3A1786538259727%2C%22problemId%22%3A%22P1005%22%2C%22problemTitle%22%3A%22%E5%9B%9E%E6%96%87%E6%95%B0%E5%88%A4%E5%AE%9A%22%2C%22code%22%3A%22%23include%20%3Ciostream%3E%5Cn%23include%20%3Cstring%3E%5Cnusing%20namespace%20std%3B%5Cn%5Cnint%20main()%20%7B%5Cn%20%20%20%20string%20s%3B%5Cn%20%20%20%20cin%20%3E%3E%20s%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E5%B0%86%E8%BE%93%E5%85%A5%E5%BD%93%E4%BD%9C%E5%AD%97%E7%AC%A6%E4%B8%B2%E8%AF%BB%E5%85%A5%5Cn%5Cn%20%20%20%20int%20left%20%3D%200%2C%20right%20%3D%20s.size()%20-%201%3B%5Cn%20%20%20%20bool%20isPalindrome%20%3D%20true%3B%5Cn%20%20%20%20while%20(left%20%3C%20right)%20%7B%5Cn%20%20%20%20%20%20%20%20if%20(s%5Bleft%5D%20!%3D%20s%5Bright%5D)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20isPalindrome%20%3D%20false%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20break%3B%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20left%2B%2B%3B%5Cn%20%20%20%20%20%20%20%20right--%3B%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20cout%20%3C%3C%20(isPalindrome%20%3F%20%5C%22Yes%5C%22%20%3A%20%5C%22No%5C%22)%20%3C%3C%20endl%3B%5Cn%20%20%20%20return%200%3B%5Cn%7D%22%2C%22language%22%3A%22cpp-wasm%22%2C%22status%22%3A%22ac%22%2C%22timeLimit%22%3A2000%2C%22testResults%22%3A%5B%7B%22input%22%3A%22121%22%2C%22expected%22%3A%22Yes%22%2C%22actual%22%3A%22Yes%22%2C%22passed%22%3Atrue%2C%22error%22%3Afalse%2C%22status%22%3A%22passed%22%2C%22durationMs%22%3A50.100000001490116%7D%2C%7B%22input%22%3A%22123%22%2C%22expected%22%3A%22No%22%2C%22actual%22%3A%22No%22%2C%22passed%22%3Atrue%2C%22error%22%3Afalse%2C%22status%22%3A%22passed%22%2C%22durationMs%22%3A29.30000000447035%7D%2C%7B%22input%22%3A%221%22%2C%22expected%22%3A%22Yes%22%2C%22actual%22%3A%22Yes%22%2C%22passed%22%3Atrue%2C%22error%22%3Afalse%2C%22status%22%3A%22passed%22%2C%22durationMs%22%3A17.100000001490116%7D%2C%7B%22input%22%3A%2212321%22%2C%22expected%22%3A%22Yes%22%2C%22actual%22%3A%22Yes%22%2C%22passed%22%3Atrue%2C%22error%22%3Afalse%2C%22status%22%3A%22passed%22%2C%22durationMs%22%3A19.30000000447035%7D%5D%2C%22passedTests%22%3A4%2C%22totalTests%22%3A4%2C%22output%22%3Anull%2C%22similarity%22%3A1%7D)

### 洛谷登录

在 `/login` 页面，可以将生成的验证文本写入洛谷剪贴板，再输入剪贴板 ID，系统会通过洛谷 API 验证用户名。登录不是做题的前置条件，仅用于展示。

### 环境管理与主题设置

`/environment` 页面可以管理 C++ 工具链、Pyodide、Brython 等运行时的资源：查看、筛选、下载、删除，并显示实际缓存体积。`/theme` 页面可以调整主题设置，所有偏好保存在本地。

---

## 如何部署

作为纯前端项目，只需要静态托管网站即可。Demo 使用 GitHub Pages，并已经写好了 GitHub Actions 工作流。你只需：

1. Fork 本仓库；
2. 在仓库 Settings → Pages → Source 中选择 **GitHub Actions**；
3. 推送代码或手动触发工作流，即可自动构建部署。

也可以部署到 Cloudflare Pages、Vercel、Netlify 等任意静态托管平台。因为项目使用 history 模式路由，需要配置回退到 `index.html`（仓库自带 `404.html` 处理 GitHub Pages 的深层链接回退）。

由于运行时资源（如 Emception、Pyodide）从固定版本的 jsDelivr CDN 下载，首次使用可能需要一定网络条件。Service Worker 会缓存这些资源，之后可以离线使用。

更多配置细节请看 [GitHub 仓库的 README](https://github.com/SomeoneHX/browser-oj)。

---

## 结语：Online Judge 还是 Offline Judge？

传统 OJ 是 **Online Judge**——在线测评系统，依赖服务器和评测机。而这个项目把评测完全放在了浏览器本地，或许应该叫它 **Offline Judge**——离线测评系统。

当然，这里的“离线”不是完全断网，而是指**评测过程不经过任何服务器**。用户的代码和数据都留在自己的浏览器里，只有讨论区、云同步等功能需要第三方服务（GitHub）。

这个项目的初衷并不是取代传统 OJ，而是探索一种新的可能：降低 OJ 的部署和运维成本，让个人、教学团队甚至兴趣小组都能零成本拥有一个属于自己的 OJ。同时，它也证明了浏览器的能力远超我们的想象。

欢迎 Star、Fork 和提出建议！如果你也有兴趣，不妨打开 Demo 亲自体验一下——你的浏览器，就是你的评测机。

[本文的旧版手写版](https://www.luogu.com.cn/paste/x6ehq3ju)