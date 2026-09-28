# RemitBridge mobile app

Expo (React Native, TypeScript) for iOS and Android. See the repo root README for the
whole project.

```bash
cp .env.example .env.local   # then fill in the two Supabase values
npm start                    # scan the QR code with Expo Go, or press i / a
npm run typecheck
npm run lint
```

Routes live in `src/app/`, shared UI in `src/components/`, data and formatting in
`src/lib/`, design tokens in `src/constants/theme.ts`. Read `CLAUDE.md` in this folder
before touching Expo APIs: SDK 57 differs from older docs.
