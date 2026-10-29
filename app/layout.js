import '../public/css/style.css';
import { headers, cookies } from 'next/headers';
import { Outfit, Plus_Jakarta_Sans, Noto_Sans_Devanagari, JetBrains_Mono } from 'next/font/google';
import { getSettings, resolveLang } from '@/lib/data';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-devanagari',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export const runtime = 'nodejs';

export async function generateMetadata() {
  const settings = getSettings();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
  const siteName = settings.siteName || 'RiderSaathi';
  const defaultTitle = settings.seoTitle || `${siteName} — Smart Ride Filter App for Rapido, Uber & Porter Drivers`;
  const defaultDesc =
    settings.seoDescription ||
    'Smart ride filtering assistant for Rapido, Uber and Porter drivers. Set custom rules, pickup distance limits, and auto-accept rides. First 10 rides are free.';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: defaultTitle,
      template: `%s — ${siteName}`,
    },
    description: defaultDesc,
    keywords:
      settings.seoKeywords ||
      'ride filter app for drivers, rapido ride filter app, uber driver ride filter, porter delivery filter, rider saathi, driver ride assistant, ride filter karne wala app, driver productivity app',
    manifest: '/manifest.json',
    icons: {
      icon: '/images/icon.svg',
      apple: '/images/icon.svg',
    },
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      url: baseUrl,
      siteName,
      locale: 'hi_IN',
      alternateLocale: ['en_US'],
      type: 'website',
      images: [
        {
          url: '/images/og-default.png',
          width: 1200,
          height: 630,
          alt: siteName,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: defaultDesc,
      images: ['/images/og-default.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({ children }) {
  const headersList = headers();
  const cookieStore = cookies();
  const lang = resolveLang(null, cookieStore, headersList);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${outfit.variable} ${notoSansDevanagari.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta name="view-transition" content="same-origin" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);document.documentElement.dataset.theme=t;}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
