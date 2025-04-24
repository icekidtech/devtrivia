import UserDashboardClient from './UserDashboardClient';

export const metadata = {
  title: 'User Dashboard | DevTrivia',
  description: 'Join quizzes, view your past results, and track your performance.',
};

export default function UserDashboardPage() {
  return <UserDashboardClient />;
}