import { fetchDashboard } from '@/lib/api';

export default async function ModeratorDashboard() {
  const data = await fetchDashboard('moderator');
  return <div>{data}</div>;
}