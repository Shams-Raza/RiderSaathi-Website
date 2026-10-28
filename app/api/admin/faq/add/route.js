import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateJSON } from '@/lib/data';
import { getAdminSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = getAdminSession(cookies());
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { q, a } = await req.json().catch(() => ({}));
    if (!q || !a) {
      return NextResponse.json({ success: false, message: 'Missing question or answer' }, { status: 400 });
    }

    const newFaq = { id: Date.now(), q: String(q).trim(), a: String(a).trim() };

    await updateJSON('faqs.json', (faqs = []) => {
      faqs.push(newFaq);
      return faqs;
    }, []);

    return NextResponse.json({ success: true, faq: newFaq });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
