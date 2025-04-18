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

export async function signup(data: { email: string; name: string; password: string; role: string }) {
  return fetchBackend('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function login(data: { email: string; password: string }) {
  return fetchBackend('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function fetchDashboard(role: string) {
  return fetchBackend(`/${role}/dashboard`);
}