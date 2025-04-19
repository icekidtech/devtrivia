'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboardClient() {
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'USER' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'MODERATOR' },
  ]);

  const [quizzes, setQuizzes] = useState([
    { id: 1, title: 'JavaScript Basics', description: 'Test your JS knowledge' },
    { id: 2, title: 'React Advanced', description: 'Deep dive into React' },
  ]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setUserName(user.name);
      } catch {}
    }
  }, []);

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleDeleteQuiz = (id: number) => {
    setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
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
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Manage Quizzes */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Manage Quizzes</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Title</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td className="border border-gray-300 px-4 py-2">{quiz.title}</td>
                <td className="border border-gray-300 px-4 py-2">{quiz.description}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Leaderboards */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Leaderboards</h2>
        <p>Coming soon...</p>
      </section>

      {/* Competitions */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Competitions</h2>
        <p>Coming soon...</p>
      </section>
    </div>
  );
}