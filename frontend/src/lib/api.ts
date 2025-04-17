export async function fetchBackend(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`, options);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
  }
  return res.json();
}

export async function getQuizzes() {
  return fetchBackend('/api/quizzes');
}