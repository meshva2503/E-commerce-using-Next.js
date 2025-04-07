import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
  try {
    const { name, email, googleId } = await req.json();
    
    await connectDB();

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, googleId }); // ✅ New user from Google
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    // Set token in HTTP-only cookies
    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Google login failed' }, { status: 500 });
  }
}
