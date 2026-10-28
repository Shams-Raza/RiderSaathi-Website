import { cookies } from 'next/headers';
import { getSettings } from '@/lib/data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyMobileBar from '@/components/StickyMobileBar';
import FloatingSocialDock from '@/components/FloatingSocialDock';
import ScrollReveal from '@/components/ScrollReveal';

export default function SiteLayout({ children }) {
  const settings = getSettings();
  const cookieStore = cookies();
  const lang = cookieStore.get('lang')?.value || 'hi';

  return (
    <>
      <Header settings={settings} lang={lang} />
      {children}
      <StickyMobileBar settings={settings} lang={lang} />
      <FloatingSocialDock settings={settings} />
      <Footer settings={settings} lang={lang} />
      <ScrollReveal />
    </>
  );
}
