/**
 * 90-day pilot targets shown on the stage. EDIT THESE before the pitch.
 * `current` is the progress so far (same unit as `target`); it is 0 until the pilot starts, so the rings are empty.
 */
export type TargetUnit = 'count' | 'pct'

export interface PilotTarget {
  id: 'breaks' | 'completion' | 'zeroSweat' | 'participation' | 'sitting'
  target: number
  unit: TargetUnit
  /** "3 or more" */
  orMore?: boolean
  current: number
}

export const pilotTargets: PilotTarget[] = [
  { id: 'breaks', target: 3, unit: 'count', orMore: true, current: 0 }, // breaks per employee per day
  { id: 'completion', target: 70, unit: 'pct', current: 0 }, // break completion rate
  { id: 'zeroSweat', target: 90, unit: 'pct', current: 0 }, // breaks with no sweat
  { id: 'participation', target: 60, unit: 'pct', current: 0 }, // departments taking part
  { id: 'sitting', target: 30, unit: 'pct', current: 0 }, // fewer unbroken sitting stretches over an hour
]
