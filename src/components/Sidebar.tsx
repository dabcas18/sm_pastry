'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, TrendingUp, Package, LogOut, User, Menu as MenuIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [showLogout, setShowLogout] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername || 'User');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    router.push('/login');
  };

  const navItems = [
    { href: '/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/sales', label: 'Sales', icon: TrendingUp },
    { href: '/production', label: 'Production', icon: Package },
    { href: '/menu', label: 'Menu', icon: MenuIcon },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${isCollapsed ? 'justify-center w-full' : ''}`}
              >
                <div className={`rounded-full overflow-hidden flex-shrink-0 ${isCollapsed ? 'h-10 w-10' : 'h-16 w-16'}`}>
                  <Image
                    src="/logo.jpg"
                    alt="Sisters Mom Logo"
                    width={isCollapsed ? 40 : 64}
                    height={isCollapsed ? 40 : 64}
                    className="object-cover"
                  />
                </div>
                {!isCollapsed && (
                  <div className="flex-1">
                    <h2 className="font-bold text-gray-800 text-sm">Sisters & Mom</h2>
                    <p className="text-xs text-gray-500">Pastry Shop</p>
                  </div>
                )}
              </button>
              {!isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="hidden lg:block text-gray-400 hover:text-gray-600"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="hidden lg:block absolute right-2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm ${
                    isActive
                      ? 'bg-[#A9DFBF] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Account Section at Bottom */}
          <div className="p-3 border-t border-gray-200">
            <div className="relative">
              <button
                onClick={() => setShowLogout(!showLogout)}
                className={`flex items-center gap-3 px-3 py-2.5 w-full text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? username : ''}
              >
                <div className="h-8 w-8 rounded-full bg-[#A9DFBF] flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-800">{username}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                )}
              </button>

              {/* Logout Dropdown */}
              {showLogout && (
                <div className={`absolute bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg ${isCollapsed ? 'left-full ml-2' : 'left-0 right-0'}`}>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
