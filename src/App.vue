<template>
  <div class="app">
    <NavBar />
    <div class="app__main">
      <router-view v-slot="{ Component, route }">
        <transition
          mode="out-in"
          :css="false"
          appear
          @before-leave="onBeforeLeave"
          @leave="onLeave"
          @enter="onEnter"
          @appear="onEnter"
        >
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </div>
    <FooterBar />
    <CursorFX />
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import FooterBar from '@/components/FooterBar.vue'
import CursorFX from '@/components/CursorFX.vue'
import { useSeoHead } from '@/composables/useSeoHead'
import { useRoute } from 'vue-router'
import {
  peekFlipSource,
  getFlipCtx,
  getArticleOrigin,
  markArticleOrigin,
} from '@/utils/cardStore'
import {
  prepareBackFlip,
  prepareForwardBackdrop,
  prepareForwardCard,
  cancelCoverFlip,
} from '@/utils/coverMorph'
import { leaveFade, pageEnter } from '@/utils/pageTransition'

useSeoHead()

const route = useRoute()

/* 本次路由切换的模式：
   - 'forward'  ：封面卡片 → 文章（整卡=卡片本体从 cardRect 放大，其内
     封面/标题/日期/摘要/标签文字全部一起放大；ArticleView 挂载后由
     runCardGrow 驱动，结尾与真实文章页交接）
   - 'backward' ：文章 → 其来源列表页（快照窗收拢回卡片，由 BlogView 就绪后驱动）
   - ''         ：其余一切（卷帘淡入淡出 + 行级落位） */
let mode = ''

const isArticleEl = (el) => !!(el && el.classList && el.classList.contains('article'))
/* 反向收拢只对「可确定性恢复」的来源页生效：博客/标签列表（BlogView）。
   首页抽屉、归档等布局不可恢复，返回走普通卷帘 */
const isBackViewPath = (p) =>
  !!p && (p === '/blog/' || p.startsWith('/blog/') || p.startsWith('/tags/'))

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* 第一帧加载保护解锁：预渲染/直达时 .app__main 初始 opacity:0
   （见 global.css），FLIP 跳过 pageEnter 时必须手动放行 */
const revealGate = () => {
  const gate = document.querySelector('.app__main')
  if (gate && !gate.classList.contains('pg-revealed')) {
    gate.classList.add('pg-revealed')
  }
}

function resolveMode(el) {
  if (peekFlipSource()) return 'forward'
  const origin = getArticleOrigin()
  /* 减弱动效偏好：不做快照收拢（列表位置不恢复，走普通导航） */
  if (
    !reducedMotion() &&
    isArticleEl(el) &&
    origin &&
    route.fullPath === origin &&
    isBackViewPath(origin)
  ) {
    return 'backward'
  }
  return ''
}

function onBeforeLeave(el) {
  /* 清除一切残留过渡图层（含上一次被中断的动画） */
  cancelCoverFlip()
  mode = resolveMode(el)
}

/* 旧页离开：
   - forward：旧列表视口 clone 成垫底快照（点击瞬间列表不消失，且盖住
     尚未就绪的真实文章页），再把被点卡片整张 clone 成整卡层（与垫底里
     的同一张卡片完全重合无缝）——整卡层就是卡片本体，其全部内容随动画
     一起放大。瞬时切换；新文章挂载后由 ArticleView 的 runCardGrow 驱动
   - backward：把文章当前视口画面 clone 成全屏快照窗（文章消失无空窗），
     列表就绪后由 BlogView 把快照收拢回卡片
   - 其他：淡出 170ms，让出舞台给新页卷帘展开

   注意：任何分支都不能「同步」调用 done()。out-in 模式下 leave 是在
   Vue 的 patch/unmount 流程内被调用的，同步 done 会立刻走到 Vue 的
   hostRemove + afterLeave -> instance.update()，重入正在进行的渲染，
   被 Vue 跳过，导致 state.isLeaving 卡死 -> 新页面永不挂载（空白页），
   后续所有导航也被 Transition 的占位符吞掉（URL 变了仍空白）。
   必须推迟到下一帧，等当前更新收尾。 */
function onLeave(el, done) {
  /* 旧页即将卸载：通知自定义指针解除吸附，避免残留变形框 */
  window.dispatchEvent(new CustomEvent('cfx:leave'))
  if (mode === 'forward') {
    prepareForwardBackdrop(el)
    prepareForwardCard(getFlipCtx())
    revealGate()
    requestAnimationFrame(() => done())
    return
  }
  if (mode === 'backward') {
    prepareBackFlip(el)
    revealGate()
    requestAnimationFrame(() => done())
    return
  }
  leaveFade(el).then(done)
}

/* 新页进入：
   - forward：跳过卷帘/落位（封面 morph 由 ArticleView 自己编排），
     记录「当前文章由哪个列表打开」，返回时据此做收拢
   - backward：跳过卷帘（列表已静置于快照窗下等待收拢），并清空来源标记
   - 其他：播放「文字逐块滚落」（内含滚顶与第一帧解锁）
   mode 用完即复位，避免泄漏到下次导航 */
async function onEnter(el, done) {
  try {
    if (mode === 'forward') {
      if (isArticleEl(el)) markArticleOrigin(getFlipCtx()?.from || null)
    } else if (mode === 'backward') {
      if (isArticleEl(el)) markArticleOrigin(null)
    } else {
      if (isArticleEl(el)) markArticleOrigin(null)
      await pageEnter(el)
    }
  } catch {
    /* 动画异常不阻塞切换 */
  } finally {
    /* mode 不在此复位：它由下一次导航的 onBeforeLeave 重新解析。
       若在动画中快速再次导航，旧过渡的 finally 可能与新一轮导航交错，
       在这里清空会误覆盖新一轮已解析的 mode。 */
    requestAnimationFrame(() => {
      done()
      /* 新页布局稳定后：通知自定义指针以当前指针位置重新命中检测 */
      window.dispatchEvent(new CustomEvent('cfx:routechange'))
    })
  }
}
</script>

<style scoped>
.app__main {
  flex: 1;
}
</style>
