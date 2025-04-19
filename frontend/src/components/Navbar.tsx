'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
    // Listen for storage changes (e.g., login/logout in another tab)
    const onStorage = () => {
      const stored = localStorage.getItem('user');
      setUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <header className="bg-primary text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">DevTrivia</h1>
          {user && (
            <span className="ml-4 font-semibold">Welcome, {user.name}!</span>
          )}
        </div>
        <nav className="space-x-4">
          {!user ? (
            <>
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/about" className="hover:underline">About Us</Link>
              <Link href="/signup" className="hover:underline">Signup</Link>
              <Link href="/login" className="hover:underline">Login</Link>
            </>
          ) : (
            <>
              <Link href={`/${user.role.toLowerCase()}/dashboard`} className="hover:underline">Dashboard</Link>
              <Link href="/profile" className="hover:underline">Profile</Link>
              <button onClick={handleLogout} className="hover:underline">Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}