import { describe, expect, it } from 'vitest'
import { coverageAt, isOpen, maxClosed, openCount, requiredOpen, staggerWindows } from '../relay'

const t = (h: number, m = 0) => h * 60 + m
const three = staggerWindows({ windows: 3, firstBreak: t(10, 5) })

describe('relay', () => {
  it('staggers three windows at 10:05, 10:10 and 10:15', () => {
    expect(three.map((w) => w.breakStart)).toEqual([t(10, 5), t(10, 10), t(10, 15)])
  })
  it('keeps two of three windows open at every minute of the morning', () => {
    for (let m = t(9, 30); m <= t(11); m++) {
      expect(openCount(three, m)).toBeGreaterThanOrEqual(2)
      expect(coverageAt(three, m)).toBe(100)
    }
  })
  it('closes window 1 only between 10:05 and 10:10', () => {
    expect(isOpen(three[0], t(10, 7))).toBe(false)
    expect(isOpen(three[1], t(10, 7))).toBe(true)
    expect(openCount(three, t(10, 7))).toBe(2)
  })
  it('generalizes to N windows', () => {
    expect(requiredOpen(6)).toBe(4)
    expect(maxClosed(6)).toBe(2)
    const six = staggerWindows({ windows: 6, firstBreak: t(10), breakMinutes: 6 })
    for (let m = t(9); m <= t(12); m++) expect(openCount(six, m)).toBeGreaterThanOrEqual(4)
    // two may close at once, so the stagger is half the break
    expect(six[1].breakStart - six[0].breakStart).toBe(3)
  })
  it('reports a shortfall if windows are over-closed', () => {
    const bad = [1, 2, 3].map((id) => ({ id, breakStart: t(10), breakEnd: t(10, 5) }))
    expect(coverageAt(bad, t(10, 2))).toBe(0)
  })
})
