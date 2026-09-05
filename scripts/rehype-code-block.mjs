import { visit } from 'unist-util-visit'

/* 为代码块包裹容器，注入语言标签与复制按钮：
 *   <div class="code-block">
 *     <div class="code-block__head">
 *       <span class="code-block__lang">js</span>
 *       <button class="code-block__copy" type="button" data-code-copy>复制</button>
 *     </div>
 *     <pre class="language-js">…</pre>
 *   </div>
 * 复制动作由 DynamicContent 事件委托处理。 */
export default function rehypeCodeBlock() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || !parent) return

      const code = node.children.find((c) => c.type === 'element' && c.tagName === 'code')
      if (!code) return

      const classes = Array.isArray(node.properties.className)
        ? node.properties.className
        : []
      const langClass = classes.find((c) => typeof c === 'string' && c.startsWith('language-'))
      const lang = langClass ? langClass.replace(/^language-/, '') : ''

      const head = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-block__head'] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['code-block__lang'] },
            children: [{ type: 'text', value: lang || 'code' }],
          },
          {
            type: 'element',
            tagName: 'button',
            properties: {
              className: ['code-block__copy'],
              type: 'button',
              dataCodeCopy: '',
            },
            children: [{ type: 'text', value: '复制' }],
          },
        ],
      }

      const wrapper = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-block'] },
        children: [head, node],
      }

      parent.children.splice(index, 1, wrapper)
      /* 原 pre 现已嵌在 wrapper 内，跳过其子树遍历，避免再次命中导致无限嵌套 */
      return [visit.SKIP]
    })
  }
}
