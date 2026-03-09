import { NextResponse } from 'next/server';
import { getDbStatus } from '@/app/lib/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await getDbStatus();
    const user = await db.get(
      'SELECT id, email FROM admins WHERE email = ? AND password = ?',
      [email, password]
    );

    if (user) {
      // In a real app we'd sign a JWT here. 
      // For MVP, returning the simple user object is enough.
      return NextResponse.json({ user });
    } else {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
