'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { setIsAuthenticated } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setIsAuthenticated(true);
      setMessage('Login successful');
      router.push('/');
    } else {
      setMessage(data.error || 'Login failed');
    }
  }

  async function handleGoogleLogin(response: any) {
    try {
      const decoded: any = jwtDecode(response.credential);
      const { name, email, sub: googleId } = decoded;

      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, googleId }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        router.push('/');
      } else {
        setMessage('Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setMessage('Google login failed');
    }
  }

  async function handleForgotPassword() {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setStep(2);
      setMessage('OTP sent to your email');
    } else {
      setMessage('Failed to send OTP');
    }
  }

  async function handleResetPassword() {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    if (res.ok) {
      setShowForgotPassword(false);
      setMessage('Password updated successfully. Please login.');
    } else {
      setMessage('Invalid OTP or password reset failed');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4 text-[#006A71]">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full text-black"
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full text-black"
        />
        <button type="submit" className="bg-[#9ACBD0] text-white p-2 w-full hover:bg-[#48A6A7]">
          Login
        </button>
      </form>
      <div className="mt-4">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setMessage('Google login failed')}
        />
      </div>
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-600">
          Didn't have an account?{' '}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
        <button
          onClick={() => setShowForgotPassword(true)}
          className="text-sm text-blue-500 hover:underline"
        >
          Forgot Password?
        </button>
      </div>
      {message && <p className="mt-4 text-green-600">{message}</p>}

      {showForgotPassword && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <button onClick={() => setShowForgotPassword(false)} className="float-right text-red-500">✖</button>
            <h2 className="text-xl font-bold mb-4 text-black ">Reset Password</h2>

            {step === 1 ? (
              <>
                <input type="email" placeholder="Enter your email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="border p-2 w-full text-black"
                />
                <button onClick={handleForgotPassword} className="bg-blue-500 text-white p-2 w-full mt-4 text-black">
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <input type="text" placeholder="Enter OTP"
                  value={otp} onChange={(e) => setOtp(e.target.value)}
                  className="border p-2 w-full text-black"
                />
                <input type="password" placeholder="New Password"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="border p-2 w-full mt-2 text-black"
                />
                <button onClick={handleResetPassword} className="bg-green-500 text-white p-2 w-full mt-4 ">
                  Reset Password
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
