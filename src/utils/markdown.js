import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import remarkContainer from '../../scripts/remark-container.mjs'
import remarkCodeMeta from '../../scripts/remark-code-meta.mjs'
import remarkBilibili from '../../scripts/remark-bilibili.mjs'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import rehypePrism from 'rehype-prism-plus'
import rehypeDetailsSummary from '../../scripts/rehype-details-summary.mjs'
import rehypeHeading from '../../scripts/rehype-heading.mjs'
import rehypeStringify from 'rehype-stringify'

const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkContainer)
  .use(remarkCodeMeta)
  .use(remarkBilibili)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeKatex)
  .use(rehypePrism)
  .use(rehypeDetailsSummary)
  .use(rehypeHeading)
  .use(rehypeStringify)

export async function renderMarkdown(markdown) {
  const result = await processor.process(markdown)
  return String(result)
}
