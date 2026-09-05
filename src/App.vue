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
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import FooterBar from '@/components/FooterBar.vue'
import { useSeoHead } from '@/composables/useSeoHead'
import { peekCardRect } from '@/utils/cardStore'
import { leaveFade, pageEnter } from '@/utils/pageTransition'

useSeoHead()

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
  if (flipNav) {
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
}
</script>

<style scoped>
.app__main {
  flex: 1;
}
</style>
