import Image from 'next/image';

export default function LoginPage() {
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

        <form className="space-y-6">
          <div>
            <label htmlFor="username" className="sr-only">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
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
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FADBD8] focus:border-transparent"
              placeholder="Password"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 text-lg font-semibold text-white bg-[#A9DFBF] rounded-xl hover:bg-[#82C3A3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A9DFBF] transition duration-300"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
