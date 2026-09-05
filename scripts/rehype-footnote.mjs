/* 零依赖脚注支持：在 hast（HTML AST）层面解析 GFM 风格脚注
 *
 * 支持语法：
 *   正文中引用：  文本[^label]继续
 *   文末定义：    [^label]: 脚注内容（支持 **加粗** 等行内格式）
 *
 * 设计取舍：
 *  - 无法引用不存在的 label / 无法安装外部 remark/micromark 脚注包，
 *    因此在 rehype 阶段处理：对 <p> 纯文本按正则拆分。
 *  - 只处理段落层（p / li 等容器）的纯文本；跳过 <pre>/<code>/<a> 祖先，
 *    因此代码块内演示 "[^1]" 语法不会被误转换。
 *  - 编号按「首次出现顺序」分配（而非定义顺序），引用处为 <sup>，
 *    定义移到文档末尾 <section class="footnotes"> 并带返回链接。
 */

const REF_RE = /\[\^([^\]]+)\]/g
const DEF_RE = /^\[\^([^\]]+)\]:\s*/

const el = (tagName, properties, children = []) => ({
  type: 'element',
  tagName,
  properties,
  children,
})
const textNode = (value) => ({ type: 'text', value })

function isSkippedTag(tag) {
  return tag === 'pre' || tag === 'code' || tag === 'a'
}

export default function rehypeFootnote() {
  return (tree) => {
    /* 1) 收集定义：label -> 定义段落 p 及其内容子节点（去掉前缀） */
    const defs = new Map()
    const defPNodes = new Set()

    collect(tree.children, [])

    function collect(children, ancestors) {
      for (const node of children) {
        if (node.type !== 'element') continue
        if (isSkippedTag(node.tagName)) continue
        if (node.tagName === 'p') {
          const first = node.children[0]
          if (first && first.type === 'text') {
            const m = DEF_RE.exec(first.value)
            if (m) {
              const label = m[1]
              const rest = first.value.slice(m[0].length)
              if (!defs.has(label)) {
                defs.set(label, {
                  content:
                    rest.length > 0
                      ? [textNode(rest), ...node.children.slice(1)]
                      : [...node.children.slice(1)],
                  pNode: node,
                })
                defPNodes.add(node)
              }
            }
          }
        }
        if (node.children && node.children.length) {
          collect(node.children, ancestors.concat(node))
        }
      }
    }

    if (defs.size === 0) return

    /* 2) 替换正文引用为 <sup>，按引用首次出现顺序编号 */
    const order = []
    const referenced = new Set()

    replaceIn(tree.children, [])

    function replaceIn(children, ancestors) {
      for (let i = 0; i < children.length; i++) {
        const node = children[i]
        if (node.type === 'text') {
          const parentTag = ancestors[ancestors.length - 1]?.tagName
          const parentNode = ancestors[ancestors.length - 1]
          if (!parentTag || isSkippedTag(parentTag)) continue
          if (defPNodes.has(parentNode)) continue // 定义段自身（其内容会搬到文末区块）
          const parts = transformText(node.value)
          if (parts.length === 1 && parts[0] === node) continue
          children.splice(i, 1, ...parts)
          i += parts.length - 1
          continue
        }
        if (node.type === 'element') {
          if (isSkippedTag(node.tagName) || !node.children?.length) continue
          replaceIn(node.children, ancestors.concat(node))
        }
      }
    }

    function transformText(value) {
      REF_RE.lastIndex = 0
      const parts = []
      let last = 0
      let m
      let found = false
      while ((m = REF_RE.exec(value))) {
        found = true
        const label = m[1]
        if (m.index > last) parts.push(textNode(value.slice(last, m.index)))

        if (!defs.has(label)) {
          /* 没有对应定义：原样保留，避免破坏正文 */
          parts.push(textNode(m[0]))
          last = m.index + m[0].length
          continue
        }

        let seq = order.indexOf(label)
        if (seq < 0) {
          order.push(label)
          seq = order.length - 1
        }
        const num = seq + 1
        const firstRef = !referenced.has(label)
        referenced.add(label)
        const supProps = firstRef
          ? { className: ['footnote-ref'], id: `fnref-${num}` }
          : { className: ['footnote-ref'] }
        parts.push(
          el('sup', supProps, [
            el('a', { href: `#fn-${num}` }, [textNode(String(num))]),
          ])
        )
        last = m.index + m[0].length
      }
      if (found) {
        if (last < value.length) parts.push(textNode(value.slice(last)))
        return parts
      }
      return [textNode(value)]
    }

    if (order.length === 0) return

    /* 3) 移除定义段落，构建脚注区块 */
    for (const { pNode } of defs.values()) {
      removeNode(tree, pNode)
    }

    const items = order.map((label, i) => {
      const num = i + 1
      const def = defs.get(label)
      const content = def ? def.content : [textNode('（缺失脚注内容）')]
      return el(
        'li',
        { id: `fn-${num}` },
        content.concat([
          el('a', { href: `#fnref-${num}`, className: ['footnote-backref'], 'aria-label': `返回引用 ${num}` }, [textNode('↩')]),
        ])
      )
    })

    tree.children.push(
      el(
        'section',
        { className: ['footnotes'], 'data-footnotes': '' },
        [
          el('h2', { className: ['sr-only'] }, [textNode('脚注')]),
          el('ol', {}, items),
        ]
      )
    )
  }
}

function removeNode(root, target) {
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()
    if (node.children) {
      const idx = node.children.indexOf(target)
      if (idx >= 0) {
        node.children.splice(idx, 1)
        return true
      }
      queue.push(...node.children)
    }
  }
  return false
}
