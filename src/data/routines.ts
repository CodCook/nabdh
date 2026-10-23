import type { Mode } from '../engine/cadence'
import type { Dict } from '../i18n/ar'

export type StepKey = keyof Dict['guided']['s']

export interface Step {
  key: StepKey
  seconds: number
  /** spoken count-along (reps spread across the step) */
  reps?: number
  /** held position: the voice names it, then counts the last seconds down */
  hold?: boolean
}

export interface Routine {
  mode: Mode
  kind: 'walk' | 'steps'
  steps: Step[]
}

export interface RoutineOpts { mode: Mode; ramadan: boolean; pregnancy: boolean }

/** Walking cadence for the pulse: normal day vs. a visibly slower Ramadan pace. */
export const WALK_BPM = 100
export const WALK_BPM_RAMADAN = 56

export function buildRoutine({ mode, ramadan, pregnancy }: RoutineOpts): Routine {
  if (mode === 'masar') {
    return { mode, kind: 'walk', steps: [{ key: 'breathe', seconds: ramadan ? 90 : 120 }] }
  }

  if (mode === 'ladies') {
    // shoulder rolls x10, torso twists x8 each side, calf/ankle pumps. ~2:15
    const gentle = ramadan || pregnancy // no twisting when pregnant or fasting: neck and breath instead
    const steps: Step[] = gentle
      ? [
          { key: 'shoulders', seconds: 35, reps: 10 },
          { key: 'neck', seconds: ramadan ? 20 : 30 },
          { key: 'breathe', seconds: ramadan ? 25 : 35 },
          { key: 'ankles', seconds: ramadan ? 30 : 40 },
        ]
      : [
          { key: 'shoulders', seconds: 35, reps: 10 },
          { key: 'twistR', seconds: 30, reps: 8 },
          { key: 'twistL', seconds: 30, reps: 8 },
          { key: 'ankles', seconds: 40 },
        ]
    return { mode, kind: 'steps', steps }
  }

  // adaptive: pressure relief holds, cat-cow, pelvic tilts, 60 s upper-body march. ~4:00
  const hold = ramadan ? 20 : 30
  const steps: Step[] = [
    { key: 'lean', seconds: hold, hold: true },
    { key: 'sideR', seconds: hold, hold: true },
    { key: 'sideL', seconds: hold, hold: true },
    { key: 'catcow', seconds: ramadan ? 20 : 30 },
    { key: 'pelvic', seconds: ramadan ? 20 : 30 },
    { key: 'march', seconds: ramadan ? 30 : 60 },
  ]
  return { mode, kind: 'steps', steps }
}

export const routineSeconds = (r: Routine) => r.steps.reduce((s, x) => s + x.seconds, 0)
