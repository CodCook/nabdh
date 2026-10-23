# نبض · Nabdh

Front-end prototype for the "Innovation in Sports for All" hackathon (Workplace track). The cadence engine, relay, savings maths, timers and sync all compute for real. Only the NFC plate and the Outlook calendar are simulated.

## Run

```bash
npm install
npm run dev        # phone: /app   stage: /stage
npm run test       # engine unit tests (cadence, relay, savings)
npm run build
```

## Demo script (two tabs, same browser)

1. Open `/stage` on the projector, full screen with **F**. Keys: **T** random check-in, **H** HR check-in, **R** reset the day.
2. Open `/app` on the phone tab. «تخطَّ التهيئة» skips onboarding for the demo.
3. **نظّم يومي**: meetings shrink, coral dots slide into the gaps, the counter climbs to **+٣٠**.
4. Tap a break (or the bell for the nudge banner), do the guided break, then **المس اللوحة**. The HR line on `/stage` beats and its count goes up by one.
5. Tap the plate again inside 60 seconds to show the cooldown rejection.
6. Settings: switch to **النمط المتكيّف** (bigger targets, voice on) and toggle **وضع رمضان** (the pulse slows everywhere).
7. Role «خدمة المراجعين» adds the **النوافذ** tab: scrub the clock and watch coverage stay at 100%.

## Editable before the pitch

- Field-test numbers on the stage: `src/config/testResults.ts`
- Sample day and prayer times: `src/data/sampleDay.ts` (prayer times are also editable in Settings)
- Copy: `src/i18n/ar.ts`, `src/i18n/en.ts`

## Real phones driving the projector (optional)

By default phone and stage sync over `BroadcastChannel` (same browser only). For judges' own phones, set Supabase Realtime keys; nothing is stored, it only relays `{ dept, mode, ts }`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Copy `.env.example` to `.env.local` locally, or add them in the Vercel project settings.

## Deploy (GitHub Pages)

Pushing to `main` runs `.github/workflows/pages.yml` (tests, build, deploy). The app uses hash routes, so the URLs are `https://<user>.github.io/<repo>/#/app` and `.../#/stage`.

The stage footer draws its own QR at runtime from the current address. `npm run qr -- https://<user>.github.io/<repo>` also writes a static `public/qr-app.svg`.

## Privacy by construction

The only payload that leaves a phone is `{ dept, mode, ts }`. Streaks and minutes live in `localStorage` on the device.
