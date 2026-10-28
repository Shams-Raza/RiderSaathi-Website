import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="error-page-wrap" style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '40px 30px' }}>
        <div style={{ fontSize: '72px', fontWeight: '800', color: 'var(--brand-primary)', lineHeight: 1, marginBottom: '16px' }}>
          404
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-heading)' }}>
          Page Not Found / पेज नहीं मिला
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
          Aap jo page dhoondh rahe hain woh shayad move ho chuka hai ya URL galat hai.
          Kripya home page par wapas jayein.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary">
            Wapas Home Jayein →
          </Link>
          <Link href="/pricing" className="btn btn-secondary">
            Plans Dekhein
          </Link>
        </div>
      </div>
    </div>
  );
}
