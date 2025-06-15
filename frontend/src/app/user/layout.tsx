import React from 'react';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    // Remove the top navigation bar from here and just render the children directly
    <main>
      {/* Delete this entire navigation bar */}
      {/* <div className="bg-slate-900 border-b border-cyan-400/20 py-4 px-6 flex justify-between items-center">
        <Link href="/" className="block">
          <h1 className="text-xl font-bold relative group">
            <span className="text-cyan-400 neon-text">Dev</span>
            <span className="text-fuchsia-500 neon-text">Trivia</span>
          </h1>
        </Link>
        
        <div className="flex items-center gap-6">
          <span className="text-gray-200">Welcome, test-user</span>
          <Link href="/dashboard" className="text-gray-200 hover:text-cyan-400">Dashboard</Link>
          <Link href="/profile" className="text-gray-200 hover:text-cyan-400">Profile</Link>
          <button className="border border-cyan-400 text-cyan-400 px-4 py-1 rounded hover:bg-cyan-400/10">Logout</button>
        </div>
      </div> */}
      
      {children}
    </main>
  );
}