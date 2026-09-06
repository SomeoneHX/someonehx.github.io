---
title: 洛谷文章互动增强
date: 2026-07-02
cover: /covers/luogu-article-html-fun.png
description: 在落谷运行HTML！
tags: [脚本, 落谷]
published: true
---

:::warning[本文章仅作备份，不保证脚本可用性和安全性！]
:::

# 背景
众所周知，洛谷提供了强大的 Markdown 支持，但是不支持 HTML ，导致一些高级功能无法实现，所以我又写了个脚本，能在洛谷文章中解析嵌入的HTML。

# 如何编写HTML?

本脚本设计为检测到 Markdown 代码框且语言为 `lg_user_html` 时就会自动替换为 iframe 加载 HTML，并且支持在开头通过元数据声明高度 `<meta name="interactive-options" content='{"height":"114"}'>` 默认是自动，也就是页面多长框就多长。

如果你觉得有边框不美观，还可以在 `<meta name="interactive-options">` 中新增 `border` 字段：

- `"border": false` 或 `"border": "none"` → 去除边框。
- 不写或设为其他值 → 保持默认的 `1px solid #ddd。`

# 可以实现什么？

既然能加载 HTML ，那能玩的就很多了。接下来是一些示例。

首先最基本的：
:::info[基础HTML标签]
```lg_user_html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h1>标题</h1>
  <p>一段话：<b>粗体</b> <i>斜体</i> <u>下划线</u> <a href="#">链接</a></p>
  <ul><li>无序列表</li></ul>
  <ol><li>有序列表</li></ol>
  <table border="1"><tr><th>表头</th></tr><tr><td>数据</td></tr></table>
  <form>
    <input type="text" placeholder="输入">
    <button>提交</button>
  </form>
  <p><small>小字</small> <mark>高亮</mark> <del>删除</del></p>
</body>
</html>
```
:::

基本上是 HTML 都能运行~~不然你还想要啥~~。

可以被用来实现一些美观的交互，甚至是复杂的应用，比如......

