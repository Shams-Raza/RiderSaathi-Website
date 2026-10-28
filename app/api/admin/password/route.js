import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
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

    const { newPassword } = await req.json().catch(() => ({}));
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await updateJSON('admin.json', (admin = {}) => {
      admin.passwordHash = newHash;
      admin.updatedAt = new Date().toISOString();
      return admin;
    }, {});

    return NextResponse.json({ success: true, message: 'Password updated securely with bcrypt.' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
