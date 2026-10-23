import PulseLine from '../../components/PulseLine'
import LangToggle from '../../components/LangToggle'
import { useT } from '../../i18n'

export default function AppRoute() {
  const { t } = useT()
  return (
    <div className="app-root min-h-full flex justify-center bg-sand">
      <main className="w-full max-w-[430px] min-h-full px-6 py-8 flex flex-col gap-8">
        <LangToggle />
        <div className="text-maroon mt-16">
          <PulseLine variant="loop" height={64} strokeWidth={3} />
        </div>
        <h1 className="kufi text-5xl text-maroon">{t.appName}</h1>
        <p className="text-warm">{t.tagline}</p>
      </main>
    </div>
  )
}
