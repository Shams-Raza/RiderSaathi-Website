import { NextResponse } from 'next/server';
import { getSettings, updateJSON } from '@/lib/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  // 1. Increment stats counter safely using atomic read-modify-write
  try {
    await updateJSON(
      'stats.json',
      (stats) => {
        const nextStats = stats || {};
        nextStats.downloads = (nextStats.downloads || 0) + 1;
        return nextStats;
      },
      { visitors: 0, downloads: 0, orders: 0, inquiries: 0 }
    );
  } catch (err) {
    // Fail-open: do not block APK download if stats recording fails
    console.error('Failed to increment download counter in /download:', err);
  }

  // 2. Fetch destination APK URL and 302 redirect
  try {
    const settings = getSettings();
    const downloadUrl = settings.apkDownloadUrl || '/downloads/RiderSaathi-v5.28.1.apk';

    if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) {
      return NextResponse.redirect(downloadUrl, 302);
    }
    return NextResponse.redirect(new URL(downloadUrl, request.url), 302);
  } catch (err) {
    console.error('Error resolving APK redirect in /download:', err);
    return NextResponse.redirect(new URL('/downloads/RiderSaathi-v5.28.1.apk', request.url), 302);
  }
}
