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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSeoHead } from '@/composables/useSeoHead'
import { peekCardRect } from '@/utils/cardStore'
import { mountFlipGhost, removeFlipGhost } from '@/utils/flipGhost'
import { leaveFade, pageEnter } from '@/utils/pageTransition'
import { registerSlowMotion } from '@/utils/slowMotion'

useSeoHead()

/* 慢动作（欣赏模式）：按住 Shift 后触发的动画以 0.25× 播放，松开恢复；
   Shift+点击站内链接 → 站内慢速导航（避免浏览器默认新开窗口/标签）。
   文章卡片例外：慢动作激活时 ArticleCard 自己放行 Shift+点击并存 rect，
   走原生 FLIP 路径，这里只管普通站内链接 */
const router = useRouter()
onMounted(() => registerSlowMotion({ navigate: (href) => router.push(href) }))

/* 本次路由切换是否来自文章卡片点击（FLIP 进入）。
   探测时机：旧页开始离开、新组件尚未 setup 消费 card rect —— 只能看不能取。 */
let flipNav = false

function onBeforeLeave() {
  flipNav = !!peekCardRect()
}

/* 旧页离开：
   - 非 FLIP：淡出 170ms，让出舞台给新页的卷帘展开
   - FLIP：不淡出、瞬时切换——文章页挂载即从卡片位置开始展开，
     若先整页淡出再展开会有空窗，观感脱节突兀

   注意：任何分支都不能「同步」调用 done()。out-in 模式下 leave 是在
   Vue 的 patch/unmount 流程内被调用的，同步 done 会立刻走到 Vue 的
   hostRemove + afterLeave -> instance.update()，重入正在进行的渲染，
   被 Vue 跳过，导致 state.isLeaving 卡死 -> 新页面永不挂载（空白页），
   后续所有导航也被 Transition 的占位符吞掉（URL 变了仍空白）。
   必须推迟到下一帧，等当前更新收尾。 */
function onLeave(el, done) {
  /* 旧页即将卸载:通知自定义指针解除吸附,避免残留变形框 */
  window.dispatchEvent(new CustomEvent('cfx:leave'))
  /* 任何离开先把可能的残留垫底快照清掉(上一次 FLIP 动画中断时的兜底) */
  removeFlipGhost()
  if (flipNav) {
    /* FLIP:旧列表页克隆为垫底快照垫在内容层下——列表不随卸载消失,
       由文章从卡片位放大逐步盖住;动画结束 ArticleView 同帧移除 */
    mountFlipGhost(el)
    requestAnimationFrame(() => done())
    return
  }
  leaveFade(el).then(done)
}

/* 新页进入：FLIP 导航跳过卷帘动画（由 ArticleView 自身从卡片位置展开），
   其余页面播放「文字逐块滚落」。flipNav 用完即复位，避免泄漏到下次导航 */
async function onEnter(el, done) {
  try {
    if (!flipNav) {
      await pageEnter(el)
    }
  } catch {
    /* 动画异常不阻塞切换 */
  } finally {
    flipNav = false
  }
  done()
  /* 新页布局稳定后：通知自定义指针以当前指针位置重新命中检测 */
  requestAnimationFrame(() => {
    window.dispatchEvent(new CustomEvent('cfx:routechange'))
  })
}
</script>

<style scoped>
.app__main {
  flex: 1;
}
</style>
