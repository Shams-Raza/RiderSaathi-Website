import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateJSON } from '@/lib/data';
import { getAdminSession } from '@/lib/auth';
import { deepMerge } from '@/lib/driver';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = getAdminSession(cookies());
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    let updatedResult = null;
    await updateJSON('settings.json', (current = {}) => {
      const data = { ...body };

      ['homeSections', 'numbers', 'socialLinks', 'floatingSocial', 'location', 'howItWorks', 'content_en', 'content_hi', 'theme'].forEach(sectionKey => {
        if (data[sectionKey] && typeof data[sectionKey] === 'object') {
          data[sectionKey] = deepMerge(current[sectionKey] || {}, data[sectionKey]);
        }
      });

      if ('showBanner' in data) {
        data.showBanner = data.showBanner === true || data.showBanner === 'true' || data.showBanner === 'on';
      }

      const merged = deepMerge(current, data);
      delete merged.adminPassword;
      updatedResult = merged;
      return merged;
    }, {});

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully!',
      settings: updatedResult,
    });
  } catch (err) {
    console.error('Error saving settings:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
