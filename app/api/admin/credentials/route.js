import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { readJSON, updateJSON } from '@/lib/data';
import { getAdminSession, signSession, ADMIN_COOKIE_NAME, ADMIN_COOKIE_OPTIONS, initAdminCredentials } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = getAdminSession(cookies());
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newEmail, newPassword } = await req.json().catch(() => ({}));
    const admin = readJSON('admin.json', null) || initAdminCredentials();

    if (!currentPassword) {
      return NextResponse.json({ success: false, message: 'Current password is required.' }, { status: 400 });
    }

    const isMatch = admin.passwordHash && bcrypt.compareSync(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect.' }, { status: 401 });
    }

    let finalEmail = admin.email;
    if (newEmail && newEmail.trim()) {
      const trimmedEmail = newEmail.trim().toLowerCase();
      if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
        return NextResponse.json({ success: false, message: 'Please provide a valid email address.' }, { status: 400 });
      }
      finalEmail = trimmedEmail;
    }

    let newHash = admin.passwordHash;
    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json({ success: false, message: 'New password must be at least 6 characters.' }, { status: 400 });
      }
      newHash = bcrypt.hashSync(newPassword.trim(), 10);
    }

    await updateJSON('admin.json', (current = {}) => {
      return {
        ...current,
        email: finalEmail,
        passwordHash: newHash,
        updatedAt: new Date().toISOString(),
      };
    }, {});

    const token = signSession(finalEmail);
    const response = NextResponse.json({
      success: true,
      message: 'Admin credentials updated successfully!',
      email: finalEmail,
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, ADMIN_COOKIE_OPTIONS);
    return response;
  } catch (err) {
    console.error('Error in credentials update:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
