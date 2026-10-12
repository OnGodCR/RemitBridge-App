/**
 * EAS's pre-install hook (it must run before EAS installs the iOS libraries). Only for the `simulator` build profile (eas.json): leaves ML Kit
 * out of autolinking, because Google ships ML Kit without Apple Silicon simulator code, so a
 * build with it comes out Intel-only and won't install on an iOS 27 simulator (2026-10-12).
 * Without it, every screen works and Scan says this build can't read receipts (canScan()).
 * Device and store builds never take this path.
 */
import { readFileSync, writeFileSync } from 'node:fs'

if (process.env.EAS_BUILD_PROFILE === 'simulator') {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
  pkg.expo = { ...pkg.expo, autolinking: { ...pkg.expo?.autolinking, exclude: ['@infinitered/react-native-mlkit-core', '@infinitered/react-native-mlkit-text-recognition'] } }
  writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
  console.log('simulator build: ML Kit left out of autolinking')
}
