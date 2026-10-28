import { getSettings } from '@/lib/data';

export default function manifest() {
  const settings = getSettings();
  return {
    name: `${settings.siteName || 'RiderSaathi'} — Smart Ride Filter Assistant`,
    short_name: settings.siteName || 'RiderSaathi',
    description:
      settings.seoDescription ||
      'Independent ride-filtering assistant for Rapido, Uber and Porter drivers.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/images/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
  };
}
