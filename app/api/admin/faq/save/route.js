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

    const { id, q, a } = await req.json().catch(() => ({}));
    if (!q || !a) {
      return NextResponse.json({ success: false, message: 'Question and Answer are required.' }, { status: 400 });
    }

    const faqId = id ? Number(id) : Date.now();
    const faqData = {
      id: faqId,
      q: String(q).trim(),
      a: String(a).trim(),
    };

    await updateJSON('faqs.json', (faqs = []) => {
      const existingIdx = faqs.findIndex(f => Number(f.id) === faqId);
      if (existingIdx >= 0) {
        faqs[existingIdx] = faqData;
      } else {
        faqs.push(faqData);
      }
      return faqs;
    }, []);

    return NextResponse.json({ success: true, message: 'FAQ saved successfully!', faq: faqData });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
