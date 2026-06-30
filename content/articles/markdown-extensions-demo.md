---
title: Markdown 扩展语法展示
date: 2026-06-30
tags: [测试]
description: 展示代码块高亮、提示框、对齐排版等扩展语法功能
published: true
---

# Markdown 扩展语法展示

## 代码块增强

### 语法高亮 + 行号

```js line-numbers
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

console.log(fibonacci(10))
```

### 指定行高亮

```python lines=1,3-4
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
```

### 行号 + 高亮组合

```cpp line-numbers lines=2-4
#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

### 不带语言的行号

``` line-numbers
This is a code block
without a specified language
but with line numbers enabled
```

## 提示框（可折叠）

### 默认展开

:::info{open}
这是一个 `info` 提示框，默认展开。可以包含 **Markdown** 内容，以及 `行内代码`。
:::

### 成功提示

:::success
操作已完成！这是一个 success 提示框。
:::

### 警告提示

:::warning
请注意：这是一个 warning 提示框，用于提醒用户注意潜在问题。
:::

### 错误提示

:::error
发生错误！这是一个 error 提示框，用于显示错误信息。
:::

### 嵌套提示框

:::warning
外层警告

:::error
内层错误，展示无限层级嵌套能力
:::

## 对齐排版

### 居中

:::align{center}
这是一段居中对齐的文本。

**居中加粗文本** 也是可以的。
:::

### 右对齐

:::align{right}
—— 右对齐文本，适合引用署名
:::

## 引言

:::epigraph
真正的程序员不会把注释写在代码里——他们把代码本身写成注释。
:::

## LaTeX 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
$$

矩阵公式：

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$

## 标准 Markdown 功能

### 表格

| 功能 | 状态 | 备注 |
|------|------|------|
| 语法高亮 | ✅ | Prism |
| 行号 | ✅ | rehype-prism-plus |
| 提示框 | ✅ | remark-directive |

### 任务列表

- [x] 完成核心迁移
- [x] 实现代码块扩展
- [x] 实现容器语法
- [x] B站视频嵌入
- [ ] 表格合并（Phase 3）

### 其他

~~删除线~~、**加粗**、*斜体*、`行内代码`、[链接](#)。

> 区块引用也正常工作。

## B站视频嵌入

使用 `![](bilibili:av号/BV号)` 语法嵌入：

![](bilibili:BV1GJ411x7h7)
