/** Inside the #/demo phone frame, tell the parent page that a demo step happened in the phone. */
export type DemoStep = 'organize'

export function notifyDemo(step: DemoStep) {
  if (window.self === window.top) return
  window.parent.postMessage({ type: 'nabdh-step', step }, window.location.origin)
}
