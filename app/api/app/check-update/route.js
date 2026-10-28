import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url, 'http://localhost');
    const currentVersion = searchParams.get('version') || '0.0.0';
    const settings = getSettings();
    const latestVersion = settings.appVersion || '5.28.1';
    const hasUpdate = currentVersion !== latestVersion;

    const rawUrl = settings.apkDownloadUrl || '/downloads/RiderSaathi-v5.28.1.apk';
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const apkUrl = rawUrl.startsWith('http') ? rawUrl : `${protocol}://${host}${rawUrl}`;

    return NextResponse.json({
      hasUpdate,
      currentVersion,
      latestVersion,
      apkUrl,
      apkFileSize: settings.apkFileSize || '11.1 MB',
      sha256File: settings.sha256File || '',
      releaseNotes: 'RiderSaathi update with improved speed, lower battery consumption, and latest Rapido/Uber/Porter support.',
      isForceUpdate: false,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
