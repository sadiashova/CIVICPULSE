import { NextResponse } from 'next/server';
import { SEED_USERS } from '../../../data/seedData';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = SEED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials or user not registered' }, { status: 401 });
    }

    if (user.status === 'INACTIVE') {
      return NextResponse.json({ error: 'User account is deactivated' }, { status: 403 });
    }

    const token = `cp_jwt_server_${Date.now()}_${user.id}`;
    return NextResponse.json({
      token,
      user,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server authorization failure' }, { status: 500 });
  }
}
