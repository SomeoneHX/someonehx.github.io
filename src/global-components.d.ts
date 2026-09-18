/* 全局组件类型声明。
   注意：本文件必须是模块（有 import/export），
   否则 declare module 'vue' 会变成环境声明、整体遮蔽 vue 的类型导出。 */
import type { DefineComponent } from 'vue'
import type { Icon } from '@iconify/vue'

declare module 'vue' {
  interface GlobalComponents {
    /** @iconify/vue 的 Icon，在 main.ts 注册为全局组件 VIcon */
    VIcon: typeof Icon
    /** vite-ssg 提供的客户端占位组件 */
    ClientOnly: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  }
}

export {}
