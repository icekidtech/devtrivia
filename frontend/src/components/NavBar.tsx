'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
  profileImage?: string;
};

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

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
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-cyan-400/20 py-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center px-4">
          <Link href="/" className="text-cyan-400 font-bold text-xl">DevTrivia</Link>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-cyan-400/20 py-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold relative group">
              <span className="text-cyan-400 neon-text">Dev</span>
              <span className="text-fuchsia-500 neon-text">Trivia</span>
              <span className="absolute -inset-2 bg-cyan-400/5 rounded-lg scale-0 group-hover:scale-100 transition-all duration-300 -z-10"></span>
            </h1>
          </Link>
        </div>

        <nav className="flex items-center space-x-6">
          {!user ? (
            <>
              <Link href="/" className="text-gray-200 hover:text-cyan-400 transition-colors duration-300">
                Home
              </Link>
              <Link href="/about" className="text-gray-200 hover:text-cyan-400 transition-colors duration-300">
                About Us
              </Link>
              <Link href="/signup" className="text-gray-200 hover:text-cyan-400 transition-colors duration-300">
                Signup
              </Link>
              <Link href="/login" className="cyberpunk-btn">
                Login
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center mr-6">
                {/* Profile Image */}
                <div className="mr-3">
                  {user.profileImage ? (
                    <img 
                      src={`${BACKEND}${user.profileImage}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                      onError={(e) => {
                        console.error('Image failed to load');
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center font-bold text-gray-200">
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                
                {/* Welcome message */}
                <span className="text-gray-200 font-semibold">Welcome, {user.name}!</span>
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
              
              <button 
                onClick={handleLogout}
                className="cyberpunk-btn-outline"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}