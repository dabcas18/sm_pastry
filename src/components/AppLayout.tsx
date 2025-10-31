'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import Image from 'next/image';

type AppLayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export default function AppLayout({ children, title }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#FFF8F5]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <Image
                src="/logo.jpg"
                alt="Sisters Mom Logo"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            {title && <h1 className="text-lg font-bold text-gray-800">{title}</h1>}
          </div>
        </header>

        {/* Floating Burger Menu (Mobile Only) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-30 bg-[#A9DFBF] text-white p-4 rounded-full shadow-lg hover:bg-[#82C3A3] transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
