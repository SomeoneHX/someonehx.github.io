let cardRect = null

export function saveToyCardRect(rect) {
  cardRect = {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  }
}

export function takeToyCardRect() {
  const r = cardRect
  cardRect = null
  return r
}
