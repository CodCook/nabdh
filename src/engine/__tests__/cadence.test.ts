import { describe, expect, it } from 'vitest'
import { SAMPLE_DAY } from '../../data/sampleDay'
import { findGaps, planDay, shortenMeetings, type PlanOptions } from '../cadence'

const t = (h: number, m = 0) => h * 60 + m
const base: PlanOptions = { role: 'meetings', mode: 'masar', ramadan: false, dhuhr: t(11, 20), asr: t(14, 35) }

describe('shortenMeetings', () => {
  const blocks = shortenMeetings(SAMPLE_DAY)
  const get = (id: string) => blocks.find((b) => b.id === id)!

  it('ends internal meetings of an hour or more 10 minutes early', () => {
    expect(get('m1').end).toBe(t(8, 50))
    expect(get('m5').end).toBe(t(13, 50))
  })
  it('ends internal meetings under an hour 5 minutes early', () => {
    const [b] = shortenMeetings([{ id: 'x', titleKey: 'm1', start: t(9), end: t(9, 30), kind: 'internal' }])
    expect(b.end).toBe(t(9, 25))
  })
  it('keeps VIP and external meetings whole and adds a 5 minute buffer after', () => {
    expect(get('m4').end).toBe(t(12, 30))
    expect(get('m4-buffer')).toMatchObject({ start: t(12, 30), end: t(12, 35), type: 'buffer' })
    expect(get('m6-buffer')).toMatchObject({ start: t(14, 30), end: t(14, 35) })
  })
})

describe('findGaps', () => {
  it('returns the free intervals between blocks', () => {
    const gaps = findGaps(shortenMeetings(SAMPLE_DAY))
    expect(gaps).toContainEqual([t(8, 50), t(9)])
    expect(gaps).toContainEqual([t(12, 35), t(13)])
  })
})

describe('planDay: the seeded day', () => {
  const plan = planDay(SAMPLE_DAY, base)
  const starts = plan.breaks.map((b) => b.start)

  it('recovers exactly 30 movement minutes', () => {
    expect(plan.movementMinutes).toBe(30)
    expect(plan.freedMinutes).toBe(40)
  })
  it('places the post-lunch break at 12:50', () => {
    expect(starts).toContain(t(12, 50))
  })
  it('places a break right after each prayer time', () => {
    expect(starts).toContain(t(11, 20))
    expect(starts).toContain(t(14, 35))
  })
  it('places a break at the end of each shortened meeting', () => {
    for (const s of [t(8, 50), t(9, 50), t(10, 50), t(13, 50)]) expect(starts).toContain(s)
  })
  it('keeps every break 2 to 5 minutes and never overlaps anything', () => {
    for (const b of plan.breaks) expect(b.end - b.start).toBeGreaterThanOrEqual(2), expect(b.end - b.start).toBeLessThanOrEqual(5)
    const s = plan.schedule
    for (let i = 1; i < s.length; i++) expect(s[i].start).toBeGreaterThanOrEqual(s[i - 1].end)
  })
  it('keeps every sitting stretch near the hour (the full-length VIP meeting sets the floor)', () => {
    expect(plan.longestSitAfter).toBeLessThanOrEqual(70)
    expect(plan.longestSitAfter).toBeLessThan(plan.longestSitBefore)
  })
  it('reports movement minutes, not steps, in adaptive mode', () => {
    expect(planDay(SAMPLE_DAY, { ...base, mode: 'adaptive' }).unit).toBe('movementMinutes')
    expect(plan.unit).toBe('steps')
  })
})

describe('planDay: deep work', () => {
  const plan = planDay([], { ...base, role: 'deep' })
  it('breaks 4-5 times a day on a 60-90 minute cadence', () => {
    expect(plan.breaks.length).toBeGreaterThanOrEqual(4)
    expect(plan.breaks.length).toBeLessThanOrEqual(5)
    expect(plan.longestSitAfter).toBeLessThanOrEqual(90)
  })
  it('still anchors on 12:50', () => {
    expect(plan.breaks.map((b) => b.start)).toContain(t(12, 50))
  })
})

describe('planDay: Ramadan', () => {
  const plan = planDay(SAMPLE_DAY, { ...base, ramadan: true })
  it('uses shorter breaks', () => {
    for (const b of plan.breaks) expect(b.end - b.start).toBeLessThanOrEqual(3)
    expect(plan.movementMinutes).toBeLessThan(30)
  })
  it('places no break in the last two working hours', () => {
    for (const b of plan.breaks) expect(b.start).toBeLessThan(t(13, 30))
  })
})
