import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

  // Remove the authentication token by setting an empty cookie
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    expires: new Date(0), // Expire the cookie immediately
    path: '/',
  });

  return response;
}
