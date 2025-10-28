'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Hardcoded credentials: admin / 123456
    if (username === 'admin' && password === '123456') {
      // Store login state in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);

      // Redirect to orders page
      router.push('/orders');
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF8F5]">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-2xl shadow-lg text-center">

        {/* Logo Placeholder */}
        <div className="mx-auto h-24 w-24 rounded-full bg-[#FADBD8] flex items-center justify-center">
          <span className="text-sm text-gray-500">Logo</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome to Sisters and Mom</h1>
          <p className="mt-2 text-gray-600">Log in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="sr-only">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FADBD8] focus:border-transparent"
              placeholder="Username"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FADBD8] focus:border-transparent"
              placeholder="Password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg font-semibold text-white bg-[#A9DFBF] rounded-xl hover:bg-[#82C3A3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A9DFBF] transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
