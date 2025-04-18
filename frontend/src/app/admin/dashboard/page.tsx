import { fetchDashboard } from '@/lib/api';

export default async function AdminDashboard() {
  const data = await fetchDashboard('admin');
  return <div>{data}</div>;
}