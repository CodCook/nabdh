import { describe, expect, it } from 'vitest'
import { annualSickDaySavingsQar, costRatio, DEFAULT_INPUT, hoursReturnedPerDay, workingDaysEquivalent } from '../savings'

describe('savings', () => {
  it('returns 500 hours a day by default', () => {
    expect(hoursReturnedPerDay(DEFAULT_INPUT)).toBe(500)
  })
  it('expresses 500 hours as about 62 working days', () => {
    expect(workingDaysEquivalent(500)).toBe(62)
  })
  it('scales with employees and meetings', () => {
    expect(hoursReturnedPerDay({ ...DEFAULT_INPUT, employees: 2000, meetingsPerEmployee: 6 })).toBe(2000)
  })
  it('prices avoided sick days', () => {
    expect(annualSickDaySavingsQar(DEFAULT_INPUT)).toBe(1_000_000)
    expect(annualSickDaySavingsQar({ ...DEFAULT_INPUT, sickDaysAvoided: 0.5 })).toBe(500_000)
  })
  it('compares setup cost with a gym fit-out', () => {
    expect(Math.round(costRatio())).toBe(267)
  })
})
