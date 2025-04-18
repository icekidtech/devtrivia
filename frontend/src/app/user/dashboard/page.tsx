import { fetchDashboard } from '@/lib/api';

export default async function UserDashboard() {
  const data = await fetchDashboard('user');
  return <div>{data}</div>;
}