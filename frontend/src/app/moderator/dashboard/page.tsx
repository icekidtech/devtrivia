import ModeratorDashboardClient from './ModeratorDashboardClient';

export const metadata = {
  title: 'Moderator Dashboard | DevTrivia',
  description: 'Create and manage quizzes, and view leaderboards.',
};

export default function ModeratorDashboardPage() {
  return <ModeratorDashboardClient />;
}