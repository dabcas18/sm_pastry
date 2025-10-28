'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import Image from 'next/image';

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#FFF8F5]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Menu size={24} />
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden">
            <Image
              src="/logo.jpg"
              alt="Sisters Mom Logo"
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
