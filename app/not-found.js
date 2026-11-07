import SiteLayout from './(site)/layout';
import NotFoundContent from '@/components/NotFoundContent';

export const metadata = {
  title: '404 - Page Not Found',
};

export default function RootNotFound() {
  return (
    <SiteLayout>
      <NotFoundContent />
    </SiteLayout>
  );
}

