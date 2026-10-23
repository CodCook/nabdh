import { useT } from '../../i18n'
import AppQr from '../../components/AppQr'

export default function StageFooter() {
  const { t } = useT()
  return (
    <footer className="flex items-center justify-between gap-8 text-[22px] text-sand/60">
      <p>{t.stage.privacy}</p>
      <div className="flex items-center gap-4">
        <span className="text-sand/80">{t.stage.tryNow}</span>
        <AppQr size={80} label={`${t.stage.tryNow} — QR`} />
      </div>
    </footer>
  )
}