:::info[多标签页]
```lg_user_html
<!DOCTYPE html>
<meta name="interactive-options" content='{"border": false}'>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>标签页切换组件</title>
    <style>
        :root {
            --tab-bg: #f0f0f5;
            --tab-active-bg: #fff;
            --tab-text: #888;
            --tab-active-text: #1a1a2e;
            --indicator-color: #4f6ef7;
            --content-bg: #fff;
            --shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            --radius: 10px;
        }

        /* ========== 组件容器 - 完全独立，占满屏幕 ========== */
        .tab-component {
            display: flex;
            flex-direction: column;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
            background: #f7f7fb;
            overflow: hidden;
            position: fixed;
            top: 0;
            left: 0;
        }

        /* ========== 标签导航栏 ========== */
        .tab-nav {
            display: flex;
            width: 100%;
            flex-shrink: 0;
            background: var(--tab-bg);
            position: relative;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            border-bottom: 1px solid #e8e8ef;
        }

        /* 单个标签按钮 */
        .tab-btn {
            flex: 1;
            padding: 15px 10px;
            text-align: center;
            cursor: pointer;
            font-size: 15px;
            font-weight: 500;
            color: var(--tab-text);
            background: transparent;
            border: none;
            outline: none;
            transition: color 0.3s ease;
            position: relative;
            letter-spacing: 0.5px;
            white-space: nowrap;
            z-index: 1;
        }
        .tab-btn:hover {
            color: #555;
        }
        .tab-btn.active {
            color: var(--tab-active-text);
            font-weight: 600;
        }

        /* 滑动指示器 */
        .tab-indicator {
            position: absolute;
            bottom: 0;
            height: 3px;
            background: var(--indicator-color);
            border-radius: 3px 3px 0 0;
            transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 0;
            pointer-events: none;
        }

        /* ========== 内容区域 ========== */
        .tab-content-wrapper {
            flex: 1;
            overflow-y: auto;
            background: var(--content-bg);
            padding: 0;
            box-sizing: border-box;
        }
        .tab-panel {
            display: none;
            padding: 32px 24px;
            animation: fadeSlideIn 0.4s ease;
            min-height: 100%;
            box-sizing: border-box;
        }
        .tab-panel.active {
            display: block;
        }

        @keyframes fadeSlideIn {
            from {
                opacity: 0;
                transform: translateY(12px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* ========== 内容样式（示例） ========== */
        .tab-panel h2 {
            margin: 0 0 12px;
            font-size: 22px;
            color: #1a1a2e;
            font-weight: 700;
        }
        .tab-panel p {
            margin: 0;
            color: #666;
            line-height: 1.7;
            font-size: 15px;
        }
        .tab-panel .highlight-card {
            margin-top: 20px;
            padding: 18px 20px;
            background: #f8f9ff;
            border-radius: var(--radius);
            border-left: 4px solid var(--indicator-color);
            color: #444;
            font-size: 14px;
            line-height: 1.6;
        }

        /* ========== 响应式：小屏幕字体略小 ========== */
        @media (max-width: 480px) {
            .tab-btn {
                font-size: 13px;
                padding: 13px 6px;
                letter-spacing: 0;
            }
            .tab-panel {
                padding: 24px 16px;
            }
            .tab-panel h2 {
                font-size: 19px;
            }
        }
    </style>
</head>
<body>

    <!-- ==================== 标签页组件 ==================== -->
    <div class="tab-component" id="tabComponent">

        <!-- 标签导航 -->
        <nav class="tab-nav" id="tabNav">
            <button class="tab-btn active" data-tab="0">🏠 首页</button>
            <button class="tab-btn" data-tab="1">📋 列表</button>
            <button class="tab-btn" data-tab="2">💬 消息</button>
            <button class="tab-btn" data-tab="3">⚙️ 设置</button>
            <div class="tab-indicator" id="tabIndicator"></div>
        </nav>

        <!-- 内容区域 -->
        <div class="tab-content-wrapper" id="tabContentWrapper">
            <div class="tab-panel active" data-panel="0">
                <h2>欢迎回来 👋</h2>
                <p>这是一个简洁的标签页切换组件。标签横向排布，自动占满屏幕宽度，切换时带有平滑的指示器动画。</p>
                <div class="highlight-card">
                    💡 <strong>组件特性：</strong>完全独立封装、轻量CSS、响应式布局、流畅动画过渡。可直接嵌入任何页面中使用。
                </div>
            </div>
            <div class="tab-panel" data-panel="1">
                <h2>列表视图</h2>
                <p>这里可以放置列表内容、数据表格或任何你需要展示的信息。</p>
                <div class="highlight-card">
                    📌 组件设计遵循"少即是多"的原则，CSS精简但视觉效果干净现代。
                </div>
            </div>
            <div class="tab-panel" data-panel="2">
                <h2>消息中心</h2>
                <p>未读消息、通知提醒等内容可以在此处呈现。</p>
                <div class="highlight-card">
                    🔔 标签页使用 <strong>flex 布局</strong>，按钮自动均分宽度，完美适配不同屏幕尺寸。
                </div>
            </div>
            <div class="tab-panel" data-panel="3">
                <h2>设置面板</h2>
                <p>偏好设置、账户管理等选项可在此处进行配置。</p>
                <div class="highlight-card">
                    🎨 通过 CSS 变量可轻松定制主题色、背景色等，满足不同项目的视觉需求。
                </div>
            </div>
        </div>
    </div>

    <script>
        (function() {
            // ========== 组件内部逻辑 - 完全封装 ==========
            const component = document.getElementById('tabComponent');
            const nav = document.getElementById('tabNav');
            const indicator = document.getElementById('tabIndicator');
            const buttons = nav.querySelectorAll('.tab-btn');
            const panels = document.querySelectorAll('.tab-panel');
            let activeIndex = 0;

            // 更新指示器位置
            function updateIndicator(index) {
                const btn = buttons[index];
                const btnRect = btn.getBoundingClientRect();
                const navRect = nav.getBoundingClientRect();
                indicator.style.width = btnRect.width + 'px';
                indicator.style.left = (btnRect.left - navRect.left) + 'px';
            }

            // 切换到指定标签
            function switchTab(index) {
                if (index === activeIndex) return;
                // 更新按钮状态
                buttons[activeIndex].classList.remove('active');
                buttons[index].classList.add('active');
                // 更新面板状态
                panels[activeIndex].classList.remove('active');
                panels[index].classList.add('active');
                // 更新指示器
                activeIndex = index;
                updateIndicator(index);
            }

            // 绑定点击事件
            buttons.forEach((btn, i) => {
                btn.addEventListener('click', () => switchTab(i));
            });

            // 初始化指示器位置
            updateIndicator(0);

            // 监听窗口大小变化，重新计算指示器
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => updateIndicator(activeIndex), 100);
            });

            // ========== 暴露简单的API到组件上 ==========
            component.switchTo = function(index) {
                if (index >= 0 && index < buttons.length) {
                    switchTab(index);
                }
            };
            component.getActiveIndex = function() {
                return activeIndex;
            };
            component.getTabCount = function() {
                return buttons.length;
            };

            console.log('✅ 标签页组件已就绪 | 标签数:', buttons.length, '| 当前激活:', activeIndex);
        })();
    </script>
</body>
</html>
```
:::

