import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { track } from '@/lib/track';

// Same rule as site/p.html, so a slug the page would count is one the app counts.
const SLUG = /^[a-z0-9-]{1,40}$/;

/**
 * Partner link (DECISIONS.md D48): https://app.remitbridgelabs.org/p/<partner> opens the app
 * here when it's installed (a universal link), and the page's "Open the app" button sends
 * remitbridge://p/<partner> to the same place. The visit is counted (D31) with platform
 * ios or android, so it stays apart from the page's own web count, and the person lands
 * where any launch would: onboarding the first time, Compare after that.
 */
export default function PartnerLink() {
  const { partner } = useLocalSearchParams<{ partner: string }>();
  const slug = (partner ?? '').toLowerCase();

  useEffect(() => {
    if (SLUG.test(slug)) track('partner_link_opened', { partner: slug });
  }, [slug]);

  return <Redirect href="/" />;
}
