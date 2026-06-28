let cardRect = null

export function saveCardRect(rect) {
  cardRect = {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  }
}

export function takeCardRect() {
  const r = cardRect
  cardRect = null
  return r
}
