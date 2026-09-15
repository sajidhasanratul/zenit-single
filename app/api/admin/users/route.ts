import { NextRequest, NextResponse } from 'next/server';
import { addUser, deleteUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    
    // Only 'admin' can add new users
    if (!adminSession || adminSession.value !== 'admin') {
      return NextResponse.json({ success: false, error: 'Permission denied. Administrator privileges required.' }, { status: 403 });
    }

    const { username, password, role } = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json({ success: false, error: 'Missing mandatory fields: username, password, and role are required.' }, { status: 400 });
    }

    addUser({
      username: username.trim().toLowerCase(),
      passwordHash: password.trim(),
      role: role as 'admin' | 'manager'
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to create user:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    
    // Only 'admin' can delete users
    if (!adminSession || adminSession.value !== 'admin') {
      return NextResponse.json({ success: false, error: 'Permission denied. Administrator privileges required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing user ID search parameter.' }, { status: 400 });
    }

    // Protect against self-deletion (cannot delete the initial seed admin)
    if (id === 'user-admin') {
      return NextResponse.json({ success: false, error: 'System integrity error: Default Administrator profile cannot be deleted.' }, { status: 400 });
    }

    deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete user:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
