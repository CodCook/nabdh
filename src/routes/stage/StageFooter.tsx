import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useT } from '../../i18n'

export default function StageFooter() {
  const { t } = useT()
  const [svg, setSvg] = useState('')
  useEffect(() => {
    const url = (import.meta.env.VITE_APP_URL as string | undefined) ?? `${window.location.origin}/app`
    QRCode.toString(url, { type: 'svg', margin: 1, color: { dark: '#0E0C0B', light: '#F5F0E8' } }).then(setSvg)
  }, [])
  return (
    <footer className="flex items-center justify-between gap-8 text-[22px] text-sand/60">
      <p>{t.stage.privacy}</p>
      <div className="flex items-center gap-4">
        <span className="text-sand/80">{t.stage.tryNow}</span>
        <div className="w-[80px] h-[80px] rounded overflow-hidden" role="img" aria-label={`${t.stage.tryNow} — QR`}
          dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
    </footer>
  )
}
