import '../../public/css/admin.css';

export const metadata = {
  title: 'Admin Dashboard & CMS — RiderSaathi',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-body" style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}
