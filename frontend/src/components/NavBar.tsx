'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
  profileImage?: string;
};

const navigation = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Features", href: "/features" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/faq" },
];

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Don't render the navbar on dashboard pages
  if (pathname?.includes('/dashboard')) {
    return null;
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }

      // Listen for storage changes
      const onStorage = () => {
        try {
          const stored = localStorage.getItem('user');
          setUser(stored ? JSON.parse(stored) : null);
        } catch (err) {
          console.error('Storage event error:', err);
        }
      };

      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    } catch (err) {
      console.error('Failed to parse user data:', err);
      setError('Failed to load user data');
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      alert('Failed to log out. Please try again.');
    }
  };

  // Show a fallback UI if there's an error
  if (error) {
    return (
      <nav className="relative z-50 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-cyan-400">
                DevTrivia
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="relative z-50 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-cyan-400">
              DevTrivia
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors hover:text-cyan-400",
                    pathname === item.href
                      ? "text-cyan-400"
                      : "text-gray-300"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <div className="hidden md:block">
                  <Button
                    asChild
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
                <div className="md:hidden">
                  <Button
                    asChild
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  {/* Profile Image */}
                  <div className="flex items-center mr-4">
                    {user.profileImage ? (
                      <img
                        src={`${BACKEND}${user.profileImage}`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white mr-2"
                        onError={(e) => {
                          console.error('Image failed to load');
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center font-bold text-gray-200 mr-2">
                        {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="text-gray-200 font-semibold">Welcome, {user.name}</span>
                  </div>

                  <Link
                    href={`/${user.role.toLowerCase()}/dashboard`}
                    className="text-gray-200 hover:text-cyan-400 transition-colors duration-300"
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/profile"
                    className="text-gray-200 hover:text-cyan-400 transition-colors duration-300"
                  >
                    Profile
                  </Link>

                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                  >
                    Logout
                  </Button>
                </div>

                {/* Mobile menu */}
                <div className="md:hidden">
                  <Button
                    onClick={handleLogout}
                    size="sm"
                    variant="outline"
                    className="border-cyan-400 text-cyan-400"
                  >
                    Logout
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}