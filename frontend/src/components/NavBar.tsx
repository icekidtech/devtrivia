import { useState, useEffect } from 'react';
import Link from 'next/link';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function NavBar() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);
  
  return (
    <header className="bg-primary text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">DevTrivia</h1>
        </div>
        
        <nav className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center">
              {/* Profile Image */}
              <div className="mr-3">
                {user.profileImage ? (
                  <img 
                    src={`${BACKEND}${user.profileImage}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center font-bold">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              
              {/* Welcome message */}
              <span className="font-semibold">Welcome, {user.name}!</span>
            </div>
          )}
          
          {user ? (
            <>
              <Link href="/profile" className="hover:underline">
                Profile
              </Link>
              <button 
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-white text-primary hover:bg-gray-100 px-3 py-1 rounded"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}