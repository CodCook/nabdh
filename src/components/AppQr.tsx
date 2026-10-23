import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/** QR that opens the phone app (#/app) at the current address, or at VITE_APP_URL when set. */
export default function AppQr({ size = 80, label }: { size?: number; label: string }) {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    const url = (import.meta.env.VITE_APP_URL as string | undefined) ?? `${window.location.origin}${window.location.pathname}#/app`
    QRCode.toString(url, { type: 'svg', margin: 1, color: { dark: '#0E0C0B', light: '#F5F0E8' } }).then(setSvg)
  }, [])
  return <div className="rounded overflow-hidden flex-none" style={{ width: size, height: size }} role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />
}
