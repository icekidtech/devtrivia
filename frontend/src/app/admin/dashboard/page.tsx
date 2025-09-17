import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient';

// This should be a server component that handles auth and renders the client component
export default function AdminDashboard() {
  // Note: In a real app, you'd check authentication server-side here
  // For now, we'll let the client component handle the auth check
  
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <AdminDashboardClient />
      </div>
    </div>
  );
}