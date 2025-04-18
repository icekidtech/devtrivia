import AdminDashboardClient from './AdminDashboardClient';

export const metadata = {
  title: 'Admin Dashboard | DevTrivia',
  description: 'Manage users, quizzes, leaderboards, and competitions.',
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}