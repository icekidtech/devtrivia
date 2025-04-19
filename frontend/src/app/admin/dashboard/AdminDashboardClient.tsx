'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboardClient() {
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get admin name
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setUserName(user.name);
      } catch {}
    }
    // Fetch users from backend
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}`,
      },
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = (id: string, newRole: string) => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}`,
      },
      body: JSON.stringify({ role: newRole }),
    })
      .then(res => res.json())
      .then(updatedUser => {
        setUsers(users.map(u => (u.id === id ? { ...u, role: updatedUser.role } : u)));
      });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg">Welcome, {userName}</span>
        <h1 className="text-3xl font-bold text-center flex-1">Administrator Dashboard</h1>
      </div>

      {/* Manage Users */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
        {loading ? (
          <div>Loading users...</div>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Role</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="USER">USER</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* TODO: Add similar sections for quizzes, questions, answers */}
    </div>
  );
}