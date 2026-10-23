import type { CheckinEvent, SyncAdapter } from './types'

const CHANNEL = 'nabdh-checkins'

/** Works between tabs of the same browser (phone view + stage view). */
export function createBroadcastAdapter(): SyncAdapter {
  const supported = typeof BroadcastChannel !== 'undefined'
  const out = supported ? new BroadcastChannel(CHANNEL) : null
  return {
    name: 'broadcast',
    publish(evt) {
      out?.postMessage(evt)
    },
    subscribe(cb) {
      if (!supported) return () => {}
      // a channel instance does not receive its own messages, so listen on a dedicated one
      const inbox = new BroadcastChannel(CHANNEL)
      inbox.onmessage = (m: MessageEvent<CheckinEvent>) => cb(m.data)
      return () => inbox.close()
    },
  }
}
