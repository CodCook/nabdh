/**
 * Counter relay: stagger window breaks so service coverage never drops.
 * Works for any number of windows. Times are minutes since midnight.
 */
export interface RelayWindow {
  id: number // 1-based, matches the "Window N" label
  breakStart: number
  breakEnd: number
}

export interface RelayOptions {
  windows: number
  firstBreak: number // when window 1 goes on break
  breakMinutes?: number // default 5
  /** share of windows that must stay open, default two thirds */
  minOpenShare?: number
}

/** How many windows must stay open (at least 1). 3 windows -> 2. */
export const requiredOpen = (windows: number, share = 2 / 3) => Math.max(1, Math.floor(windows * share + 1e-9))

/** How many windows may be closed at the same moment. */
export const maxClosed = (windows: number, share = 2 / 3) => windows - requiredOpen(windows, share)

/**
 * Break i starts `stagger` minutes after break i-1. The stagger is just large enough that no more than
 * `maxClosed` windows are ever closed together: ceil(breakMinutes / maxClosed).
 */
export function staggerWindows({ windows, firstBreak, breakMinutes = 5, minOpenShare = 2 / 3 }: RelayOptions): RelayWindow[] {
  const mc = Math.max(1, maxClosed(windows, minOpenShare))
  const stagger = Math.ceil(breakMinutes / mc)
  return Array.from({ length: windows }, (_, i) => ({
    id: i + 1,
    breakStart: firstBreak + i * stagger,
    breakEnd: firstBreak + i * stagger + breakMinutes,
  }))
}

export const isOpen = (w: RelayWindow, t: number) => t < w.breakStart || t >= w.breakEnd

export const openCount = (ws: RelayWindow[], t: number) => ws.filter((w) => isOpen(w, t)).length

/** 100 while enough windows are open; otherwise the shortfall in percent. */
export function coverageAt(ws: RelayWindow[], t: number, share = 2 / 3): number {
  const need = requiredOpen(ws.length, share)
  return Math.min(100, Math.round((openCount(ws, t) / need) * 100))
}
