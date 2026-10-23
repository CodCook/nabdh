/**
 * Nabdh cadence engine. Pure functions only: same input, same plan.
 * All times are minutes since midnight.
 */
export type Kind = 'internal' | 'vip' | 'external'
export type Role = 'meetings' | 'deep' | 'counter'
export type Mode = 'masar' | 'ladies' | 'adaptive'
export type BreakReason = 'lunch' | 'prayer' | 'meetingEnd' | 'cadence'

export interface Meeting {
  id: string
  titleKey: string
  start: number
  end: number
  kind: Kind
  recurring?: boolean
}

export interface Block {
  id: string
  type: 'meeting' | 'buffer' | 'break'
  start: number
  end: number
  kind?: Kind
  titleKey?: string
  recurring?: boolean
  /** meeting only: the end time before Nabdh shortened it */
  originalEnd?: number
  reason?: BreakReason
}

export interface PlanOptions {
  role: Role
  mode: Mode
  ramadan: boolean
  dhuhr: number
  asr: number
  dayStart?: number
  dayEnd?: number
}

export interface Plan {
  schedule: Block[] // meetings (shortened), buffers and breaks, sorted
  breaks: Block[]
  movementMinutes: number
  freedMinutes: number // minutes handed back by shortening internal meetings
  longestSitBefore: number
  longestSitAfter: number
  /** adaptive mode speaks in movement minutes, never steps */
  unit: 'steps' | 'movementMinutes'
}

export const DAY_START = 8 * 60
export const DAY_END = 15 * 60 + 30
export const LUNCH_PEAK = 12 * 60 + 50
export const MIN_BREAK = 2
export const MAX_BREAK = 5
export const BUFFER_MIN = 5
export const SIT_LIMIT = 60
export const DEEP_LIMIT = 90
export const DEEP_STEP = 75
export const RAMADAN_QUIET_HOURS = 2
const WARM_WINDOW = 35 // a prayer break right after another break is one minute shorter

// ---- meetings ---------------------------------------------------------------

/** Internal >= 60 min end 10 early, internal < 60 end 5 early. VIP and external keep full length plus a 5 min buffer. */
export function shortenMeetings(meetings: Meeting[]): Block[] {
  const out: Block[] = []
  for (const m of meetings) {
    const len = m.end - m.start
    const base = { id: m.id, type: 'meeting' as const, start: m.start, kind: m.kind, titleKey: m.titleKey, recurring: m.recurring }
    if (m.kind === 'internal') {
      const cut = len >= 60 ? 10 : 5
      out.push({ ...base, end: m.end - cut, originalEnd: m.end })
    } else {
      out.push({ ...base, end: m.end })
      out.push({ id: `${m.id}-buffer`, type: 'buffer', start: m.end, end: m.end + BUFFER_MIN, kind: m.kind })
    }
  }
  return out.sort((a, b) => a.start - b.start)
}

export const freedMinutes = (blocks: Block[]) =>
  blocks.reduce((sum, b) => sum + (b.type === 'meeting' && b.originalEnd ? b.originalEnd - b.end : 0), 0)

// ---- gaps & fitting ---------------------------------------------------------

const overlaps = (a: { start: number; end: number }, b: { start: number; end: number }) => a.start < b.end && b.start < a.end

export function findGaps(blocks: Block[], from = DAY_START, to = DAY_END): [number, number][] {
  const sorted = [...blocks].sort((a, b) => a.start - b.start)
  const gaps: [number, number][] = []
  let cursor = from
  for (const b of sorted) {
    if (b.start > cursor) gaps.push([cursor, Math.min(b.start, to)])
    cursor = Math.max(cursor, b.end)
    if (cursor >= to) break
  }
  if (cursor < to) gaps.push([cursor, to])
  return gaps.filter(([a, b]) => b > a)
}

/** Longest duration (<= want, >= MIN_BREAK) that fits at `start` without touching any block. */
function fitDuration(blocks: Block[], start: number, want: number, lo: number, hi: number): number {
  for (let d = want; d >= MIN_BREAK; d--) {
    const cand = { start, end: start + d }
    if (start >= lo && cand.end <= hi && !blocks.some((b) => overlaps(b, cand))) return d
  }
  return 0
}

// ---- sitting stretches ------------------------------------------------------

/** Buffers and breaks are standing/recovery time; everything else in the workday is sitting. */
export function sittingStretches(blocks: Block[], from = DAY_START, to = DAY_END): number[] {
  const rest = blocks.filter((b) => b.type !== 'meeting').sort((a, b) => a.start - b.start)
  const stretches: number[] = []
  let cursor = from
  for (const b of rest) {
    if (b.start > cursor) stretches.push(b.start - cursor)
    cursor = Math.max(cursor, b.end)
  }
  if (to > cursor) stretches.push(to - cursor)
  return stretches
}
export const longestSit = (blocks: Block[], from = DAY_START, to = DAY_END) => Math.max(0, ...sittingStretches(blocks, from, to))

// ---- break placement --------------------------------------------------------

interface Candidate { start: number; want: number; reason: BreakReason; rank: number }

