/** The only thing that ever leaves a phone: department code, mode, timestamp. No identity, no health data. */
export interface CheckinEvent {
  dept: string // department code, e.g. HR_04
  mode: 'masar' | 'ladies' | 'adaptive'
  ts: number // epoch ms
}

export interface SyncAdapter {
  name: string
  publish(evt: CheckinEvent): void
  subscribe(cb: (evt: CheckinEvent) => void): () => void
}
