import { fetchBackend } from '@/lib/api';

export default async function Home() {
  const data = await fetchBackend('/api/test'); // Correct endpoint
  return <div>{data.message}</div>; // Should show "Backend connected!"
}