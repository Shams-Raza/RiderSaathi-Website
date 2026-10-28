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

    const { slug, originalSlug, title, category, summary, content } = await req.json().catch(() => ({}));

    if (!title || !content) {
      return NextResponse.json({ success: false, message: 'Guide Title and Content are required.' }, { status: 400 });
    }

    let finalSlug = (slug || title).toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-');

    if (!finalSlug) finalSlug = 'guide-' + Date.now().toString(36);

    const guideData = {
      slug: finalSlug,
      title: String(title).trim(),
      category: category ? String(category).trim() : 'General',
      summary: summary ? String(summary).trim() : '',
      content: String(content).trim(),
    };

    const lookupSlug = originalSlug || finalSlug;

    await updateJSON('guides.json', (guides = []) => {
      const existingIdx = guides.findIndex(g => g.slug === lookupSlug);
      if (existingIdx >= 0) {
        guides[existingIdx] = guideData;
      } else {
        guides.push(guideData);
      }
      return guides;
    }, []);

    return NextResponse.json({ success: true, message: `Guide "${guideData.title}" saved!`, guide: guideData });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
