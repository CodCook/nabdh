import type { CheckinEvent, SyncAdapter } from './types'

/**
 * Optional adapter so judges' real phones can drive the projector.
 * Enabled only when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY exist.
 * Uses Realtime broadcast (no tables needed, nothing is stored).
 */
export function createSupabaseAdapter(url: string, key: string): SyncAdapter {
  type Client = import('@supabase/supabase-js').SupabaseClient
  let clientP: Promise<Client> | null = null
  const client = () =>
    (clientP ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(url, key, { auth: { persistSession: false } })))

  let sendChan: ReturnType<Client['channel']> | null = null
  let sendReady: Promise<void> | null = null
  const ensureSender = () =>
    (sendReady ??= client().then(
      (c) =>
        new Promise<void>((res) => {
          sendChan = c.channel('nabdh', { config: { broadcast: { self: false } } })
          sendChan.subscribe((st) => st === 'SUBSCRIBED' && res())
        }),
    ))

  return {
    name: 'supabase',
    publish(evt) {
      ensureSender().then(() => sendChan?.send({ type: 'broadcast', event: 'checkin', payload: evt }))
    },
    subscribe(cb) {
      let chan: ReturnType<Client['channel']> | null = null
      let c: Client | null = null
      let dead = false
      client().then((cl) => {
        if (dead) return
        c = cl
        chan = cl.channel('nabdh')
        chan.on('broadcast', { event: 'checkin' }, ({ payload }) => cb(payload as CheckinEvent)).subscribe()
      })
      return () => {
        dead = true
        if (chan && c) c.removeChannel(chan)
      }
    },
  }
}