export function placeBreaks(blocks: Block[], o: PlanOptions): Block[] {
  const lo = o.dayStart ?? DAY_START
  const hi = o.dayEnd ?? DAY_END
  const quietFrom = o.ramadan ? hi - RAMADAN_QUIET_HOURS * 60 : Infinity
  const cap = (d: number) => (o.ramadan ? Math.min(d, 3) : d)
  const placed: Block[] = []
  const all = () => [...blocks, ...placed]
  let n = 0
  const add = (start: number, d: number, reason: BreakReason) => {
    placed.push({ id: `break-${n++}`, type: 'break', start, end: start + d, reason })
  }

  const cands: Candidate[] = []
  // 1. the post-lunch glucose peak (not meaningful while fasting)
  if (!o.ramadan) cands.push({ start: LUNCH_PEAK, want: MAX_BREAK, reason: 'lunch', rank: 0 })
  // 2. right after prayer
  cands.push({ start: o.dhuhr, want: MAX_BREAK, reason: 'prayer', rank: 1 }, { start: o.asr, want: MAX_BREAK, reason: 'prayer', rank: 1 })
  // 3. the end of every shortened meeting (10 freed minutes buy 4 of movement and 6 to walk and reset)
  for (const b of blocks) {
    if (b.type === 'meeting' && b.originalEnd) {
      const freed = b.originalEnd - b.end
      cands.push({ start: b.end, want: freed >= 10 ? 4 : 2, reason: 'meetingEnd', rank: 2 })
    }
  }

  if (o.role !== 'meetings') {
    // deep work: only lunch is a fixed anchor; the rest is a 60-90 min cadence that snaps to prayer times
    const lunch = cands.find((c) => c.reason === 'lunch')
    if (lunch) {
      const d = fitDuration(all(), lunch.start, cap(lunch.want), lo, hi)
      if (d) add(lunch.start, d, 'lunch')
    }
    fillCadence(blocks, placed, o, lo, hi, quietFrom, cap, add)
  } else {
    cands
      .sort((a, b) => a.rank - b.rank || a.start - b.start)
      .forEach((c) => {
        if (c.start >= quietFrom) return
        const d = fitDuration(all(), c.start, cap(c.want), lo, hi)
        if (d) add(c.start, d, c.reason)
      })
    // prayer breaks right after another break: the body is already warm
    placed.sort((a, b) => a.start - b.start)
    placed.forEach((p, i) => {
      if (p.reason !== 'prayer' || i === 0) return
      const prev = placed[i - 1]
      if (p.start - prev.end < WARM_WINDOW && p.end - p.start > MIN_BREAK) p.end -= 1
    })
    splitLongStretches(blocks, placed, lo, hi, quietFrom, cap, add)
  }
  return placed.sort((a, b) => a.start - b.start)
}

/** Deep work: break every 60-90 minutes (4-5 a day), snapped to prayer time when one falls in the window. */
function fillCadence(
  blocks: Block[], placed: Block[], o: PlanOptions, lo: number, hi: number, quietFrom: number,
  cap: (d: number) => number, add: (s: number, d: number, r: BreakReason) => void,
) {
  const prayers = [o.dhuhr, o.asr].sort((a, b) => a - b)
  const dur = cap(4)
  let cursor = lo
  for (let guard = 0; guard < 12; guard++) {
    const anchor = placed.filter((p) => p.start > cursor && p.start <= cursor + DEEP_LIMIT).sort((a, b) => a.start - b.start)[0]
    if (anchor) { cursor = anchor.end; continue }
    if (cursor + DEEP_LIMIT >= hi) break
    const snap = prayers.find((p) => p > cursor + 30 && p <= cursor + DEEP_LIMIT)
    const start = snap ?? cursor + DEEP_STEP
    if (start >= quietFrom) break
    const d = fitDuration([...blocks, ...placed], start, dur, lo, hi)
    if (!d) break
    add(start, d, snap ? 'prayer' : 'cadence')
    cursor = start + d
  }
}

/** Meeting days: if a stretch is still over the limit, add a short break only where it really cuts the stretch. */
function splitLongStretches(
  blocks: Block[], placed: Block[], lo: number, hi: number, quietFrom: number,
  cap: (d: number) => number, add: (s: number, d: number, r: BreakReason) => void,
) {
  for (let guard = 0; guard < 6; guard++) {
    const all = [...blocks, ...placed].filter((b) => b.type !== 'meeting').sort((a, b) => a.start - b.start)
    // find the worst stretch
    let cursor = lo, worst: [number, number] = [lo, lo]
    for (const b of [...all, { start: hi, end: hi } as Block]) {
      if (b.start - cursor > worst[1] - worst[0]) worst = [cursor, b.start]
      cursor = Math.max(cursor, b.end)
    }
    const len = worst[1] - worst[0]
    if (len <= SIT_LIMIT) return
    const ideal = worst[0] + SIT_LIMIT - 5
    const free = findGaps([...blocks, ...placed], worst[0], worst[1]).filter(([a, b]) => b - a >= MIN_BREAK)
    let best: { s: number; d: number; score: number } | null = null
    for (const [a, b] of free) {
      const s = Math.min(Math.max(ideal, a), b - MIN_BREAK)
      if (s >= quietFrom) continue
      const d = fitDuration([...blocks, ...placed], s, cap(3), lo, hi)
      if (!d) continue
      const score = Math.max(s - worst[0], worst[1] - (s + d)) // longest stretch left after the split
      if (score < len - 10 && (!best || score < best.score)) best = { s, d, score }
    }
    if (!best) return
    add(best.s, best.d, 'cadence')
  }
}

// ---- the whole day ----------------------------------------------------------

export function planDay(meetings: Meeting[], o: PlanOptions): Plan {
  const lo = o.dayStart ?? DAY_START
  const hi = o.dayEnd ?? DAY_END
  const base = o.role === 'meetings' ? shortenMeetings(meetings) : []
  const breaks = placeBreaks(base, o)
  const schedule = [...base, ...breaks].sort((a, b) => a.start - b.start)
  return {
    schedule,
    breaks,
    movementMinutes: breaks.reduce((s, b) => s + (b.end - b.start), 0),
    freedMinutes: freedMinutes(base),
    longestSitBefore: hi - lo,
    longestSitAfter: longestSit(schedule, lo, hi),
    unit: o.mode === 'adaptive' ? 'movementMinutes' : 'steps',
  }
}
