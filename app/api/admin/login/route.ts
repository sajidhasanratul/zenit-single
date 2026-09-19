import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Both username and password are required.' }, { status: 400 });
    }

    const users = await getUsers();
    const matchedUser = users.find(
      u => u.username === username.trim().toLowerCase() && u.passwordHash === password.trim()
    );

    if (matchedUser) {
      const response = NextResponse.json({ success: true, role: matchedUser.role });
      
      response.cookies.set('zenit_admin_session', matchedUser.role, {
        httpOnly: true,
        path: '/',
        maxAge: 24 * 60 * 60, // 1 day session
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
  } catch (err: any) {
    console.error('Admin authentication failure:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
