'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.name) {
      setIsLoggedIn(true);
      setUserName(user.name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    window.location.href = '/login';
  };

  return (
    <header className="bg-primary text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">DevTrivia</h1>
        <nav className="space-x-4">
          {!isLoggedIn ? (
            <>
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/about" className="hover:underline">About Us</Link>
              <Link href="/signup" className="hover:underline">Signup</Link>
              <Link href="/login" className="hover:underline">Login</Link>
            </>
          ) : (
            <>
              <span className="font-semibold">Welcome, {userName}!</span>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/profile" className="hover:underline">Profile</Link>
              <button onClick={handleLogout} className="hover:underline">Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}