:::info[计算器]
```lg_user_html
<!DOCTYPE html>
<html lang="zh-CN">
<meta name="interactive-options" content='{"border": false}'>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>计算器组件</title>
    <style>
        /* 页面布局仅用于演示组件居中和宽度自适应，实际嵌入时可忽略 */
        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f1f3f5;
            padding: 20px;
            box-sizing: border-box;
        }

        :root {
            --calc-bg: #f8f9fa;
            --calc-display-bg: #e9ecef;
            --calc-btn-bg: #ffffff;
            --calc-btn-hover: #e2e6ea;
            --calc-operator-bg: #f0f4f8;
            --calc-operator-hover: #dde4ed;
            --calc-equals-bg: #4a90d9;
            --calc-equals-hover: #3a7bc8;
            --calc-text: #2c3e50;
            --calc-border: #dee2e6;
            --calc-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            --calc-radius: 16px;
            --calc-btn-radius: 10px;
        }

        .calculator {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
            background: var(--calc-bg);
            border: 1px solid var(--calc-border);
            border-radius: var(--calc-radius);
            box-shadow: var(--calc-shadow);
            padding: 20px;
            width: 100%;                /* 宽度自适应父容器 */
            box-sizing: border-box;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }

        .calculator__display {
            background: var(--calc-display-bg);
            border-radius: var(--calc-btn-radius);
            padding: 16px 18px;
            margin-bottom: 16px;
            text-align: right;
            min-height: 52px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            overflow: hidden;
            border: 1px solid var(--calc-border);
        }

        .calculator__display-text {
            font-size: 28px;
            font-weight: 500;
            color: var(--calc-text);
            letter-spacing: 1px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
            line-height: 1.2;
            transition: font-size 0.15s ease;
        }

        .calculator__display-text--small {
            font-size: 20px;
        }

        .calculator__display-text--xsmall {
            font-size: 16px;
        }

        .calculator__keys {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
        }

        .calculator__btn {
            font-family: inherit;
            font-size: 17px;
            font-weight: 500;
            padding: 14px 8px;
            border: 1px solid var(--calc-border);
            border-radius: var(--calc-btn-radius);
            background: var(--calc-btn-bg);
            color: var(--calc-text);
            cursor: pointer;
            transition: background 0.12s ease, transform 0.06s ease, box-shadow 0.12s ease;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            text-align: center;
            min-width: 0;
            box-sizing: border-box;
        }

        .calculator__btn:active {
            transform: scale(0.94);
            background: var(--calc-btn-hover);
        }

        .calculator__btn:hover {
            background: var(--calc-btn-hover);
        }

        .calculator__btn--operator {
            background: var(--calc-operator-bg);
            font-weight: 600;
            color: #4a6d8c;
        }

        .calculator__btn--operator:hover {
            background: var(--calc-operator-hover);
        }
        .calculator__btn--operator:active {
            background: var(--calc-operator-hover);
        }

        .calculator__btn--equals {
            background: var(--calc-equals-bg);
            color: #ffffff;
            border-color: var(--calc-equals-bg);
            font-weight: 600;
            font-size: 19px;
        }
        .calculator__btn--equals:hover {
            background: var(--calc-equals-hover);
        }
        .calculator__btn--equals:active {
            background: #3469a8;
        }

        .calculator__btn--clear {
            color: #c0392b;
            font-weight: 600;
        }

        .calculator__btn--zero {
            grid-column: span 2;
        }
    </style>
</head>
<body>
    <!-- 计算器组件 -->
    <div class="calculator" id="calculator" role="group" aria-label="计算器">
        <div class="calculator__display">
            <span class="calculator__display-text" id="calcDisplay">0</span>
        </div>
        <div class="calculator__keys">
            <button class="calculator__btn calculator__btn--clear" data-action="clear">C</button>
            <button class="calculator__btn calculator__btn--operator" data-action="operator" data-value="(">(</button>
            <button class="calculator__btn calculator__btn--operator" data-action="operator" data-value=")">)</button>
            <button class="calculator__btn calculator__btn--operator" data-action="operator" data-value="/">÷</button>

            <button class="calculator__btn" data-action="digit" data-value="7">7</button>
            <button class="calculator__btn" data-action="digit" data-value="8">8</button>
            <button class="calculator__btn" data-action="digit" data-value="9">9</button>
            <button class="calculator__btn calculator__btn--operator" data-action="operator" data-value="*">×</button>

            <button class="calculator__btn" data-action="digit" data-value="4">4</button>
            <button class="calculator__btn" data-action="digit" data-value="5">5</button>
            <button class="calculator__btn" data-action="digit" data-value="6">6</button>
            <button class="calculator__btn calculator__btn--operator" data-action="operator" data-value="-">−</button>

            <button class="calculator__btn" data-action="digit" data-value="1">1</button>
            <button class="calculator__btn" data-action="digit" data-value="2">2</button>
            <button class="calculator__btn" data-action="digit" data-value="3">3</button>
            <button class="calculator__btn calculator__btn--operator" data-action="operator" data-value="+">+</button>

            <button class="calculator__btn calculator__btn--zero" data-action="digit" data-value="0">0</button>
            <button class="calculator__btn" data-action="digit" data-value=".">.</button>
            <button class="calculator__btn calculator__btn--equals" data-action="equals">=</button>
        </div>
    </div>

    <script>
        (function() {
            const calculator = document.getElementById('calculator');
            const display = document.getElementById('calcDisplay');

            let currentInput = '0';
            let expression = '';
            let justEvaluated = false;

            function adjustFontSize() {
                const len = currentInput.replace(/[^0-9.]/g, '').length;
                display.classList.remove('calculator__display-text--small', 'calculator__display-text--xsmall');
                if (len > 13) {
                    display.classList.add('calculator__display-text--xsmall');
                } else if (len > 9) {
                    display.classList.add('calculator__display-text--small');
                }
            }

            function updateDisplay() {
                display.textContent = currentInput || '0';
                adjustFontSize();
            }

            function evaluateExpression(expr) {
                try {
                    let sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
                    sanitized = sanitized.replace(/\s+/g, '');
                    if (!sanitized || sanitized === '0') return '0';
                    const result = Function('"use strict"; return (' + sanitized + ')')();
                    if (!isFinite(result)) return '错误';
                    if (typeof result === 'number') {
                        let strResult = parseFloat(result.toPrecision(12)).toString();
                        if (strResult.length > 15) {
                            strResult = parseFloat(result.toPrecision(10)).toString();
                        }
                        return strResult;
                    }
                    return String(result);
                } catch (e) {
                    return '错误';
                }
            }

            function handleDigit(value) {
                if (justEvaluated) {
                    currentInput = value;
                    expression = value;
                    justEvaluated = false;
                } else {
                    if (currentInput === '0' && value !== '.') {
                        currentInput = value;
                        expression = expression.slice(0, -1) + value;
                    } else {
                        if (value === '.' && currentInput.includes('.')) return;
                        currentInput += value;
                        expression += value;
                    }
                }
                updateDisplay();
            }

            function handleOperator(value) {
                justEvaluated = false;
                if (currentInput === '错误') {
                    currentInput = '0';
                    expression = '0';
                }
                expression += value;
                currentInput = value;
                updateDisplay();
            }

            function handleEquals() {
                if (justEvaluated) return;
                if (currentInput === '错误') {
                    currentInput = '0';
                    expression = '';
                    updateDisplay();
                    return;
                }
                const result = evaluateExpression(expression);
                currentInput = result;
                expression = result;
                justEvaluated = true;
                updateDisplay();
            }

            function handleClear() {
                currentInput = '0';
                expression = '';
                justEvaluated = false;
                updateDisplay();
            }

            calculator.addEventListener('click', function(e) {
                const btn = e.target.closest('.calculator__btn');
                if (!btn) return;

                const action = btn.getAttribute('data-action');
                const value = btn.getAttribute('data-value');

                switch (action) {
                    case 'digit':
                        handleDigit(value);
                        break;
                    case 'operator':
                        handleOperator(value);
                        break;
                    case 'equals':
                        handleEquals();
                        break;
                    case 'clear':
                        handleClear();
                        break;
                }
            });

            // 键盘支持
            calculator.setAttribute('tabindex', '0');
            calculator.addEventListener('keydown', function(e) {
                const key = e.key;
                if (key >= '0' && key <= '9') {
                    e.preventDefault();
                    handleDigit(key);
                } else if (key === '.') {
                    e.preventDefault();
                    handleDigit('.');
                } else if (key === '+') {
                    e.preventDefault();
                    handleOperator('+');
                } else if (key === '-') {
                    e.preventDefault();
                    handleOperator('−');
                } else if (key === '*') {
                    e.preventDefault();
                    handleOperator('*');
                } else if (key === '/') {
                    e.preventDefault();
                    handleOperator('/');
                } else if (key === '(') {
                    e.preventDefault();
                    handleOperator('(');
                } else if (key === ')') {
                    e.preventDefault();
                    handleOperator(')');
                } else if (key === 'Enter' || key === '=') {
                    e.preventDefault();
                    handleEquals();
                } else if (key === 'Escape' || key === 'c' || key === 'C') {
                    e.preventDefault();
                    handleClear();
                } else if (key === 'Backspace') {
                    e.preventDefault();
                    if (justEvaluated) {
                        handleClear();
                        return;
                    }
                    if (currentInput === '错误') {
                        handleClear();
                        return;
                    }
                    if (expression.length <= 1) {
                        handleClear();
                        return;
                    }
                    expression = expression.slice(0, -1);
                    const lastOpMatch = expression.match(/([\d.]+)$/);
                    currentInput = lastOpMatch ? lastOpMatch[1] : expression.slice(-1) || '0';
                    if (currentInput === '') currentInput = '0';
                    updateDisplay();
                }
            });

            updateDisplay();
        })();
    </script>
</body>
</html>
```
:::

