import { useSyncExternalStore } from 'react'

/** Personal progress lives ONLY in this browser's localStorage. It is never sent anywhere. */
export interface BreakLog { ts: number; minutes: number }
interface Progress { log: BreakLog[]; lastMove: number | null; lastCheckin: number }

const KEY = 'nabdh.progress.v1'
const EVT = 'nabdh-progress'
const DEMO_LAST_MOVE_MIN = 2 * 60 + 14 // the demo starts "2 h 14 m since last movement"

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* storage unavailable */ }
  return { log: [], lastMove: null, lastCheckin: 0 }
}

let cache: Progress = read()
let sessionSeed = Date.now() - DEMO_LAST_MOVE_MIN * 60_000

function write(p: Progress) {
  cache = p
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* ignore */ }
  window.dispatchEvent(new Event(EVT))
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVT, cb)
  return () => window.removeEventListener(EVT, cb)
}
const snapshot = () => cache

export function useProgress() {
  return useSyncExternalStore(subscribe, snapshot)
}

/** Timestamp of the last movement; before any check-in, a seeded demo value. */
export const lastMovement = (p: Progress) => p.lastMove ?? sessionSeed

export function recordBreak(minutes: number, ts = Date.now()) {
  write({ log: [...cache.log, { ts, minutes }], lastMove: ts, lastCheckin: ts })
}

export function clearProgress() {
  sessionSeed = Date.now() - DEMO_LAST_MOVE_MIN * 60_000
  write({ log: [], lastMove: null, lastCheckin: 0 })
}

export const lastCheckinTs = () => cache.lastCheckin

// ---- derived ----------------------------------------------------------------

const dayKey = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function totals(p: Progress) {
  return { breaks: p.log.length, minutes: p.log.reduce((s, b) => s + b.minutes, 0) }
}

/** Consecutive days (ending today, or yesterday) with at least one logged break. */
export function streak(p: Progress, now = Date.now()) {
  const days = new Set(p.log.map((b) => dayKey(b.ts)))
  let n = 0
  let cursor = now
  if (!days.has(dayKey(cursor))) cursor -= 86_400_000
  while (days.has(dayKey(cursor))) {
    n++
    cursor -= 86_400_000
  }
  return n
}

/** Minutes per day for the last 7 days, oldest first. */
export function lastSevenDays(p: Progress, now = Date.now()) {
  return Array.from({ length: 7 }, (_, i) => {
    const ts = now - (6 - i) * 86_400_000
    const k = dayKey(ts)
    return { ts, minutes: p.log.filter((b) => dayKey(b.ts) === k).reduce((s, b) => s + b.minutes, 0) }
  })
}
