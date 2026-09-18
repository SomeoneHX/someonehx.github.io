let cardRect: { left: number; top: number; width: number; height: number } | null = null

export function saveCardRect(rect: DOMRect): void {
  cardRect = {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  }
}

export function takeCardRect(): { left: number; top: number; width: number; height: number } | null {
  const r = cardRect
  cardRect = null
  return r
}

/* 只探测、不消费：用于路由过渡层判断「本次进入是否为卡片 FLIP」。
   需在目标组件 setup 消费 rect 之前调用（即旧页开始离开时）。 */
export function peekCardRect(): { left: number; top: number; width: number; height: number } | null {
  return cardRect
}
