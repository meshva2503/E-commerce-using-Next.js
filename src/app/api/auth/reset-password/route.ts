import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await req.json();

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || new Date() > user.otpExpiresAt) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
