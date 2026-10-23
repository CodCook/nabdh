import type { Meeting } from '../engine/cadence'

const t = (h: number, m = 0) => h * 60 + m

/** Khalid, Head of Planning: the seeded demo day. */
export const SAMPLE_DAY: Meeting[] = [
  { id: 'm1', titleKey: 'm1', start: t(8), end: t(9), kind: 'internal', recurring: true },
  { id: 'm2', titleKey: 'm2', start: t(9), end: t(10), kind: 'internal' },
  { id: 'm3', titleKey: 'm3', start: t(10), end: t(11), kind: 'internal' },
  { id: 'm4', titleKey: 'm4', start: t(11, 30), end: t(12, 30), kind: 'vip' },
  { id: 'm5', titleKey: 'm5', start: t(13), end: t(14), kind: 'internal' },
  { id: 'm6', titleKey: 'm6', start: t(14), end: t(14, 30), kind: 'external' },
]

export const TIMELINE_START = t(7, 30)
export const TIMELINE_END = t(15, 30)
