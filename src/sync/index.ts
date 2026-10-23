import { createBroadcastAdapter } from './broadcast'
import { createSupabaseAdapter } from './supabase'
import type { CheckinEvent, SyncAdapter } from './types'

export type { CheckinEvent, SyncAdapter }

/** Fans out to every enabled adapter: tabs always, Supabase when env keys exist. */
function build(): SyncAdapter {
  const adapters: SyncAdapter[] = [createBroadcastAdapter()]
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (url && key) adapters.push(createSupabaseAdapter(url, key))
  return {
    name: adapters.map((a) => a.name).join('+'),
    publish: (e) => adapters.forEach((a) => a.publish(e)),
    subscribe: (cb) => {
      const offs = adapters.map((a) => a.subscribe(cb))
      return () => offs.forEach((o) => o())
    },
  }
}

let instance: SyncAdapter | null = null
export const sync = (): SyncAdapter => (instance ??= build())