# 安装

将一下脚本复制到任何一个浏览器脚本管理器当中。

:::info[脚本]
```javascript
// ==UserScript==
// @name         洛谷文章互动增强（修复高度不自动问题）
// @namespace    https://www.luogu.com.cn/
// @version      5.3
// @description  将 lg_user_html 代码块转为可交互 iframe，高度自适应（无上限），修复默认不注入报告脚本的 bug
// @author       https://www.luogu.com.cn/user/1816684
// @match        *://www.luogu.com.cn/*
// @match        *://www.luogu.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function parseUserOptions(html) {
        const match = html.match(/<meta\s+name="interactive-options"\s+content='(.*?)'\s*\/?>/i);
        if (match) {
            try { return JSON.parse(match[1]); } catch (e) {}
        }
        return {};
    }

    // 注入高度报告脚本（现在统一用 heightMode 控制）
    function buildSrcdoc(originalHTML, heightMode) {
        if (heightMode !== 'auto') return originalHTML;

        const reporterScript = `
<script>
(function() {
    function sendHeight() {
        var h = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );
        window.parent.postMessage({
            type: 'interactive-resize',
            height: h
        }, '*');
    }
    // 立即发送一次（如果DOM已就绪）
    if (document.readyState === 'complete') {
        sendHeight();
    } else {
        window.addEventListener('load', sendHeight);
    }
    // 监听后续变化
    var observer = new MutationObserver(sendHeight);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    // 定时兜底
    setInterval(sendHeight, 300);
})();
</script>`;

        if (originalHTML.includes('</body>')) {
            return originalHTML.replace('</body>', reporterScript + '</body>');
        }
        return originalHTML + reporterScript;
    }

    function applyMaxHeightIfSet(iframe, options) {
        const maxHeight = parseInt(options.maxHeight, 10);
        if (!isNaN(maxHeight) && maxHeight > 0) {
            iframe.style.maxHeight = maxHeight + 'px';
            iframe.style.overflowY = 'auto';
        }
    }

    function applyBorderStyle(iframe, options) {
        if (options.border === false || options.border === 'none') {
            iframe.style.border = 'none';
        } else if (typeof options.border === 'string') {
            iframe.style.border = options.border;
        }
    }

    function processBlock(code) {
        if (code.dataset.interactiveApplied === 'true') return;
        code.dataset.interactiveApplied = 'true';

        const rawHTML = code.textContent.trim();
        if (!rawHTML) return;

        const options = parseUserOptions(rawHTML);
        const heightMode = options.height || 'auto';   // 默认 auto

        const iframe = document.createElement('iframe');
        iframe.sandbox = 'allow-scripts';
        iframe.style.width = '100%';
        iframe.style.border = '1px solid #ddd';
        iframe.style.borderRadius = '4px';
        iframe.style.marginTop = '10px';
        iframe.style.marginBottom = '10px';
        iframe.style.boxSizing = 'border-box';
        applyBorderStyle(iframe, options);

        // 使用 heightMode 生成 srcdoc
        const srcdoc = buildSrcdoc(rawHTML, heightMode);
        iframe.srcdoc = srcdoc;

        if (heightMode === 'auto') {
            // 初始可见高度，避免完全折叠，同时给报告脚本一点时间
            iframe.style.height = '150px';
            applyMaxHeightIfSet(iframe, options);

            const handler = (event) => {
                if (event.data && event.data.type === 'interactive-resize') {
                    let h = event.data.height;
                    if (typeof h === 'number' && h > 0) {
                        const maxH = parseInt(options.maxHeight, 10);
                        if (!isNaN(maxH) && maxH > 0) {
                            h = Math.min(h, maxH);
                        }
                        iframe.style.height = h + 'px';
                    }
                }
            };
            window.addEventListener('message', handler);

            // 清理监听器
            const cleanup = () => window.removeEventListener('message', handler);
            const parentObserver = new MutationObserver(() => {
                if (!document.contains(iframe)) cleanup();
            });
            parentObserver.observe(document.body, { childList: true, subtree: true });
        } else {
            // 固定高度模式
            const fixedH = parseInt(heightMode, 10);
            iframe.style.height = (!isNaN(fixedH) ? fixedH : 500) + 'px';
            applyMaxHeightIfSet(iframe, options);
        }

        const pre = code.closest('pre');
        const target = pre || code;
        target.parentNode.replaceChild(iframe, target);
    }

    function scanAndProcess() {
        document.querySelectorAll('code.language-lg_user_html').forEach(processBlock);
    }

    scanAndProcess();

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType !== Node.ELEMENT_NODE) return;
                if (node.matches && node.matches('code.language-lg_user_html')) {
                    scanAndProcess();
                }
                if (node.querySelectorAll) {
                    const nested = node.querySelectorAll('code.language-lg_user_html');
                    if (nested.length) scanAndProcess();
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
```
:::